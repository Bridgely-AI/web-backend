const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { verifyToken } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/register', upload.single('photo'), authController.register)
router.post('/login', authController.login)
router.get('/profile', verifyToken, authController.getProfile)
router.get('/profile/:id', authController.getUserById)
router.patch('/profile/:id', verifyToken, authController.updateProfile)
router.post('/profile/recommend/:id', verifyToken, authController.recommendProfile)
router.post('/profile/message/:id', verifyToken, authController.sendMessage)
router.get('/messages', verifyToken, authController.getAllMessages)

module.exports = router