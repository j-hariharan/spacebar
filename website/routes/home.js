const { Router } = require('express')
const { home_get } = require('../controllers/home')

const router = Router()

router.get('/', home_get)

module.exports = router