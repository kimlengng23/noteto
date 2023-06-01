const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addAutomation(automation) {
  let todayDate = new Date();
  automation["dateCreated"] = todayDate;
  automation["dateModified"] = todayDate;
  automation["isActive"] = true;
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("AutomationCollection")
      .insertOne(automation, (err, result) => {
        if (err) {
          console.log("AutomationService - addAutomation", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: result.ops[0] });
        }
      });
  });
  return promise;
}
function getAutomationsByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("AutomationCollection")
      .find({ database: database })
      .sort({ dateCreated: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("AutomationService - getAutomationsByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function updateAutomation(automation) {
  let todayDate = new Date();
  let automationId = automation._id;
  automation["dateModified"] = todayDate;
  delete automation["_id"];
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("AutomationCollection")
      .updateOne({ _id: ObjectId(automationId) }, { $set: automation })
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        console.log("AutomationService - updateAutomation", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  addAutomation,
  getAutomationsByDatabase,
  updateAutomation,
  setDb,
};
