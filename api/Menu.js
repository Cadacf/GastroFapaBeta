const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

//MongodDb user model
const Menu = require('./../models/Menu');
const path = require("path");
const Session = require('../models/Session');
const User = require('./../models/User');

router.get('/p/:nome', function (req, res) {
    User.findOne({ 'nome': req.params.nome }, function (err, user) {
        Menu.find({ 'email': user.email }, function (errorFindById, menus) {
            res.render(path.join(__dirname + "/../public/views/index.ejs"), { pratos: menus, restaurante: user });
        })
    });
});

router.get('/e/:nome', function (req, res) {
    User.findOne({ 'nome': req.params.nome }, function (err, user) {
        Menu.find({ 'email': user.email }, function (errorFindById, menus) {
            res.render(path.join(__dirname + "/../public/views/index-editar.ejs"), { pratos: menus, restaurante: user });
        })
    });
});

router.get('/perfil', function (req, res) {
    const token = req.header('X-Access-Token');
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            res.json({
                status: "Falha",
                message: "Ocorreu um erro"
            })
        } else {
            Session.find({ 'email': decoded.id }, function (err, data) {
                if (data.length > 0) {
                    User.findOne({ 'email': decoded.id }, function (errorUser, funduser) {
                        res.render(path.join(__dirname + "/../public/views/index-editar.ejs"), { pratos: menus });
                    })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Não está logado"
                    });
                }
            });
        }
    });
});

/*
router.get('/', (req, res) => {

    //console.log(req)

    let especiais = [
        { id: 1 ,nome: "Arroz", descricao: "Arroz branco e seco", preco: 20 },
        { id: 2 ,nome: "Batata", descricao: "Arroz branco e seco", preco: 20 },
        { id: 3 ,nome: "Churras", descricao: "Arroz branco e seco", preco: 20 },
        { id: 4 ,nome: "Pernil", descricao: "Arroz branco e seco", preco: 20 },
        { id: 5 ,nome: "Feijao", descricao: "PQP HORREI CORN", preco: 20 }
    ];
    let pratos = [
        { nome: "Arroz", descricao: "Arroz branco e seco", preco: 20 },
        { nome: "Feijao", descricao: "PQP HORREI CORN", preco: 20 }
    ];

    Menu.find()
        .then(results => {
            res.render(path.join(__dirname + "/../public/views/index.ejs"), { pratos: pratos, especiais: especiais });
        })
        .catch(error => console.error(error))
})
*/

/*router.get('/editar', (req, res) => {

    var especiais = [
        { nome: "Arroz", descricao: "Arroz branco e seco", preco: 20 },
        { nome: "Batata", descricao: "Arroz branco e seco", preco: 20 },
        { nome: "Churras", descricao: "Arroz branco e seco", preco: 20 },
        { nome: "Pernil", descricao: "Arroz branco e seco", preco: 20 },
        { nome: "Feijao", descricao: "PQP HORREI CORN", preco: 20 }
    ];
    var pratos = [
        { nome: "Arroz", descricao: "Arroz branco e seco", preco: 20 },
        { nome: "Feijao", descricao: "PQP HORREI CORN", preco: 20 }
    ];

    Menu.find()
        .then(results => {
            res.render(path.join(__dirname + "/../public/views/index-editar.ejs"), { pratos: pratos, especiais: especiais });
        })
        .catch(error => console.error(error))
})
*/

router.post('/new', (req, res) => {
    const token = req.header('X-Access-Token');
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        if (errorVerify) {
            res.json({
                status: "Falha",
                message: "Ocorreu um erro (new)"
            })
        } else {
            Session.find({ 'email': decoded.id }, function (errorSession, data) {
                if (data.length > 0) {

                    User.findOne({ 'email': decoded.id }, function (errorUser, funduser) {

                        let item = {
                            email: decoded.id,
                            nome: req.body.nome,
                            preco: req.body.preco,
                            descricao: req.body.descricao,
                            linkimagem: req.body.linkimagem,
                            esp: req.body.esp
                        };

                        let user = new User(funduser);
                        let menu = new Menu(item);

                        user.menu.push(menu);

                        user.save();
                        menu.save();

                        res.json({
                            status: "foi",
                            message: "Mesmo (new)",
                            //data: menu
                        })
                    })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Usuário invalido (new)"
                    })
                }
            });
        }
    })
})

router.post('/edit', function (req, res, next) {
    const token = req.header('X-Access-Token');
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        if (errorVerify) {
            res.json({
                status: "Falha",
                message: "Ocorreu um erro (edit)"
            })
        } else {
            Session.find({ 'email': decoded.id }, function (errorSession, data) {
                if (data.length > 0) {
                    let id = req.body._id;

                    Menu.findById(id, function (errorFindById, doc) {
                        if (errorFindById || doc == null) {
                            return res.json({
                                status: "erro",
                                message: "Deu merda (edit)",
                            })
                        } else if (decoded.id == doc.email) {
                            doc.nome = req.body.nome;
                            doc.preco = req.body.preco;
                            doc.descricao = req.body.descricao;
                            doc.save();
                            return res.json({
                                status: "Sucesso",
                                message: "Editou",
                            })
                        } else {
                            return res.json({
                                status: "erro",
                                message: "Usuário não corresponde (edit)",
                            })
                        }
                    })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Usuário invalido (edit)"
                    })
                }
            });
        }
    })
});

router.post('/delete', function (req, res, next) {

    const token = req.header('X-Access-Token');
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        if (errorVerify) {
            res.json({
                status: "Falha",
                message: "Ocorreu um erro"
            })
        } else {
            Session.find({ 'email': decoded.id }, function (errorSession, data) {
                if (data.length > 0) {
                    let id = req.body._id;

                    Menu.findById(id, function (errorFindById, doc) {
                        if (errorFindById || doc == null) {
                            return res.json({
                                status: "erro",
                                message: "Deu merda (delet)",
                            })
                        } else if (decoded.id == doc.email) {
                            User.findOne({ 'email': decoded.id }, function (errorDelet, user) {
                                if (errorDelet) {
                                    return res.json({
                                        status: "erro",
                                        message: "Não conseguio deletar",
                                    })
                                } else {
                                    Menu.findByIdAndRemove(id).exec();
                                    const index = user.menu.indexOf(doc._id);
                                    if (index > -1) {
                                        user.menu.splice(index, 1);
                                    }
                                    user.save();
                                    return res.json({
                                        status: "Sucesso",
                                        message: "Deletado",
                                    })
                                }
                            })
                        } else {
                            return res.json({
                                status: "erro",
                                message: "Usuário não corresponde (delet)",
                            })
                        }
                    })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Usuário invalido (delet)"
                    })
                }
            });
        }
    })
});

module.exports = router;