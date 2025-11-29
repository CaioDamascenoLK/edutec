import express from "express"
import cors from "cors"
import mysql2 from "mysql2"


const {DB_HOST, DB_NAME, DB_USER, DB_PASSWORD} = process.env

const database = mysql2.createPool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    connectionLimit: 10
})

const app = express()
const port = 3333

app.use(cors())
app.use(express.json())

app.get("/", (request,response) => {
    const selectCommand = "SELECT name, email FROM caiodamasceno_02mbti"
    database.query(selectCommand, (error, results) => {
        if(error){
            console.log(error)
            response.status(500).send("Error fetching users")
            return
        }
        console.log(results)
        response.json(results)
    })
})

app.post("/cadastrar", (request, response) => {
    const { user } = request.body

    console.log(user)

    const insertCommand = `
        INSERT INTO caiodamasceno_02mbti(name, email, password)
        VALUES(?, ?, ?)
    `

    database.query(insertCommand, [user.name, user.email, user.password], (error) => {
        if(error){
            console.log(error)
            response.status(500).send("Error creating user")
            return
        }
        response.status(201).json({mensage: "usuario cadastrado com sucesso"})
    })

})

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})
