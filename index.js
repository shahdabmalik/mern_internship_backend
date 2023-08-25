require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Transaction = require('./models/transactions')
const router = require('./routes/routes')

const app = express()
const PORT = process.env.PORT

// middlewares
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL
}))

// routes
app.use("/api", router)

// Database 
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => { console.log(`Server Stated, Database Connected ${PORT}`); })
    })
    .catch((err) => console.log("Error occured while connecting to database"))
