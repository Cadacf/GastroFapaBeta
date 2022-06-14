const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
    email: String,
    nome: String,
    preco: String,
    descricao: String,
    linkimagem: String,
    esp: {
        type: Boolean, 
        default: false
    }
});

const Menu = mongoose.model('Menu', MenuSchema);

module.exports = Menu;