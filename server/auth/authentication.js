const express = require('express')
const app = express();
const request = require('request')
const db = require('../database.js')
const jst = require('jsonwebtoken');
const responseJSON = require('../JSONResponse.js')
const msg = require('../Messages.js');
const { parse } = require('dotenv');
require('dotenv').config();

console.log(process.env.SESSION_EXPIRE)
/**
 * TODO: Implement JWT to avoidconstant backend authorize calls
 */
app.post('/auth/*', (req, res, next) => {

    let user_id = req.body.user_id;
    let session_cookie = req.body.session_cookie;

    authenticate(user_id, session_cookie, function(err, result) {
        if (result.length > 0) {
            console.log(msg.ANNOUNCE_OUTLINE_NORM + msg.AUTH_SUCCESS + " PATH: \t\t" + req.path + "\n USER_ID: \t" + user_id + "\n SESSION: \t" + 
                        session_cookie + "\n IP: \t\t" + req.socket.remoteAddress + "\n @ \t\t" + new Date().toLocaleString() + msg.ANNOUNCE_OUTLINE_NORM);
            if (req.path == '/auth' || req.path == '/auth/') {
                res.send(new responseJSON({__status:true, message:msg.VALID_AUTHENTICATION}))
                return;
            } else {
                res.locals.user_id = user_id;
                next()
                return;
            }
        } else {
            console.log(msg.ANNOUNCE_OUTLINE_WARN + msg.AUTH_FAIL + " PATH: \t\t" + req.path + "\n USER_ID: \t" + user_id + "\n SESSION: \t" + 
                        session_cookie + "\n IP: \t\t" + req.socket.remoteAddress + "\n @ \t\t" + new Date().toLocaleString() + msg.ANNOUNCE_OUTLINE_WARN);
            res.send(new responseJSON({__status:false, message:msg.INVALID_AUTHENTICATION, displayable_message:msg.NICE_FAILED_LOGIN}));
        }
    });
});

app.post('/auth/logout', (req, res) => {
    let user_id = req.body.user_id;
    let session_cookie = req.body.session_cookie;
    remove_session_id(user_id, session_cookie, function (error, result) {
    });
});


app.post('/user/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let device_information = req.body.device_information;

    query_user_table(email, password, function(error, result) {
        if (error) {
            res.send(new responseJSON({__status:false, message:msg.SQL_ERROR, hasError:true, errorMessage:error}));
        }

        if (result.length > 0) {
            console.log(eval(process.env.SESSION_EXPIRE))
            console.log(new Date(Date.now() + eval(process.env.SESSION_EXPIRE)))
            request('https://www.random.org/strings/?num=1&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new', (req1, res1) => { 
                let session_cookie = String(res1.body).trim().replace(/\r?\n|\r/g, "");
                res.cookie('session_cookie', session_cookie, {path:'/', signed: false, httpOnly: false, expires  : new Date(Date.now() + eval(process.env.SESSION_EXPIRE)), secure: false});
                res.cookie('user_id', result[0].id, {path:'/', signed: false, httpOnly: false, expires  : new Date(Date.now() + eval(process.env.SESSION_EXPIRE)), secure: false});
                
                create_session_id(result[0].id, session_cookie, device_information, req.socket.remoteAddress, function(csi_err, csi_res) {
                    if (csi_err)
                        res.send(new responseJSON({__status:false, message:msg.SQL_ERROR+' -> Session Server', hasError:true, errorMessage:csi_err}))
                    else {
                        res.send(new responseJSON({__status:true, message:msg.SUCCESS_LOGIN}));
                    }
                });
            });
        } else {
            res.send(new responseJSON({__status:false, message:msg.FAILED_LOGIN, displayable_message:msg.NICE_FAILED_LOGIN}))
        }
    })
});

function create_session_id(user_id, session, device_information, ip, callback) {
    let query = 'INSERT INTO Session_Auth (user_id, session_cookie, device_information, ip, expiry) VALUES(?, ?, ?, ?, ?)';
    db.query(query, [user_id, session, device_information, ip, new Date(Date.now() + eval(process.env.SESSION_EXPIRE))], (err, res) => {
        if (err)
            return callback(err)
        return callback(null, res);
    });
}

function remove_session_id(user_id, session, callback) {
    let query = 'DELETE FROM Session_Auth WHERE user_id = ? AND session_cookie = ?;';
    db.query(query, [user_id, session], (err, res) => {
        if (err)
            return callback(err)
        return callback(null, res);
    });
}

function query_user_table(email, password, callback) {
    let query = 'SELECT * FROM Users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, res) => {
        if (err)
            return callback(err)
        return callback(null, res);
    });
}


app.use('/auth/get/*', (req, res, next) => {
    get_user_sessions(res.locals.user_id, function(err, result) {
        res.locals.sessions = result;
        next();
    });
});

app.post('/auth/get/sessions', (req, res) => {
    get_user_sessions(res.locals.user_id, function(err, result) {
        if (err)
            res.send(new responseJSON({__status:false, hasError:true, errorMessage:err}));
        res.send(new responseJSON({__status:true, req_payload:result}));
    });
});

app.post('/auth/del/session', (req, res) => {
    let user_id = req.body.user_id;
    let session_id = req.body.session_id;

    remove_session(user_id, session_id, function(error, result)  {
        if (error)
            res.send(new responseJSON({__status:false, hasError:true, errorMessage:error}))
        res.send(new responseJSON({__status:true, message:msg.SESSION_DELETED}))    
    });
});

function remove_session(user_id, session_key, callback) {
    let query = 'DELETE FROM Session_Auth WHERE id = ? AND user_id = ?';
    
    db.query(query, [session_key, user_id], (err, res) => {
        if (err)
            return callback(err)
        return callback(null, res);
    });
}

function authenticate(user_id, session_cookie, callback) {
    let query = 'SELECT * FROM Session_Auth WHERE user_id = ? AND session_cookie = ?';
    
    db.query(query, [user_id, session_cookie], (err, res) => {
        if (err)
            return callback(err)
        return callback(null, res);
    });
}

function get_user_sessions(user_id, callback) {
    let query = 'SELECT id, user_id, expiry, device_information, ip, concat(substring(session_cookie, 1, 5),"****") as session_cookie FROM Session_Auth WHERE user_id = ?';

    db.query(query, [user_id], (err, res) => {
        if (err)
            return callback(err)
        return callback(null, res);
    });
}

module.exports = app