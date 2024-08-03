const admin = require("firebase-admin")
const serviceAccount = require("../goonjspacebar.serviceaccount.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const participants = db.collection('participants')
const levels = db.collection('levels')
const questions = db.collection('questions')

module.exports = { db, participants, levels, questions }