const express = require('express');
const database = require('./database.js');
const helper = require('./helper.js');
const path = require('path');
const app = express();
const multer = require('multer');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { resolve } = require('path');
let dbConn = null;

function setDb(conn) {
    dbConn = conn;
}
app.use(express.json());

let storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  
        cb(null, "uploads") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, file.originalname) 
    } 
  })
let upload = multer({storage: storage}).fields([{name:'images'}])

app.use(express.json())

app.post('/Add/ProductPictures', (req,res) => {
    upload(req,res,function(err) { 
        if(err) { 
            res.send(err) 
        } 
        else { 
            res.send("Success, Image uploaded!") 
        } 
    }) 
})
app.post('/Add/Product',(req,res) => {
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
app.post('/Add/Pictures',(req,res) => {
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
app.post('/Add/Order',(req,res) => {
    let order = req.body;
    order.status = 'New'
    dbConn.collection('OrderCollection').insertOne(
        order,
        (err,result) => {
            if(err) {
                res.sendStatus(500);
                return console.log('Unable to add order');
            }
            res.sendStatus(200);
        }    
    )
})
app.get('/Get/AllDropdownOptions',(req,res) => {
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
app.get('/Get/All/Products',(req,res) =>{
    dbConn.collection('ProductCollection').find({}).sort({'category':1,'product':1}).toArray((err,products) => {
        if(err) {
            return console.log('Unable to get all products!');
        }
        let promiseArray = [];
        products.forEach((product,idx) => {
            promiseArray.push(getPictureByProduct(product));
        })
        Promise.all(promiseArray).then((results) => {
            res.send(results);
        })
    })
})
app.get('/Get/All/Active/Products',(req,res) => {
    dbConn.collection('ProductCollection').find({'isActive':true}).sort({'cartegory':1,'product':1}).toArray((err,products) => {
        if(err) {
            return console.log('Unable to get all products!');
        }
        let promiseArray = [];
        products.forEach((product,idx) => {
            promiseArray.push(getPictureByProduct(product));
        })
        Promise.all(promiseArray).then((results) => {
            res.send(results);
        })
    })
})
app.get('/Get/All/Inactive/Products',(req,res) => {
    dbConn.collection('ProductCollection').find({'isActive':false}).sort({'cartegory':1,'product':1}).toArray((err,products) => {
        if(err) {
            return console.log('Unable to get all products!');
        }
        let promiseArray = [];
        products.forEach((product,idx) => {
            promiseArray.push(getPictureByProduct(product));
        })
        Promise.all(promiseArray).then((results) => {
            res.send(results);
        })
    })
})
app.get('/Get/Orders/:status',(req,res) => {
    dbConn.collection('OrderCollection').find({'status':req.params.status}).sort({'dateCreated':1}).toArray((err,orders) => {
        if(err) {
            return console.log('Unable to get orders');
        }
        res.send(orders);
    })
})
app.get('/Get/Order/By/Id/:id',(req,res) => {
    dbConn.collection('OrderCollection').findOne({'_id':ObjectId(req.params.id)},(err,order) => {
        if(err) {
            return console.log('Unable to get order');
        }
        res.send(order);
    })
})
app.get('/Get/Orders/By/SubmittedBy/:submittedBy',(req,res) => {
    dbConn.collection('OrderCollection').find({'submittedBy':req.params.submittedBy}).toArray((err,orders) => {
        if(err) {
            return console.log('Unable to get order');
        }
        res.send(orders);
    })
})
app.get("/Get/Product/pd/:product",(req,res) => {
    dbConn.collection('ProductCollection').find({'product':req.params.product,'isActive':true}).toArray((err,products) => {
        let promiseArray = [];
        if(err) {
            return console.log('Unable to get products!');
        }
        products.forEach((product,idx) => {
            promiseArray.push(getPictureByProduct(product));
        })
        Promise.all(promiseArray).then((results) => {
            res.send(results);
        })
    })
})
app.get('/Get/Product/id/:id',(req,res) => {
    console.log(req.params.id)
    dbConn.collection('ProductCollection').findOne({'_id':new ObjectId(req.params.id)},(err,product) => {
        if(err) {
            return console.log('Unabled to get product!');
        }
        getPictureByProduct(product).then((result) => {
            res.send(result);
        })
        
    });
})
app.get('/Get/Picture/id/:id',(req,res) => {
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
app.get('/Get/Pictures/pid/:productId',(req,res) => {
    dbConn.collection('PictureCollection').find({'product':req.params.productId}).toArray((err,pictures) => {
        if(err) {
            return console.log('Unabled to get all fields!');
        }
        res.send(pictures);
    });
})
app.post('/Delete/Picture/id/:id',(req,res) => {
    dbConn.collection('PictureCollection').deleteOne({'_id':ObjectId(req.params.id)},(err,results) => {
        if(err) {
            return console.log('Unable to delete picture');
        }
        let filePath = `${__dirname}/uploads/${req.params.id}`;
        fs.unlink(filePath,(err) => {
            if (err) {
                return console.log(err);
            }    
            console.log('Successfully delete picture');
        });
        res.sendStatus(200);
    })
})
app.post('/Update/Product',(req,res)=> {
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
app.post('/Update/Order/Status/:id',(req,res) => {
    let order = req.body;
    dbConn.collection('OrderCollection').updateOne(
        {_id:ObjectId(req.params.id)},
        {$set:order},
        (err,result) => {
            if(err) {
                return console.log(err);
            }
            res.sendStatus(200);
        }
    )
})
app.get('/backfill',(req,res) => {
    let body = req.body;
    dbConn.collection('ProductCollection').find({}).toArray((err,products) => {
        if(err) {
            return console.log('Unable to get all products');
        }
        products.forEach((p) => {
            console.log(p)
            let change = {};
            change['isActive'] = true
            dbConn.collection('ProductCollection').findOneAndUpdate(
                {_id:ObjectId(p._id)},
                {$set:change},
            ) 
        })
        res.sendStatus(200);
    })
    
})
function getPictureByProduct(product) {
    let subPromise = new Promise((resolve) => {
        dbConn.collection('PictureCollection').find({'product':product._id.toString()}).toArray((err,pictures) => {
            if(err) {
                return console.log('Unabled to get pictures');
            }
            if(pictures[0] && pictures[0]._id.toString())
                product.mainPicture = pictures[0]._id.toString();
            resolve(product);
        });
    })
    return subPromise;
}

module.exports = {
    app,
    setDb
}