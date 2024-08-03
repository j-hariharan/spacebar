const { levels, questions, participants } = require("../helpers/firebase")
const send = require('../helpers/send')


module.exports.level = async (req, res) => {
    const lid = req.params.id
    const participant = req.participant

    const level_doc = await levels.doc(lid).get()

    if (!level_doc.exists) {
        send(res, 400)
        return
    }
    
    const includes_participant = level_doc.get('participants').includes(participant.id)
    const opened = level_doc.get('opened')
    const finished = (new Date()).getTime() > level_doc.get('deadline')._seconds*1000

    if (!includes_participant || !opened || finished) {
        send(res, 400)
        return
    }

    let qs = await questions
    .where('level', '==', lid)
    .orderBy('points')
    .orderBy('name')
    .get()
    
    let pq_qs = await 
    participants
    .doc(participant.id)
    .collection('questions')
    .where('level', '==', lid)
    .get()

    let pq = pq_qs.docs
    let pq_ids = pq.map(doc => doc.id)

    let data = await Promise.all(qs.docs.map(async doc => {
        let d = await doc.data()
        let i = pq_ids.indexOf(doc.id)

        if (i != -1) {
            d.answered = pq[i].get('answered') ? " ✔️ " : " "
        }
        else {
            d.answered = " "
        }

        return {
            id: doc.id,
            ...d
        }
    }))

    res.render("level/"+lid, {
        questions: data,
        id: lid,
        deadline: level_doc.get('deadline'),
        name: level_doc.get('name')
    })

}