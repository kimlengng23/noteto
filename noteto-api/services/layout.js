const helper = require("../helper.js");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addLayout(layout) {
  let promise = new Promise((resolve, reject) => {
    dbConn.collection("LayoutCollection").insertMany(layout, (err, result) => {
      if (err) {
        console.log("LayoutService - addLayout", err);
        reject({ code: 500, message: err });
      } else {
        resolve({ code: 200 });
      }
    });
  });
  return promise;
}
function getDatabaseToLayoutMappings() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("LayoutCollection")
      .find({})
      .sort({ database: 1, order: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("LayoutService - getDatabaseToLayoutMappings", err);
          reject({ code: 500, message: err });
        } else {
          let databaseToLayoutMappings = {};
          results.forEach((row) => {
            if (!databaseToLayoutMappings[row.database]) {
              databaseToLayoutMappings[row.database] = [];
            }
            databaseToLayoutMappings[row.database].push(row);
          });
          resolve({ code: 200, data: databaseToLayoutMappings });
        }
      });
  });
  return promise;
}
function getLayoutByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("LayoutCollection")
      .find({ database: database })
      .sort({ order: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("LayoutService - getLayoutByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function removeLayoutByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    try {
      dbConn.collection("LayoutCollection").deleteMany({ database: database });
      resolve({ code: 200 });
    } catch (err) {
      console.log("LayoutService - removeLayoutByDatabase", err);
      reject({ code: 500, message: err });
    }
  });
  return promise;
}
module.exports = {
  setDb,
  addLayout,
  getDatabaseToLayoutMappings,
  getLayoutByDatabase,
  removeLayoutByDatabase,
};
