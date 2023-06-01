const helper = require("../js/helper.js");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}

function getFieldsByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FieldCollection")
      .find({ database: database })
      .sort({ displayName: 1, value: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("FieldService - getFieldsbyDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function getDatabaseToFields() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FieldCollection")
      .find({})
      .sort({ displayText: 1, value: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("FieldService - getDatabaseToFields", err);
          reject({ code: 500, message: err });
        } else {
          let databaseToFields = {};
          results.forEach((field) => {
            if (!databaseToFields[field.database]) {
              databaseToFields[field.database] = [];
            }
            databaseToFields[field.database].push(field);
          });
          resolve({ code: 200, data: databaseToFields });
        }
      });
  });
  return promise;
}
function addField(field) {
  field.isActive = true;
  field.dateCreated = new Date();
  let promise = new Promise((resolve, reject) => {
    dbConn.collection("FieldCollection").insertOne(field, (err, result) => {
      if (err) {
        console.log("FieldService - addField", err);
        reject({ code: 500, message: err });
      } else {
        resolve({ code: 200, data: { insertedId: result.ops[0]._id } });
      }
    });
  });
  return promise;
}
function updateField(field) {
  let promise = new Promise((resolve, reject) => {
    let query = { value: field.value, database: field.database };
    if (field._id) {
      delete field._id;
    }
    dbConn
      .collection("FieldCollection")
      .updateOne(query, { $set: field })
      .then((result) => {
        if (result.matchedCount > 0) {
          resolve({ code: 200 });
        } else {
          resolve({ code: 200 });
        }
      })
      .catch((err) => {
        console.log("FieldService - updateField", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  setDb,
  addField,
  getDatabaseToFields,
  updateField,
  getFieldsByDatabase,
};
