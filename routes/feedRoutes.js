const express = require('express')
const router = express.Router()

const feedController = require('../controllers/feedController')

const { verifyToken } = require('../middleware/authMiddleware')

router.get('/profiles', verifyToken, feedController.getRankedProfiles)
router.get('/companies', verifyToken, feedController.getRankedCompanies)
router.get('/jobs', verifyToken, feedController.getRecommendedJobs)

module.exports = router