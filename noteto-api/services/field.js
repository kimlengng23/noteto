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
      .find({ database: database, isActive: { $ne: false } })
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
      .find({ isActive: { $ne: false } })
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

function hasText(value) {
  return Boolean(value && String(value).trim());
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function validateField(field) {
  if (!hasText(field.database)) {
    return "Field database is required";
  }
  if (!hasText(field.displayName) || !hasText(field.value)) {
    return "Field names cannot be empty";
  }
  if (!hasText(field.type)) {
    return "Field type is required";
  }
  field.displayName = field.displayName.trim();
  field.value = field.value.trim();
  return null;
}

function checkDuplicateField(field) {
  return dbConn
    .collection("FieldCollection")
    .find({ database: field.database })
    .toArray()
    .then((fields) => {
      const duplicate = fields.find((item) => {
        return (
          normalizeText(item.value) == normalizeText(field.value) ||
          normalizeText(item.displayName) == normalizeText(field.displayName)
        );
      });
      if (duplicate) {
        return "A field with this name already exists";
      }
      return null;
    });
}

function checkDuplicateFieldOnUpdate(field) {
  return dbConn
    .collection("FieldCollection")
    .find({ database: field.database })
    .toArray()
    .then((fields) => {
      const duplicate = fields.find((item) => {
        const sameField = normalizeText(item.value) == normalizeText(field.value);
        return (
          !sameField &&
          normalizeText(item.displayName) == normalizeText(field.displayName)
        );
      });
      if (duplicate) {
        return "A field with this display name already exists";
      }
      return null;
    });
}

function validateFieldList(fields, seen = new Set()) {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const validationMessage = validateField(field);
    if (validationMessage) return validationMessage;

    const valueKey = `${field.database}:value:${normalizeText(field.value)}`;
    const displayKey = `${field.database}:display:${normalizeText(
      field.displayName
    )}`;
    if (seen.has(valueKey) || seen.has(displayKey)) {
      return "Field names must be unique";
    }
    seen.add(valueKey);
    seen.add(displayKey);

    if (field.type == "list") {
      const nestedMessage = validateFieldList(field.listFields || [], seen);
      if (nestedMessage) return nestedMessage;
    } else if (field.type == "singleSelect" || field.type == "multipleSelect") {
      const choiceMessage = validateChoicesForField(field);
      if (choiceMessage) return choiceMessage;
    }
  }
  return null;
}

function validateChoicesForField(field) {
  if (!Array.isArray(field.choices) || field.choices.length == 0) {
    return `${field.displayName} needs at least one choice`;
  }
  const seen = new Set();
  for (let i = 0; i < field.choices.length; i++) {
    const choice = field.choices[i];
    if (!hasText(choice.displayName) || !hasText(choice.value)) {
      return "Choice names cannot be empty";
    }
    choice.displayName = choice.displayName.trim();
    choice.value = choice.value.trim();
    const valueKey = `value:${normalizeText(choice.value)}`;
    const displayKey = `display:${normalizeText(choice.displayName)}`;
    if (seen.has(valueKey) || seen.has(displayKey)) {
      return "Choice names must be unique";
    }
    seen.add(valueKey);
    seen.add(displayKey);
  }
  return null;
}

function addField(field) {
  let promise = new Promise((resolve, reject) => {
    const validationMessage = validateField(field);
    if (validationMessage) {
      reject({ code: 400, message: validationMessage });
      return;
    }
    checkDuplicateField(field)
      .then((duplicateMessage) => {
        if (duplicateMessage) {
          reject({ code: 400, message: duplicateMessage });
          return;
        }
        field.isActive = true;
        field.dateCreated = new Date();
        dbConn.collection("FieldCollection").insertOne(field, (err, result) => {
          if (err) {
            console.log("FieldService - addField", err);
            reject({ code: 500, message: err });
          } else {
            resolve({ code: 200, data: { insertedId: result.ops[0]._id } });
          }
        });
      })
      .catch((err) => {
        console.log("FieldService - addField", err);
        reject({ code: 500, message: err });
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
  const validationMessage = validateFieldList(fields);
  if (validationMessage) {
    return Promise.reject({ code: 400, message: validationMessage });
  }
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
          return choiceService.addChoices(choices);
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
    const validationMessage = validateField({
      ...field,
      type: field.type || "existing",
    });
    if (validationMessage) {
      reject({ code: 400, message: validationMessage });
      return;
    }
    let query = { value: field.value, database: field.database };
    if (field._id) {
      delete field._id;
    }
    checkDuplicateFieldOnUpdate(field)
      .then((duplicateMessage) => {
        if (duplicateMessage) {
          reject({ code: 400, message: duplicateMessage });
          return;
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
      })
      .catch((err) => {
        console.log("FieldService - updateField", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
function deleteField(field) {
  let promise = new Promise((resolve, reject) => {
    if (!hasText(field.database) || !hasText(field.value)) {
      reject({ code: 400, message: "Field database and name are required" });
      return;
    }
    let query = {
      value: String(field.value).trim(),
      database: String(field.database).trim(),
      isActive: { $ne: false },
    };
    let update = {
      isActive: false,
      dateDeleted: new Date(),
    };
    if (hasText(field.deletedBy)) {
      update.deletedBy = String(field.deletedBy).trim();
    }
    dbConn
      .collection("FieldCollection")
      .updateOne(query, { $set: update })
      .then((result) => {
        if (result.matchedCount > 0) {
          return dbConn
            .collection("FieldCollection")
            .updateMany(
              { database: query.database, "listFields.value": query.value },
              { $pull: { listFields: { value: query.value } } }
            )
            .then(() => {
              resolve({ code: 200 });
            });
        } else {
          reject({ code: 404, message: "Field not found" });
        }
      })
      .catch((err) => {
        console.log("FieldService - deleteField", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  setDb,
  addField,
  addFields,
  deleteField,
  getDatabaseToFields,
  updateField,
  getFieldsByDatabase,
};
