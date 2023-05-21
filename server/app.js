const http = require('http');
const db = require('./database.js')
const express = require('express')
const app = express()
const hostname = '127.0.0.1';
const port = 3001;
require('dotenv').config();

process.env.SESSION_EXPIRE; 
process.env.HOST; 

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', ['https://s3.amazonaws.com/files.portfolio.markjovero.com', 'http://' + process.env.HOST + ':4200']);
    const allowedOrigins = ['https://s3.us-east-1.amazonaws.com', 'http://' + process.env.HOST_IP, 'http://markjovero.com'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(express.json({limit: '40mb'}));
app.use(express.json());

app.use(require('./auth/authentication.js'))
app.use(require('./stats/stats_report.js'))
app.use(require('./settings/account_creation.js'))
app.use(require('./file_upload/file_upload.js'))
app.listen(port, process.env.HOST, () => {
  console.log(`Server running at http://${process.env.HOST}:${port}/`);
});

/**
 * SIGNATURE
 * res.send({status: false, message: '', substatus: null, redirect: {inUse: false, path: null}, request_result: {inUse: false, message: '', payload: null}})
 */
