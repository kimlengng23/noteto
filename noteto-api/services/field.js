const helper = require("../js/helper.js");
const choiceService = require("./choice.js");
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
function addFields(fields) {
  let promises = [];
  let insertedIds = [];
  const dollarOptions = {
    locale: "en-US",
    prefix: "$",
    suffix: "",
    length: 7,
    precision: 2,
  };
  const kgOptions = {
    locale: "en-US",
    prefix: "",
    suffix: "Kg",
    length: 7,
    precision: 2,
  };
  const lbOptions = {
    locale: "en-US",
    prefix: "",
    suffix: "Lbs",
    length: 7,
    precision: 2,
  };
  fields.forEach((e) => {
    if (e.type == "list") {
      promises.push(
        addFields(e.listFields).then((response) => {
          for (let i = 0; i < e.listFields.length; i++) {
            let field = e.listFields[i];
            let insertedId = response.data[i];
            field._id = insertedId;
            field.order = i + 1;
          }
          promises.push(addField(e));
        })
      );
    } else if (e.type == "singleSelect" || e.type == "multipleSelect") {
      let choices = e.choices;
      delete e["choices"];
      promises.push(
        addField(e).then((response) => {
          insertedIds.push(response.data.insertedId);
          choiceService.addChoices(choices).then(() => {});
        })
      );
    } else {
      if (e.type == "currencyInDollar") {
        e.options = dollarOptions;
      } else if (e.type == "weightInKg") {
        e.options = kgOptions;
      } else if (e.type == "weightInLb") {
        e.options = lbOptions;
      }
      promises.push(
        addField(e).then((response) => {
          insertedIds.push(response.data.insertedId);
        })
      );
    }
  });
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(() => {
        resolve({ code: 200, data: insertedIds });
      })
      .catch((err) => {
        console.log("FieldService - addFields", err);
        reject({ code: 500, message: err });
      });
  });
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
  addFields,
  getDatabaseToFields,
  updateField,
  getFieldsByDatabase,
};
