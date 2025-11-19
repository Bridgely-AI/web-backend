const express = require('express')
const router = express.Router()
const aiController = require('../controllers/aiController')
const { verifyToken } = require('../middleware/authMiddleware')

router.post('/studyplan', verifyToken, aiController.generateStudyPlan)

module.exports = router