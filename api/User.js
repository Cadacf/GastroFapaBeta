const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

//MongodDb user model
const User = require('./../models/User');
const Menu = require('./../models/Menu');
//Password
const bcrypt = require('bcrypt');
const Session = require('../models/Session');
const { Model } = require('mongoose');
const path = require("path");
/*
router.get('/p/:nome', function(req, res) {
    User.findOne({ 'nome': req.params.nome }, function (err, data) {
        res.setHeader('Email', data.email)
        //console.log(res);
        res.redirect(301,"/menu/");
    });
});
*/

//Signup
router.post('/signup', (req, res) => {
    let { nome, email, senha, descricao, bglink, mapalink, horario, telefone } = req.body;
    nome = nome.trim();
    email = email.trim();
    senha = senha.trim();
    descricao = descricao.trim();
    bglink = bglink.trim();
    mapalink = mapalink.trim();
    horario = horario.trim();
    telefone = telefone.trim();

    if (nome == "" || email == "" || senha == "" || descricao == "") {
        res.json({
            status: "Falha",
            message: "Campo vazio!"
        });
    } else if (!/^[a-zA-Z0-9_ ]*$/.test(nome)) {
        res.json({
            status: "Falha",
            message: "Nome invalido"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "Falha",
            message: "Email invalido"
        })
    } else if (senha.length < 8) {
        res.json({
            status: "Falha",
            message: "A senha esta muito curta"
        })
    } else {
        // Checando a existencia do usuário
        User.find({ email }).then(result => {
            if (result.length) {
                //Usuario existe
                res.json({
                    status: "Falha",
                    message: "Email já cadastrado"
                })
            } else {
                const saltRounds = 10;
                bcrypt.hash(senha, saltRounds).then(hashedSenha => {
                    const newUser = new User({
                        nome,
                        email,
                        senha: hashedSenha,
                        descricao,
                        mapalink,
                        bglink,
                        horario,
                        telefone
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "Sucesso",
                            message: "Conectado com sucesso",
                            data: result,
                        })
                    })
                        .catch(err => {
                            res.json({
                                status: "Falha",
                                message: "Ocorreu um erro no salvamento de sua conta"
                            })
                        })
                })
                    .catch(err => {
                        res.json({
                            status: "Falha",
                            message: "Ocorreu um erro na senha"
                        })
                    })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "Falha",
                message: "Ocorreu um erro (Sg)"
            })
        })
    }

})

//Update
router.post('/update', function (req, res, next) {
    const token = req.header('X-Access-Token');
    jwt.verify(token, process.env.SECRET, function (errorVerify, decoded) {
        console.log(decoded);
        console.log(decoded.exp);
        console.log(decoded.iat);
        let expData = new Date();
        let isTime = new Date();
        expData.setTime = new Date(decoded.exp);
        isTime.setTime = new Date(decoded.iat);
        console.log(expData);
        console.log(isTime);
        if (errorVerify) {
            res.json({
                status: "Falha",
                message: "Ocorreu um erro (update)"
            })
        } else {
            Session.find({ 'email': decoded.id }, function (errorSession, data) {
                if (data.length > 0) {

                    User.findOne({ 'email': decoded.id }, function (errorUser, funduser) {

                        console.log(funduser.email);
                        if (errorUser || funduser == null) {
                            return res.json({
                                status: "erro",
                                message: "Documento vazio (User Update)",
                            })
                        } else if (decoded.id == funduser.email) {

                            funduser.nome = req.body.nome;
                            funduser.descricao = req.body.descricao;
                            funduser.bglink = req.body.bglink;
                            funduser.mapalink = req.body.mapalink;
                            funduser.horario = req.body.horario;
                            funduser.telefone = req.body.telefone;

                            funduser.save();

                            return res.json({
                                status: "Sucesso",
                                message: "Usuário atualizado (User Update)",
                            })
                        } else {
                            return res.json({
                                status: "erro",
                                message: "Usuário não corresponde (User Update)",
                            })
                        }
                    })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Usuário invalido (User Update)"
                    })
                }
            });
        }
    })
})

//Signin
router.post('/signin', (req, res) => {
    console.log(req.body);
    let { email, senha } = req.body;
    email = email.trim();
    senha = senha.trim();


    if (email == "" || senha == "") {
        res.json({
            status: "Falha",
            message: "Credenciais vazias"
        })
    } else {
        //Checando a existencia do usuário
        User.find({ email })
            .then(data => {
                if (data.length) {
                    //Usuário existe

                    const hashedSenha = data[0].senha;
                    bcrypt.compare(senha, hashedSenha).then(result => {
                        if (result) {
                            //senha encontrada
                            const id = data[0].email
                            const token = jwt.sign({ id }, process.env.SECRET, {
                                expiresIn: '30m' // expires in 5min
                            });
                            let item = {
                                email: id,
                                token: token
                            };
                            Session.find({ 'email': id }, function (err, data) {
                                //console.log(data)
                                if (data.length > 0) {
                                    /*
                                    res.json({
                                        success: true,
                                        message: 'Enjoy your token!',
                                        token: token // este token é para guardar!
                                    });
                                    */
                                    //console.log(token)
                                    res.cookie("userToken", token);
                                    res.redirect('/menu/perfil')
                                } else {
                                    let data = new Session(item);
                                    data.save();
                                    /*
                                    res.json({
                                        success: true,
                                        message: 'Enjoy your token!',
                                        token: token // este token é para guardar!
                                    });
                                    */
                                    res.cookie("userToken", token);
                                    res.redirect('/menu/perfil')
                                }
                            });
                        } else {
                            res.json({
                                status: "Falha",
                                message: "Senha invalida"
                            })
                        }
                    })
                        .catch(err => {
                            res.json({
                                status: "Falha",
                                message: "Erro na comparacao de senha"
                            })
                        })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Credenciais invalidas"
                    })
                }
            })
            .catch(err => {
                res.json({
                    status: "Falha",
                    message: "Erro na verificacao de existencai do usuario"
                })
            })
    }
})

//logout
router.get('/logout', (req, res) => {
    const token = req.header('X-Access-Token');
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            res.json({
                status: "Falha",
                message: "Ocorreu um erro (Lg)"
            })
        } else {
            Session.find({ 'email': decoded.id }, function (err, data) {
                if (data.length > 0) {
                    Session.findByIdAndRemove(data[0]._id).exec();
                    res.json({
                        status: "Sucesso",
                        message: "Deslogado"
                    })
                } else {
                    res.json({
                        status: "Falha",
                        message: "Não está logado"
                    })
                }
            })
        }
    })
})

module.exports = router;