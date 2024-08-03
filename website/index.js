const express = require('express')
const exphbs = require('express-handlebars')
const cookieparser = require('cookie-parser')

const auth_routes = require('./routes/auth')
const home_routes = require('./routes/home')
const question_routes = require('./routes/question')
const level_routes = require('./routes/level')

const { auth_middleware } = require('./controllers/auth')
const logger = require('./helpers/logging')

// initializations
const app = express()
const port = process.env.PORT || 3000




// view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')



// middleware
app.use(express.static('static'))
app.use(express.json())
app.use(express.text())
app.use(cookieparser())
app.use(auth_middleware)
app.use(logger)



// routes
app.use(auth_routes)
app.use(home_routes)
app.use(question_routes)
app.use(level_routes)




// listen to port
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})