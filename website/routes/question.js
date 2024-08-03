const { Router } = require('express')
const { question, new_hint, download, answer, question_auth } = require('../controllers/question')

const router = Router()

router.get('/question/:id', question_auth, question)
router.get('/question/:id/download', question_auth, download)
router.get('/question/:id/new_hint', question_auth, new_hint)

router.post('/question/:id', question_auth, answer)

module.exports = router