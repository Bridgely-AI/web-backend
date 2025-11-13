require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path');

const authRoutes = require('./routes/authRoutes')

const app = express()
const port = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.use('/', authRoutes)

app.listen(port, () => {
   console.log(`Server running in http://localhost:${port}`)
})