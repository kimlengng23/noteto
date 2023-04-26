const res = require("express/lib/response.js");
const helper = require("../helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addDatabase(database) {
  let todayDate = new Date().getTime();
  let systemFields = [
    {
      value: "owner",
      displayName: "Owner",
      type: "singleUser",
      database: database["value"],
      dateCreated: todayDate,
      isActive: true,
    },
    {
      value: "dateCreated",
      displayName: "Date Created",
      type: "date",
      database: database["value"],
      dateCreated: todayDate,
      isActive: true,
    },
    {
      value: "dateLastModified",
      displayName: "Date Last Modified",
      type: "date",
      database: database["value"],
      dateCreated: todayDate,
      isActive: true,
    },
    {
      value: "id",
      displayName: "Id",
      type: "number",
      database: database["value"],
      dateCreated: todayDate,
      isActive: true,
    },
    {
      value: "assignedTo",
      displayName: "Assigned To",
      type: "singleUser",
      database: database["value"],
      dateCreated: todayDate,
      isActive: true,
    },
  ];
  database.dateCreated = new Date().getTime();
  database.isActive = true;
  database.groups = [];
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .insertOne(database, (err, result1) => {
        if (err) {
          console.log("DatabaseService - addDatabase", err);
          reject({ code: 500, message: err });
        } else {
          dbConn.collection("SequenceCollection").insertOne(
            {
              seqName: "newEntry",
              seqValue: 1,
              database: database["value"],
            },
            (err, result2) => {
              if (err) {
                console.log("DatabaseService - addDatabase", err);
                reject({ code: 500, message: err });
              } else {
                dbConn
                  .collection("FieldCollection")
                  .insertMany(
                    systemFields,
                    { ordered: false },
                    (err, result3) => {
                      if (err) {
                        console.log("DatabaseService - addDatabase", err);
                        reject({ code: 500, message: err });
                      } else {
                        resolve({
                          code: 200,
                          data: { insertedId: result1.ops[0]._id },
                        });
                      }
                    }
                  );
              }
            }
          );
        }
      });
  });

  return promise;
}
function getAllDatabases() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .find({})
      .sort({ displayName: 1 })
      .toArray((err, databases) => {
        if (err) {
          console.log("DatabaseService - getAllDatabases", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: databases });
        }
      });
  });
  return promise;
}
function addDatabaseAccess(access) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseAccessCollection")
      .insertOne(access, (err, result) => {
        if (err) {
          console.log("DatabaseService - addDatabaseAccess", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200 });
        }
      });
  });
  return promise;
}
function getDatabasesByUserId(userId) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .find({ "groups.users._id": userId }, { fields: { groups: 0 } })
      .sort({ "database.name": 1 })
      .toArray((err, databases) => {
        if (err) {
          console.log("DatabaseService - getAvailableDatabaseByUserId", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: databases });
        }
      });
  });
  return promise;
}
function updateGroupsInDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .updateOne(
        { _id: ObjectId(database.databaseId) },
        { $set: { groups: database.groups } }
      )
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        console.log("databaseService - updateDatabaseGroups", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
function updateUsersInDatabasesGroups(group) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .updateMany(
        { "groups._id": group.groupId },
        { $set: { "groups.$[].users": group.users } }
      )
      .then((response) => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
function getUsersByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .findOne({ value: database }, (err, result) => {
        if (err) {
          console.log("DatabaseService - getUsersByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          let users = [];
          result.groups.forEach((group) => {
            users = users.concat(group.users);
          });
          resolve({ code: 200, data: users });
        }
      });
  });
  return promise;
}
module.exports = {
  setDb,
  addDatabase,
  getAllDatabases,
  getDatabasesByUserId,
  getUsersByDatabase,
  updateGroupsInDatabase,
  updateUsersInDatabasesGroups,
};
