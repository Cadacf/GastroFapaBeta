const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    nome: String,
    email: String,
    senha: String,
    descricao: String,
    bglink: String,
    mapalink: String,
    horario: String,
    telefone: String,
    menu: [{type: mongoose.Schema.Types.ObjectId, ref: 'Menu'}]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;