const { questions, levels, participants } = require("../helpers/firebase")
const send = require("../helpers/send")
const fetch = require("node-fetch")




module.exports.question = async (req, res) => {
    const q_doc = req.q_doc
    const { pq_doc, level_doc } = req

    let data = await q_doc.data()
    let hints = data.hints || []

    let hints_len = pq_doc.get('hints')
    let hints_left = true

    if (hints_len == hints.length || pq_doc.get('answered')) {
        hints_left = false
    }

    hints = hints.slice(0, hints_len)
    data.hints = hints
    data.answered = pq_doc.get('answered')
    data.hints_left = hints_left
    
    res.render('question', {
        ...data,
        id: q_doc.id,
        deadline: level_doc.get('deadline'),
        level_id: level_doc.id
    })
}



module.exports.download = async (req, res) => {
    const q_doc = req.q_doc

    const url = q_doc.get('download')
    
    const fileres = await fetch(url)
    const file = await fileres.buffer()

    res.send(file)
    
}


module.exports.answer = async (req, res) => {
    const q_doc = req.q_doc
    const correct_answer = q_doc.get('answer')
    const level = q_doc.get('level')

    const response = req.body

    if (!response) {
        send(res, 400)
        return
    }
    
    let { pq_ref, pq_doc } = req

    await pq_ref
    .collection('responses')
    .add({
        response,
        timestamp: new Date()
    })

    if (pq_doc.get('answered')) {
        send(res, 400)
        return
    }

    if (response == correct_answer) {
        await pq_ref.update({
            answered: true,
            total_points: (pq_doc.get('total_points') || 0) + q_doc.get('points')
        })

        pq_doc = await pq_ref.get()

        let { id, points } = req.participant

        if (!points[level]) {
            points[level] = 0
        }

        points[level] += pq_doc.get('total_points')

        await participants.doc(id).update({ points })

        send(res, 201)
    } 
    
    else {
        send(res, 200)
    }
}



module.exports.new_hint = async (req, res) => {
    const pid = req.participant.id
    const qid = req.qid
    let q_doc = req.q_doc

    const pq_ref = participants
    .doc(pid)
    .collection('questions')
    .doc(qid)

    const pq_doc = await pq_ref.get()
    const old_hints = pq_doc.get('hints')
    const old_points = pq_doc.get('total_points') || 0

    await pq_ref.update({ 
        hints: old_hints + 1, 
        total_points: old_points - q_doc.get('hints')[old_hints].points_reduced
    })

    res.redirect('../'+qid)
}


module.exports.question_auth = async (req, res, next) => {
    const qid = req.params.id
    const participant = req.participant

    const q_doc = await questions.doc(qid).get()

    if (!q_doc.exists) {
        send(res, 400)
        return
    }

    const level = q_doc.get('level')

    const level_doc = await levels.doc(level).get()
    
    const includes_participant = level_doc.get('participants').includes(participant.id)
    const opened = level_doc.get('opened')
    const finished = (new Date()).getTime() > level_doc.get('deadline')._seconds*1000

    if (!includes_participant || !opened || finished) {
        send(res, 400)
        return
    }

    const pq_ref = participants.doc(participant.id)
    .collection('questions')
    .doc(qid)

    let pq_doc = await pq_ref.get()
    
    if (!pq_doc.exists) {
        await pq_ref.set({
            answered: false,
            hints: 0,
            total_points: 0,
            level: level
        })

        pq_doc = await pq_ref.get()
    }

    req.q_doc = q_doc
    req.qid = qid
    req.pq_doc = pq_doc
    req.pq_ref = pq_ref
    req.level_doc = level_doc

    next()
}