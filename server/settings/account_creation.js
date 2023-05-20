const express = require('express')
const app = express();
const request = require('request')
const db = require('../database.js');
const JSONResponse = require('../JSONResponse.js');

const responseJSON = require('../JSONResponse.js')
const msg = require('../Messages.js')

app.post('/auth/settings/set/account_creation', async (req, res) => {
    let enableAccountCreation = req.body.enableAccountCreation;
    let enableTemporaryAccountCreation = req.body.enableTemporaryAccountCreation;
    let key;

    set_account_creation(enableAccountCreation, function(error, result) {
        if (error)
            res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));
    });

    if (!enableTemporaryAccountCreation) {
        console.log(1111)
        set_onetime_account_creation(false, null, (error, result) => {
            if (error)
                res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));
        });
    } else {
        let checkKey1 = await checkKey();
        key = checkKey1[0][0].setting_value == '1' ?  checkKey1[0][0].setting_value2 : await getKey();

        set_onetime_account_creation(enableTemporaryAccountCreation, key, (error, result) => {
            if (error)
                return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.RANDOM_ORG_ERROR, req_payload: error}));
        });
    }
    return res.send(new JSONResponse({__status:true, message:msg.SQL_SUCCESS, req_payload: {key: key}}));      
});

app.post('/auth/settings/get', (req, res) => {
    let query = 'SELECT * FROM Settings';
    db.query(query, (error, result) => {
        if (error)
            return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));
        return res.send(new JSONResponse({__status:true, message:msg.SQL_SUCCESS, req_payload: result}));     
    })
});

app.post('/create_account', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let key = req.body.key;

    console.log(1)

    let accCreationEnabled = await new Promise((resolve, reject) => {
        get_account_creation_status((error, result) => {
            if (error)
                reject(error)
            resolve(result)
        })});

        console.log(accCreationEnabled[1])

    if (!accCreationEnabled)
        return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));
    
    if (accCreationEnabled[0].setting_value == '0')
        return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.ACCOUNT_CREATION_DISABLED_ERROR}));

    if (accCreationEnabled[1].setting_value == '0') { // key not required
        create_account(email, password, (error, result) => {
            if (error)
                return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));
            return res.send(new JSONResponse({__status:true, message:msg.SQL_SUCCESS, req_payload: result}));
        });
    } else { // key required
        let checkKey1 = await checkKey();
        let currentKey = checkKey1[0][0].setting_value2;
        if (key == currentKey) {
            create_account(email, password, (error, result) => {
                if (error)
                    return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));

                // disabled after account creation
                set_account_creation(false, ()=>{});
                set_onetime_account_creation(false, null, ()=>{});
                return res.send(new JSONResponse({__status:true, message:msg.SQL_SUCCESS, req_payload: result}));
            });
        } else {
            return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.ACCOUNT_KEY_MISMATCH_ERROR}));
        }
    }
})

app.get('/settings/get/account_creation_enabled', (req, res) => {
    get_account_creation_status((error, result) => {
        if (error)
            return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.SQL_ERROR, req_payload: error}));
        return res.send(new JSONResponse({__status:true, message:msg.SQL_SUCCESS, req_payload: result}));  
    })
});

async function checkKey() {
    let query = 'SELECT setting_value, setting_value2 FROM Settings ' +
    'WHERE setting_name = \'enableTemporaryAccountCreation\'';

    return db.promise().query(query);
}

async function getKey() {
    return await new Promise(async function (resolve, reject) {
        request('https://www.random.org/strings/?num=1&len=6&digits=on&upperalpha=on&loweralpha=off&unique=on&format=plain&rnd=new', (error, result, body) => {
            if (error)
                reject(error)
            resolve(String(body).trim().replace(/\r?\n|\r/g, ""))
        })
    });
}

function set_account_creation(setEnable, callback) {
    let query = 'UPDATE Settings SET setting_value = ? WHERE setting_name = \'enableAccountCreation\''
    db.query(query, [setEnable==true? '1' : '0'], (error, result) => {
        if (error)
            return callback(error)
        return callback(null, result);
    })
}

function set_onetime_account_creation(setOneTimeOnly, key, callback) {
    let query = 'UPDATE Settings SET setting_value = ?, setting_value2 = ? WHERE setting_name = \'enableTemporaryAccountCreation\''
    db.query(query, [setOneTimeOnly==true? '1' : '0', key], (error, result) => {
        if (error)
            return callback(error)
        return callback(null, result);
    });
}

function get_account_creation_status(callback) {
    let query = 'SELECT setting_name, setting_value FROM Settings ' +
                'WHERE setting_name = \'enableAccountCreation\' ' +
                'OR setting_name = \'enableTemporaryAccountCreation\''
    db.query(query, (error, result) => {
        if (error)
            return callback(error)
        return callback(null, result)  
    });
}

function create_account(email, password, callback) {
    let query = 'INSERT INTO Users (email, password) VALUES (?, ?)'

    db.query(query, [email, password], (error, result) => {
        if (error)
            return callback(error)
        return callback(null, result)  
    });
}


module.exports = app