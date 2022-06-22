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

/*
router.get('/e/:nome', function (req, res) {
    User.findOne({ 'nome': req.params.nome }, function (err, user) {
        Menu.find({ 'email': user.email }, function (errorFindById, menus) {
            res.render(path.join(__dirname + "/../public/views/index-editar.ejs"), { pratos: menus, restaurante: user });
        })
    });
});
*/

router.get('/perfil', function (req, res) {
    //console.log(req.cookies['userToken'])
    const token = req.cookies['userToken']
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            console.log("Er (perfil)")
            res.redirect('/')
        } else {
            Session.find({ 'email': decoded.id }, function (err, data) {
                if (data.length > 0) {
                    User.findOne({ 'email': decoded.id }, function (errorUser, user) {
                        Menu.find({ 'email': user.email }, function (errorFindById, menus) {
                            res.render(path.join(__dirname + "/../public/views/index-editar.ejs"), { pratos: menus, restaurante: user });
                        })
                    })
                } else {
                    console.log("Er 2 (perfil)")
                    res.redirect('/')
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
    const token = req.cookies['userToken']
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        if (errorVerify) {
            console.log("Erro na criação de menus (new)")
            res.redirect('/menu/perfil')
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
                            esp: req.body.esp ? true : false,
                        };

                        let user = new User(funduser);
                        let menu = new Menu(item);

                        user.menu.push(menu);

                        user.save();
                        menu.save();

                        console.log("Menu Criado (new)")
                        res.redirect('/menu/perfil')
                    })
                } else {
                    console.log("Erro sessão não encontrada (new)")
                    res.redirect('/menu/perfil')
                }
            });
        }
    })
})

router.post('/edit', (req, res) => {
    const token = req.cookies['userToken']
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        if (errorVerify) {
            console.log("Erro na edição de menus (edit)")
            res.redirect('/menu/perfil')
        } else {
            Session.find({ 'email': decoded.id }, function (errorSession, data) {
                if (data.length > 0) {
                    let id = req.body._id;
                    console.log(id)

                    Menu.findById(id, function (errorFindById, doc) {
                        if (errorFindById || doc == null) {
                            console.log("Menu não encontrado (edit)")
                            res.redirect('/menu/perfil')
                        } else if (decoded.id == doc.email) {
                            doc.nome = req.body.nome;
                            doc.preco = req.body.preco;
                            doc.descricao = req.body.descricao;
                            doc.linkimagem = req.body.linkimagem;
                            doc.esp = req.body.esp;
                            doc.save();
                            console.log("Menu Criado (new)")
                            res.redirect('/menu/perfil')
                        } else {
                            console.log("Usuário não corresponde (edit)")
                            res.redirect('/menu/perfil')
                        }
                    })
                } else {
                    console.log("Usuário invalido (edit)")
                    res.redirect('/menu/perfil')
                }
            });
        }
    })
});

router.post('/delete', (req, res) => {
    const token = req.cookies['userToken']
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        if (errorVerify) {
            console.log("Erro na exclusão de menus (edit)")
            res.redirect('/menu/perfil')
        } else {
            Session.find({ 'email': decoded.id }, function (errorSession, data) {
                if (data.length > 0) {
                    let id = req.body._id;

                    Menu.findById(id, function (errorFindById, doc) {
                        if (errorFindById || doc == null) {
                            console.log("Menu não encontrado (delete)")
                            res.redirect('/menu/perfil')
                        } else if (decoded.id == doc.email) {
                            User.findOne({ 'email': decoded.id }, function (errorDelet, user) {
                                if (errorDelet) {
                                    console.log("Usuário não encontrado (delete)")
                                    res.redirect('/menu/perfil')
                                } else {
                                    Menu.findByIdAndRemove(id).exec();
                                    const index = user.menu.indexOf(doc._id);
                                    if (index > -1) {
                                        user.menu.splice(index, 1);
                                    }
                                    user.save();
                                    console.log("Menu deletado com sucesso (delet)")
                                    res.redirect('/menu/perfil')
                                }
                            })
                        } else {
                            console.log("Usuário não corresponde (delet)")
                            res.redirect('/menu/perfil')
                        }
                    })
                } else {
                    console.log("Usuário invalido (delet)")
                    res.redirect('/menu/perfil')
                }
            });
        }
    })
});

module.exports = router;