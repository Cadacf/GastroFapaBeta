const express = require('express');
const app = express();

const User = require('./models/User');
//MongoDB
require('./config/db');


app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 3000;

const UserRouter = require('./api/User');
const MenuRouter = require('./api/Menu');

const bodyParser = require('express').json;
const path = require("path");

app.set('view engine', 'ejs');

app.use(express.urlencoded({ 
    extended:true
}));

app.use(bodyParser());
var cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(express.static('public'))
app.use('/user', UserRouter)
app.use('/menu', MenuRouter)

app.get("/", async (req, res) => {
    User.find()
    .then(results => {
        res.render(path.join(__dirname + "/public/views/index-inicial.ejs"), {restaurantes: results});
    })
    .catch(error => console.error(error)) 
});

let cors = require("cors");
const { patch } = require('./api/Menu');
const { userInfo } = require('os');
app.use(cors());

app.listen(PORT, () => {
    console.log(`O servidor está rodando na porta ${PORT}`);
})
