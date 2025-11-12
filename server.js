require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path');

const authRoutes = require('./routes/authRoutes')
const postsRoutes = require('./routes/postsRoutes')
const matchesRoutes = require('./routes/matchesRoutes')
const searchRoutes = require('./routes/searchRoutes')

const app = express()
const port = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.listen(port, () => {
   console.log(`Server running in http://localhost:${port}`)
})