module.exports = (res, code, body) => {
    if (!body) {
        switch (code) {
            case 200: body = 'success'; break
            case 400: body = 'bad requst'; break
            case 500: body = 'server error'; break
        }
    }

    res.status(code).send(body)
} 