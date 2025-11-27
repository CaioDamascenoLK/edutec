require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();


app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Middleware for authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

let connection;

async function connectToDatabase() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');

        // Create users table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);
        
        // Create ranking table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS ranking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                score INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    } catch (error) {
        console.error('Error connecting to or creating table in the database:', error);
        process.exit(1);
    }
}

// Signup route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Username, email and password are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).send('User successfully registered');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Email already registered');
        }
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error');
    }
});


// Get ranking
app.get('/ranking', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT u.username as name, r.score 
            FROM ranking r 
            JOIN users u ON r.userId = u.id 
            ORDER BY score DESC LIMIT 10
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error reading ranking from database:', error);
        res.status(500).send('Server error');
    }
});

// Add new score
app.post('/ranking', authenticateToken, async (req, res) => {
    try {
        const { score } = req.body;
        if (typeof score !== 'number') {
            return res.status(400).send('Invalid score');
        }
        const { userId, username } = req.user;
        await connection.execute('INSERT INTO ranking (userId, score) VALUES (?, ?)', [userId, score]);
        res.status(201).json({ name: username, score });

    } catch (error) {
        console.error('Error saving score to database:', error);
        res.status(500).send('Server error');
    }
});

async function startServer() {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();