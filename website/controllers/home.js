const { levels, questions } = require('../helpers/firebase')

module.exports.home_get = async (req, res) => {
    const participant = req.participant

    const { username, points, id } = participant

    const levels_applicable =
    await levels
    .where('participants', 'array-contains', id)
    .where('opened', '==', true)
    .orderBy('deadline')
    .get()


    const levels_data = 
    await Promise.all(levels_applicable.docs.map(async doc => {
        let id = doc.id

        let data = await doc.data()

        return {
            ...data,
            id,
            finished: (new Date()).getTime() > data.deadline._seconds*1000
        }
    }))

    res.render('home', {
        levels: levels_data
    })
}