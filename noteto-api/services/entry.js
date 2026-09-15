const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
const historyService = require("./history.js");
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
function addEntry2(orignal, newEntry) {
  let promise = new Promise((resolve, reject) => {
    historyService.compareForHistory(orignal, newEntry).then((response) => {
      let history = response.data;
      addEntry1(newEntry).then((response) => {
        let addEntryResponsse = response;
        history.createdBy = newEntry._data.createdBy;
        history.entryId = response.data._id.toString();
        historyService.addHistory(history).then(() => {
          resolve(addEntryResponsse);
        });
      });
    });
  });
  return promise;
}
function addEntry1(entry) {
  let promise = new Promise((resolve, reject) => {
    getNextId(entry._data.database).then((document) => {
      entry._data.id = document.value.seqValue;
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
function getAssignedEntriesByUserId(userId) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("EntryCollection")
      .find({ "assignedTo._id": userId })
      .sort({
        "_data.id": -1,
        "_data.dateCreated": -1,
        "_data.database": 1,
      })
      .toArray((err, results) => {
        if (err) {
          console.log("EntryService - getAssignedEntriesByUserId", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}

function getEmptyEntryByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FieldCollection")
      .find({ database: database, isActive: { $ne: false } })
      .sort({ displayName: 1, value: 1 })
      .toArray((err, fields) => {
        if (err) {
          console.log("EntryService - getEmptyEntryByDatabase", err);
          reject({ code: 500, message: err });
        }
        let emptyEntry = {};
        fields.forEach((field) => {
          if (field.type == "list") {
            emptyEntry[field.value] = [];
          } else if (
            field.type == "weightInKg" ||
            field.type == "weightInLb" ||
            field.type == "currencyInDollar"
          ) {
            emptyEntry[field.value] = null;
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
      .findOne(
        { _id: new ObjectId(id), "_data.isActive": true },
        (err, result) => {
          if (err) {
            console.log("EntryService - getEntryById", err);
            reject({ code: 500, message: err });
          } else {
            getEmptyEntryByDatabase(result._data.database).then((response) => {
              let emptyEntry = response.data;
              let fields = Object.keys(emptyEntry);
              emptyEntry["_id"] = result["_id"];
              emptyEntry["_data"] = result["_data"];
              for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                if (result[field]) {
                  emptyEntry[field] = result[field];
                }
              }
              resolve({ code: 200, data: emptyEntry });
            });
          }
        }
      );
  });
  return promise;
}
function getEntriesByDatabase(database, filter = {}) {
  let promise = new Promise((resolve, reject) => {
    filter["_data.database"] = database;
    filter["_data.isActive"] = true;
    dbConn
      .collection("EntryCollection")
      .find(filter)
      .sort({ "_data.id": -1, "_data.dateCreated": -1 })
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
function getReportList(filter) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("EntryCollection")
      .find(filter)
      .sort({ "_data.id": -1, "_data.dateCreated": -1 })
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
function updateEntry2(oldEntry, newEntry, createdBy) {
  let promise = new Promise((resolve, reject) => {
    historyService.compareForHistory(oldEntry, newEntry).then((response) => {
      let history = response.data;
      history.createdBy = createdBy;
      let pm1 = historyService.addHistory(history);
      let pm2 = updateEntry1(newEntry);
      Promise.all([pm1, pm2]).then((values) => {
        resolve(values[0]);
      });
    });
  });
  return promise;
}
function updateEntry1(entry) {
  let promise = new Promise((resolve, reject) => {
    let id = entry._id;
    let todayDate = new Date().getTime();
    entry._data.dateLastModified = todayDate;
    delete entry._id;
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
function deleteEntryById(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("EntryCollection")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { "_data.isActive": false } }
      )
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        console.log("EntryService - DeleteEntryById", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}

module.exports = {
  setDb,
  addEntry1,
  addEntry2,
  deleteEntryById,
  getAssignedEntriesByUserId,
  getEntryById,
  getEmptyEntryByDatabase,
  getEntriesByDatabase,
  getReportList,
  updateEntry1,
  updateEntry2,
};
