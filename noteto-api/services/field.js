const helper = require("../helper.js");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}

// function getAllFieldsInListByDatabase(database) {
//   let promise = new Promise((resolve, reject) => {
//     dbConn
//       .collection("FieldCollection")
//       .find({ database: database })
//       .sort({ text: 1, value: 1 })
//       .toArray((err, fields) => {
//         if (err) {
//           console.log("FieldService - getAllFieldsInListByDatabase", err);
//           reject({ code: 500, message: err });
//         } else {
//           resolve({ code: 200, data: fields });
//         }
//       });
//   });
//   return promise;
// }
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
// function getAllFieldsByDatabase(database) {
//   let promise = new Promise((resolve, reject) => {
//     dbConn
//       .collection("FieldCollection")
//       .find({ database: database })
//       .sort({ text: 1, value: 1 })
//       .toArray((err, fields) => {
//         if (err) {
//           console.log("FieldService - getAllFieldsByDatabase", err);
//           reject({ code: 500, message: err });
//         } else {
//           let fieldDict = {};
//           fields.forEach((field) => {
//             fieldDict[field.value] = field;
//           });
//           resolve({ code: 200, data: fieldDict });
//         }
//       });
//   });
//   return promise;
// }
function addField(field) {
  field.isActive = true;
  field.dateCreated = new Date().getTime();
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
  //getAllFieldsByDatabase,
  //getAllFieldsInListByDatabase,
};
