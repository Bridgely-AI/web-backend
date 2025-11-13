const express = require('express')
const router = express.Router()
const openaiController = require('../controllers/openaiController')

router.post('/api/gerar-trilha', openaiController.gerarTrilha)
router.post('/api/chat', openaiController.chat)

module.exports = router;