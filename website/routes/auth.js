const { Router } = require('express')
const { login_get, login_post } = require('../controllers/auth')

const router = Router()

router.get('/login', login_get)
router.post('/login', login_post)

module.exports = router