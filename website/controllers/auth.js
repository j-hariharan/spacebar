const jwt = require('jsonwebtoken')
const send = require('../helpers/send')
const { participants } = require('../helpers/firebase')

const SECRET = "PTXylEcSRzX07RKE3Yk1"
const MAXAGE = 1 * 24 * 60 * 60


const createToken = (id) => {
    return jwt.sign({ id }, SECRET, {
        expiresIn: MAXAGE
    })
}

module.exports.auth_middleware = (req, res, next) => {
    const token = req.cookies.auth

    function handleerrors () {
        if (req.path == '/login') {
            next()
        }
        else {
            res.redirect('/login')
        }
    }
    
    try {
        if (token) {
            jwt.verify(token, SECRET, async (err, decoded_token) => {
                if (err) {
                    handleerrors()
                }
                else {
                    const username = decoded_token.id
                    
                    const q = participants.where('username', '==', username)
                    const qs = await q.get()
                    const doc = qs.docs[0]

                    const data = {
                        id: doc.id,
                        ...doc.data()
                    }

                    req.participant = { ...data }

                    next()
                }
            })
        }
        else {
            throw new Error('no jwt found')
        }
    }
    catch (err) {
        handleerrors()
    }
}


module.exports.login_get = (req, res) => {
    res.render('login')
}

module.exports.login_post = async (req, res) => {
    const body = req.body

    if (!body) {
        send(res, 400)
        return
    }

    const { username, password } = body

    const q = participants.where('username', '==', username)
    const qs = await q.get()

    if (qs.docs.length == 0) {
        send(res, 400, 'wrong username')
        return
    }

    const doc = qs.docs[0]

    if (doc.get('password') != password) {
        send(res, 400, 'wrong password')
        return
    }

    res.cookie('auth', createToken(username), {
        httpOnly: true,
        maxAge: MAXAGE * 1000
    })

    send(res, 200, { username })
}