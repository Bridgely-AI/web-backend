require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path');
const openaiRoutes = require('./routes/openaiRoutes')

const authRoutes = require('./routes/authRoutes')

const app = express()
const port = process.env.PORT || 5001

// Iniciar servidor
app.listen(port, () => {
  console.log(`✔️ Backend rodando em http://localhost:${port}`);
  console.log(`✅ CORS habilitado para http://localhost:3000`);
});

app.use(cors())
app.use(express.json())

app.use('/', authRoutes)
app.use('/', openaiRoutes)