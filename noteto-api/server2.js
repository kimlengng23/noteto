const express = require('express');
const cors = require('cors');
const app = express();
const appPath = '/Domrey/Api';
const database = require('./database.js');
const multer = require('multer');
const path = require("path"); 
const fs = require('fs');
const { ObjectId } = require('mongodb');
let dbConn = null;
let storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  
        cb(null, "uploads") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, file.originalname) 
    } 
  })
let upload = multer({storage: storage}).fields([{name:'images'}])
app.use(cors())
app.use(express.json())

app.post(appPath + '/Add/ProductPictures', (req,res) => {
    upload(req,res,function(err) { 
        if(err) { 
            res.send(err) 
        } 
        else { 
            res.send("Success, Image uploaded!") 
        } 
    }) 
})
app.post(appPath + '/Add/Product',(req,res) => {
    let product = req.body
    dbConn.collection('ProductCollection').insertOne(
        product,
        (err,result) => {
            if(err){
                res.sendStatus(500);
                return console.log('Unable to file entries');
            }
            res.send(result.ops);
    })  
})
app.post(appPath+ '/Add/Pictures',(req,res) => {
    let pictures = req.body;
    dbConn.collection('PictureCollection').insertMany(
        pictures,
        (err,result) => {
            if(err){
                res.sendStatus(500);
                return console.log('Unable to file entries');
            }
            res.send(result.ops);
        })    
})
app.get(appPath + '/Get/AllDropdownOptions',(req,res) => {
    dbConn.collection('DropdownCollection').find({}).toArray((err,dropdownOptions) => {
        if(err) {
            return console.log('Unable to get all options!');
        }
        let dropdownDict = {}
        dropdownOptions.forEach(option => {
            if(!(option.dropdown in dropdownDict)) {
                dropdownDict[option.dropdown] = []
            }
            dropdownDict[option.dropdown].push(option);
        })
        res.send(dropdownDict);
    })
})
app.get(appPath +'/Get/All/Products',(req,res) =>{
    dbConn.collection('ProductCollection').find({}).toArray((err,products) => {
        if(err) {
            return console.log('Unable to get all products!');
        }
        res.send(products);
    })
})
app.get(appPath + '/Get/Product/:id',(req,res) => {
    dbConn.collection('ProductCollection').findOne({'_id':new ObjectId(req.params.id)},(err,product) => {
        if(err) {
            return console.log('Unabled to get product!');
        }
        res.send(product);
    });
})
app.get(appPath+ '/Get/Picture/:id',(req,res) => {
    let options = {
        root: path.join(__dirname, 'uploads'),
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
    }
    let pictureName = req.params.id
    res.sendFile(pictureName,options,function(err) {
        if(err) {
            res.sendStatus(500);
            return console.log('Unable to send file');
        }
    })
})
app.get(appPath + '/Get/Pictures/ProductId/:id',(req,res) => {
    dbConn.collection('PictureCollection').find({'product':req.params.id}).toArray((err,pictures) => {
        if(err) {
            return console.log('Unabled to get all fields!');
        }
        res.send(pictures);
    });
})
app.post(appPath+'/Delete/Picture/:id',(req,res) => {
    dbConn.collection('PictureCollection').deleteOne({'_id':ObjectId(req.params.id)},(err,results) => {
        if(err) {
            return console.log('Unable to delete picture');
        }
        let filePath = `${__dirname}/uploads/${req.params.id}`;
        fs.unlink(filePath,(err) => {
            if (err) {
                return console.log(err);
            }    
        });
        res.sendStatus(200);
    })
})
app.post(appPath + '/Update/Product',(req,res)=> {
    let product = req.body;
    let productId = product['_id'];
    delete product['_id'];
    dbConn.collection('ProductCollection').updateOne(
        {_id:ObjectId(productId)},
        {$set:product},
        (err,results) => {
            if(err) {
                return console.log(err);
            }
            res.send(results);
        }
    );
})

app.listen(3000, () => {
    console.log('App is listening on port 3000');
    database.createDbConn.then((conn) => {
        dbConn = conn;
    })
});