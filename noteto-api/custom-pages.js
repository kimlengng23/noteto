const express = require('express');
const database = require('./database.js');
const { ObjectId } = require('mongodb');
const helper = require('./helper.js');
const path = require('path');
const app = express();
let dbConn = null;
app.use(express.json())
app.set("receipts", path.join(__dirname, "receipts"));
function setDb(conn) {
    dbConn = conn;
}
app.get('/tmp/:fileName',(req,res) => {
    res.sendFile(path.join(__dirname + `/tmp/${req.params.fileName}`));
})
app.get('/receipt',(req,res) => {
    res.sendFile(path.join(__dirname + `/receipts/${req.query.database}-receipt.html`))
})
app.get('/dashboard',(req,res) => {
    res.sendFile(path.join(__dirname + `/dashboards/${req.query.database}-dashboard.html`))
})
app.get('/assets/:name',(req,res) => {
    let options = {
        root: path.join(__dirname, 'receipts/assets'),
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
    }
    let pictureName = req.params.name
    res.sendFile(pictureName,options,function(err) {
        if(err) {
            res.sendStatus(500);
            return console.log('Unable to send file');
        }
    })
})
module.exports = {
    app,
    setDb
}