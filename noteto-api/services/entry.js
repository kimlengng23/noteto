const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function getNextId(database) {
  return dbConn
    .collection("SequenceCollection")
    .findOneAndUpdate({ database: database }, { $inc: { seqValue: 1 } });
}
function addEntry(entry) {
  let todayDate = new Date().getTime();
  let promise = new Promise((resolve, reject) => {
    getNextId(entry.database).then((document) => {
      entry.id = document.value.seqValue;
      entry.dateCreated = todayDate;
      entry.dateLastModified = todayDate;
      dbConn.collection("EntryCollection").insertOne(entry, (err, result) => {
        if (err) {
          console.log("EntryService - addEntry", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: result.ops[0] });
        }
      });
    });
  });
  return promise;
}
function getEmptyEntryByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FieldCollection")
      .find({ database: database })
      .toArray((err, fields) => {
        if (err) {
          console.log("EntryService - getEmptyEntryByDatabase", err);
          reject({ code: 500, message: err });
        }
        let emptyEntry = {
          database: database,
        };
        fields.forEach((field) => {
          if (field.type == "list") {
            emptyEntry[field.value] = [];
          } else if (
            field.type == "weightInKg" ||
            field.type == "weightInLb" ||
            field.type == "currencyInDollar"
          ) {
            emptyEntry[field.value] = 0.0;
          } else if (
            field.type == "singleLine" ||
            field.type == "multipleLines"
          ) {
            emptyEntry[field.value] = "";
          } else if (field.type == "number") {
            emptyEntry[field.value] = null;
          } else if (field.type == "date") {
            //1/1/2000
            emptyEntry[field.value] = null;
          } else {
            emptyEntry[field.value] = null;
          }
        });
        resolve({ code: 200, data: emptyEntry });
      });
  });
  return promise;
}
function getEntryById(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("EntryCollection")
      .findOne({ _id: new ObjectId(id) }, (err, result) => {
        if (err) {
          console.log("EntryService - getEntryById", err);
          reject({ code: 500, message: err });
        } else {
          getEmptyEntryByDatabase(result.database).then((response) => {
            let emptyEntry = response.data;
            let fields = Object.keys(emptyEntry);
            emptyEntry["_id"] = result["_id"];
            for (let i = 0; i < fields.length; i++) {
              let field = fields[i];
              if (result[field]) {
                emptyEntry[field] = result[field];
              }
            }
            resolve({ code: 200, data: emptyEntry });
          });
        }
      });
  });
  return promise;
}
function getEntriesByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("EntryCollection")
      .find({ database: database })
      .sort({ id: -1, dateCreated: -1 })
      .toArray((err, results) => {
        if (err) {
          console.log("EntryService - getAllEntriesByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function updateEntry(entry) {
  let promise = new Promise((resolve, reject) => {
    let id = entry["_id"];
    let todayDate = new Date().getTime();
    entry.dateLastModified = todayDate;
    delete entry["_id"];
    dbConn
      .collection("EntryCollection")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: entry })
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        console.log("EntryService - UpdateEntry", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  setDb,
  addEntry,
  getEntryById,
  getEmptyEntryByDatabase,
  getEntriesByDatabase,
  updateEntry,
};
