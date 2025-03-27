const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
let dbConn = null;
function setDb(conn) {
    dbConn = conn;
    helper.setDb(conn);
}
function addHeaderSet(headerSet) {
    let promise = new Promise((resolve, reject) => {
        dbConn
            .collection("HeaderSetCollection")
            .insertOne(headerSet, (err, result) => {
                if (err) {
                    console.log("HeaderSetService - addHeaders", err);
                    reject({ code: 500, message: err });
                } else {
                    resolve({ code: 200, data: result.ops[0] });
                }
            });
    });
    return promise;
}

function getHeaderSetsByDatabase(database) {
    let promise = new Promise((resolve, reject) => {
        dbConn
            .collection("HeaderSetCollection")
            .find({ database: database })
            .sort({ order: 1 })
            .toArray((err, results) => {
                if (err) {
                    console.log(
                        "HeaderSetService - getSelectedHeaderSetsByDatabase",
                        err
                    );
                    reject({ code: 500, message: err });
                } else {
                    resolve({ code: 200, data: results });
                }
            });
    });
    return promise;
}
function removeHeaderSetsByDatabase(database) {
    let promise = new Promise((resolve, reject) => {
        dbConn
            .collection("HeaderSetCollection")
            .deleteMany({ database: database })
            .then(() => {
                resolve({ code: 200 });
            })
            .catch((err) => {
                console.log('HeaderSetService - getRemoveHeaderSetsByDatabase')
                reject({ code: 500, message: err });
            });
    });
    return promise;
}
function getDatabaseToHeaderSets() {
    let promise = new Promise((resolve, reject) => {
        dbConn
            .collection("HeaderSetCollection")
            .find({})
            .toArray((err, results) => {
                if (err) {
                    console.log(
                        "HeaderSetService - getDatabaseToHeaderSet",
                        err
                    );
                    reject({ code: 500, message: err });
                } else {
                    let databaseToHeaderSets = {};
                    results.forEach((headerSet) => {
                        if (!databaseToHeaderSets[headerSet.database]) {
                            databaseToHeaderSets[headerSet.database] = [];
                        }
                        databaseToHeaderSets[headerSet.database].push(headerSet);
                    });
                    resolve({ code: 200, data: databaseToHeaderSets });
                }
            });
    });
    return promise;
}
function setFavoriteHeaderSet(favorite) {
    let promise = new Promise((resolve,reject) => {
        dbConn.collection("HeaderSetCollection").updateOne(
            { "createdBy._id": favorite.createdById,"database":favorite.database },
            { $set: { "isFavorite": false } }
        ).then(() => {
            dbConn.collection("HeaderSetCollection").updateOne(
                {_id:ObjectId(favorite.id),"createdBy._id":favorite.createdById},
                {$set:{'isFavorite':true}}
            ).then(() => {
                resolve({code:200})
            })
            .catch((err) => {
                console.log('HeaderSetSevice - setFavoriteHeaderSetById',err);
                reject({code:500,message:err})
            })
        }).catch((err) => {
            console.log('HeaderSetSevice - setFavoriteHeaderSetById',err);
            reject({code:500,message:err})
        })
        
    })
    return promise;
}
function updateHeaderSet(headerSet) {
    let _id = headerSet._id
    delete headerSet._id;
    let promise = new Promise((resolve,reject) => {
        dbConn.collection("HeaderSetCollection").updateOne({_id:ObjectId(_id)},{$set:headerSet}).then(() => {
            resolve({code:200})
        }).catch((err) => {
            console.log("HeaderSetService - updateHeaderSet",err);
            reject({code:500,message:err})
        })
    })
    return promise;
}
module.exports = {
    setDb,
    addHeaderSet,
    getDatabaseToHeaderSets,
    getHeaderSetsByDatabase,
    removeHeaderSetsByDatabase,
    setFavoriteHeaderSet,
    updateHeaderSet
};
