import express, { response } from "express"
import cors from "cors"
import mysql2 from "mysql2"

const {DB_HOST, DB_NAME, DB_USER, DB_PASSWORD} = process.env

const app = express()
const port = 3333

const database = mysql2.createPool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    connectionLimit: 10
})

// Enable CORS for all routes and all methods
app.use(cors());

app.use(express.json())

app.get("/", (request, response) => {
    const selectCommand = "SELECT name, email FROM users"

    database.query(selectCommand, (error, results) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ error: "erro no banco" })
        }

        response.json(results)
    })
})

app.post("/login", (request, response)=>{
    const {email, password} = request.body;


    const selectCommand = "SELECT * FROM users WHERE email = ?"
    database.query(selectCommand, [email], (error, user) => {
        if(error){
            console.log(error)
            return response.status(500).json({ error: "database error" });
        }
        if(user.length === 0 || user[0].password !== password){
            return response.status(401).json({menssage:"Usuario ou senha incorretos"})
        }
        response.json({id: user[0].id, name: user[0].name, token: "dummy-token"})
    })
})

app.post("/cadastrar", (request, response) => {
    const { user } = request.body

    const insertCommand = `
        INSERT INTO users(name, email, password)
        VALUES(?, ?, ?)
    `

    database.query(insertCommand, [user.name, user.email, user.password], (error) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ error: "erro no cadastro" })
        }

        response.status(201).json({ mensage: "usuario cadastrado com sucesso" })
    })
})

// PUT /users/:userId/score - Update user\'s score
app.put("/users/:userId/score", (request, response) => {
    const { userId } = request.params;
    const { score } = request.body;

    if (score === undefined) {
        return response.status(400).json({ error: "Score is required" });
    }

    const selectScoreCommand = "SELECT score FROM users WHERE id = ?";
    database.query(selectScoreCommand, [userId], (error, results) => {
        if (error) {
            console.log("[SCORE UPDATE] Error selecting score:", error);
            return response.status(500).json({ error: "Error getting user score" });
        }

        const currentScore = results[0] ? results[0].score : null;
        console.log(`[SCORE UPDATE] User ${userId} - Current Score: ${currentScore}, New Score: ${score}`);

        if (currentScore === null || score > currentScore) {
            const updateCommand = "UPDATE users SET score = ? WHERE id = ?";
            database.query(updateCommand, [score, userId], (updateError, updateResult) => {
                if (updateError) {
                    console.log("[SCORE UPDATE] Error updating score:", updateError);
                    return response.status(500).json({ error: "error updating score" });
                }
                console.log(`[SCORE UPDATE] Score for user ${userId} updated to ${score}`);
                response.json({ message: "Score updated successfully" });
            });
        } else {
            console.log(`[SCORE UPDATE] Score for user ${userId} not updated, new score is not higher.`);
            response.json({ message: "Score not updated, new score is not higher" });
        }
    });
});


// GET /ranking - Get top 10 scores
app.get("/ranking", (request, response) => {
    const selectCommand = `
        SELECT name, score FROM users
        WHERE score IS NOT NULL
        ORDER BY score DESC
        LIMIT 10
    `

    database.query(selectCommand, (error, results) => {
        if (error) {
            console.log(error)
            return response.status(500).json({ error: "error getting ranking" })
        }

        response.json(results)
    })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
