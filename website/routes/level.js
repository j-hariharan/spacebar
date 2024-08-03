const { Router } = require('express')
const { level } = require('../controllers/level')

const router = Router()

router.get('/level/:id', level)

module.exports = router