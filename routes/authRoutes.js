const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { verifyToken } = require('../middleware/authMiddleware')

module.exports = router