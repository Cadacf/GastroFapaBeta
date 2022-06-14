const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

//MongodDb user model
const User = require('./../models/User');

//Password
const bcrypt = require('bcrypt');
const Session = require('../models/Session');
const { Model } = require('mongoose');

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
                message: "Ocorreu um erro"
            })
        })
    }

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
                                expiresIn: 30000 // expires in 5min
                            });
                            let item = {
                                email: id,
                                token: token
                            };
                            Session.find({ 'email': id }, function (err, data) {
                                if (data.length > 0) {
                                    return res.json({
                                        status: "Falha",
                                        message: "Usuário já logado"
                                    })
                                } else {
                                    let data = new Session(item);
                                    data.save();
                                    return res.json({ auth: true, token: token });
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
                message: "Ocorreu um erro"
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