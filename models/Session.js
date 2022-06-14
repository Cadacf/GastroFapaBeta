const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    email: String,
    token: String
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;