const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addChoices(choices) {
  let promise = new Promise((resolve, reject) => {
    dbConn.collection("ChoiceCollection").insertMany(choices, (err, result) => {
      if (err) {
        console.log("ChoiceService - addChoices", err);
        reject({ code: 500, message: err });
      } else {
        resolve({ code: 200, data: result.ops.insertedIds });
      }
    });
  });
  return promise;
}
function getChoicesByDatabase(databaseValue) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("ChoiceCollection")
      .find({ database: databaseValue })
      .sort({ value: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("ChoiceService - getChoicesByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function getChoicesByFieldAndDatabase(fieldValue, databaseValue) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("ChoiceCollection")
      .find({ field: fieldValue, database: databaseValue })
      .sort({ value: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("ChoiceService - getChoicesByFieldAndDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function getDatabaseToChoices() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("ChoiceCollection")
      .find({})
      .sort({ field: 1, value: 1 })
      .toArray((err, choices) => {
        if (err) {
          console.log("ChoiceService - getAllChoicesByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          let databaseToChoices = {};
          choices.forEach((choice) => {
            if (!databaseToChoices[choice.database])
              databaseToChoices[choice.database] = {};
            if (!databaseToChoices[choice.database][choice.field])
              databaseToChoices[choice.database][choice.field] = [];
            databaseToChoices[choice.database][choice.field].push(choice);
          });
          resolve({ code: 200, data: databaseToChoices });
        }
      });
  });
  return promise;
}
function updateChoices(choices) {
  let promises = [];
  let fieldValue = "";
  let databaseValue = "";
  choices.forEach((choice) => {
    let promise = new Promise((resolve, reject) => {
      let query = {
        field: choice.field,
        database: choice.database,
        _id: ObjectId(choice._id),
      };
      if (choice._id) {
        delete choice._id;
      }
      if (!fieldValue && !databaseValue) {
        fieldValue = choice.field;
        databaseValue = choice.database;
      }
      dbConn
        .collection("ChoiceCollection")
        .updateOne(query, { $set: choice }, { upsert: true })
        .then(() => {
          resolve({ code: 200 });
        })
        .catch((err) => {
          console.log("ChoiceService - updateChoice", err);
          reject({ code: 500, message: err });
        });
    });
    promises.push(promise);
  });
  let promise = new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(() => {
        getChoicesByFieldAndDatabase(fieldValue, databaseValue).then(
          (response) => {
            resolve({ code: 200, data: response.data });
          }
        );
      })
      .catch((err) => {
        console.log("ChoiceService - updateChoice", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  setDb,
  addChoices,
  getChoicesByDatabase,
  getDatabaseToChoices,
  updateChoices,
};
