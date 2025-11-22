require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path');

const authRoutes = require('./routes/authRoutes')
const feedRoutes = require('./routes/feedRoutes')
const aiRoutes = require('./routes/aiRoutes')

const app = express()
const port = process.env.PORT || 5002

app.use(cors())
app.use(express.json())

app.use('/userImages', express.static(path.join(__dirname, 'public', 'userImages')))
app.use('/', authRoutes)
app.use('/feed', feedRoutes)
app.use('/api', aiRoutes)

app.listen(port, () => {
   console.log(`Server running in http://localhost:${port}`)
})