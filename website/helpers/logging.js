const { participants } = require("./firebase")

module.exports = (req, res, next) => {
    const endpoint = `${req.method} ${req.originalUrl}`
    const participant = req.participant

    console.log(endpoint)

    if (participant) {
        let doc = 
        participants.doc(participant.id)
        .collection('logs').add({
            endpoint,
            timestamp: new Date()            
        })
    }

    next()
}