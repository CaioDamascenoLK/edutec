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

app.use(cors())
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
