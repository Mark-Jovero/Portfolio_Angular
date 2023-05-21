const express = require('express');
const app = express();
const db = require('../database.js');
const AWS = require('aws-sdk');
const JSONResponse = require('../JSONResponse.js');
const msg = require('../Messages.js')
const request = require('request')
const formidable = require('formidable');
const fs = require('fs')
require('dotenv').config();

app.get('/get/all_posts', async (req, res) => {
    let posts = []
    let rs = await getAllObjectsInFolder('posts', '.txt', (err, result) => {
        if (err)
            return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.AWS_S3_ERROR, req_payload: err}));
    })

    for (var i in rs) {
        posts.push(await getObject(rs[i], (error, result) => {}));
    }

    //posts.sort(compare)
    res.send(new JSONResponse({__status: rs==undefined?false:true, message: posts}));
});

app.get('/get/postkeys', async (req, res) => {
    let keys = await getAllObjectsInFolder('posts', 'txt', (err, result) => {});
    res.send(keys);
});

app.get('/get/postcachekey', async (req, res) => {
    getPostCacheKey((err, result) => {
        res.send(new JSONResponse({__status: true, message: result}));
    })
});

app.post('/get/post', async (req, res) => {
    let fileName = req.body.fileName;
    console.log(fileName)
    let post = await getObject(fileName, (err, result) => {
        if (err)
            return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: err.code, req_payload: err}));
    });
    console.log(post.length)
    res.send(new JSONResponse({__status: true, message: post}));
});



app.post('/auth/del/post', async (req, res) => {
    let fileName = req.body.fileName;
    AWS.config.update({accessKeyId: process.env.S3_KEY_ID, secretAccessKey: process.env.S3_SEC_ACC_KEY});
    const s3 = new AWS.S3();
    const response = await s3.deleteObject({Bucket: 'files.portfolio.markjovero.com', Key: fileName}).promise()
    await updatePostCacheKey((error, result)=> {});

    res.send(response);
});

app.post('/auth/add/post', async (req, res) => {
    let fileName = req.body.fileName;
    let isEdit = Boolean(req.body.isEdit);

    uploadPost(fileName? fileName : await getKey(), isEdit? true : false, {content: req.body.postContent, user_id: req.body.user_id}, async (err, result) => {
         if (err)
            return res.send(new JSONResponse({__status:false, hasError:true, errorMessage: msg.AWS_S3_ERROR, req_payload: err}));
        await updatePostCacheKey((err2, result2, key)=>{
            return res.send(new JSONResponse({__status:true, message: {cahceKey: key}}));
        });
        
    })
})

app.post('/test12', async(req, res) => {
    let fileName = req.body.fileName?fileName : await getKey() + ".png";
    let file = req.body.file;
    let fileRes = await uploadImage(fileName, file, (err, result) => {
        console.log(err, result)
        return res.send(new JSONResponse({__status:true, message: {file: result, fileName: fileName}}))
      });
})



app.post('/test13', async (req, res) => {
    let fileName = req.body.fileName;
})

async function getAllObjectsInFolder(folderName, fileExt, callback) {
    AWS.config.update({accessKeyId: process.env.S3_KEY_ID, secretAccessKey: process.env.S3_SEC_ACC_KEY});
    const s3 = new AWS.S3();
    let ret = []

    return new Promise (resolve => {
        s3.listObjectsV2({Bucket: 'files.portfolio.markjovero.com', Prefix: folderName, }, (err, result) => {
            if (err)
                return callback(err)

            for (var a in result.Contents) {
                let objStr = result.Contents[a].Key.toString();
                if (objStr  != folderName + "/")
                    if (fileExt == undefined)
                        ret.push(result.Contents[a].Key)
                    else {
                        if (objStr.substring(objStr.length - fileExt.length, objStr.length) == fileExt)
                            ret.push(result.Contents[a])
                    }
            }
            resolve(ret.sort(compare))    
        });
    })
}

function compare( a, b ) {
    let d1 = new Date(a.LastModified)
    let d2 = new Date(b.LastModified)

    if ( d1 > d2 ){
      return -1;
    }
    if ( d1 < d2 ){
      return 1;
    }
    return 0;
  }

async function getObject(fileName, callback) {
    AWS.config.update({accessKeyId: process.env.S3_KEY_ID, secretAccessKey: process.env.S3_SEC_ACC_KEY});
    const s3 = new AWS.S3();
    return new Promise (resolve => {
        s3.getObject({Bucket:'files.portfolio.markjovero.com', Key: fileName}, (err, res) => {
            if (err)
                return callback(err)
             resolve(res)
        })
    })
}

async function uploadPost(name, isEdit, content, callback) {
    AWS.config.update({accessKeyId: process.env.S3_KEY_ID, secretAccessKey: process.env.S3_SEC_ACC_KEY});
    const s3 = new AWS.S3();

    if (isEdit) {
        s3.putObject({Bucket: 'files.portfolio.markjovero.com', Key: name, Body: JSON.stringify(content)}, (err, res) => {
            if (err)
                return callback(err)
            return callback(null,res)
        })
    }
    else
        s3.putObject({Bucket: 'files.portfolio.markjovero.com', Key: "posts/" +  content.user_id + "." + name + ".txt", Body: JSON.stringify(content)}, (err, res) => {
            if (err)
                return callback(err)
            return callback(null,res)
        })
}

async function uploadImage(name, file, callback) {
    AWS.config.update({accessKeyId: process.env.S3_KEY_ID, secretAccessKey: process.env.S3_SEC_ACC_KEY});
    const s3 = new AWS.S3();

    s3.putObject({Bucket: 'files.portfolio.markjovero.com', Key: "files/" + name, Body: Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64'), ContentType: 'image/png', ContentEncoding: 'base64'}, (err, res) => {
        if (err)
            return callback(err)
        return callback(null,res)
    })
}

async function getPostCacheKey(callback) {
    let query = 'SELECT value FROM Public_Data WHERE name = \"postUpdateKey\"'
    db.query(query, (err, res) => {
        if (err)
            return callback(err)
        return callback(null,res[0])
    })
}

async function updatePostCacheKey(callback) {
    let query = 'UPDATE Public_Data SET value=? WHERE name = \"postUpdateKey\"'
    db.query(query, [r= await getKey()], (err, res) => {
        if (err)
            return callback(err)
        return callback(null,res, r)
    })
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

module.exports = app