const helper = require("../helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addAutomation(automation) {
  let todayDate = new Date().getTime();
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
          let automationDict = {};
          results.forEach((automation) => {
            let type = automation.type;
            if (!automationDict[type]) {
              automationDict[type] = {};
            }
            if (type == "conditionSet") {
              let conField = automation.conField.value;
              if (!automationDict[type][conField])
                automationDict[type][conField] = [];
              automationDict[type][conField].push(automation);
            } else if (type == "set") {
              let actField = automation.actField.value;
              automationDict[type][actField] = automation;
            } else if (type == "buttonSet") {
              let actField = automation.actField.value;
              automationDict[type][actField] = automation;
            }
          });
          resolve({ code: 200, data: automationDict });
        }
      });
  });
  return promise;
}
function updateAutomation(automation) {
  let todayDate = new Date().getTime();
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
