const res = require("express/lib/response.js");
const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addDatabase(database) {
  let todayDate = new Date();
  let systemFields = [
    {
      value: "assignedTo",
      displayName: "Assigned To",
      type: "singleUser",
      database: database["value"],
      dateCreated: todayDate,
      isActive: true,
    },
  ];
  database.dateCreated = new Date();
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
                        reject({
                          code: 500,
                          message: err,
                        });
                      } else {
                        resolve({
                          code: 200,
                          data: {
                            insertedId: result1.ops[0]._id,
                          },
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
function addRequest(request) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseRequestCollection")
      .insertOne(request, (err, result) => {
        if (err) {
          console.log("DatabaseService - addRequest", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200 });
        }
      });
  });
  return promise;
}
function getAccessesByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseAccessCollection")
      .find({ "database.value": database })
      .toArray((err, results) => {
        if (err) {
          console.log("DatabaseService - getAccessesbyDatabase", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: results });
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
function getDatabaseToAccesses() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseAccessCollection")
      .find({})
      .toArray((err, accesses) => {
        if (err) {
          console.log("DatabaseService - getDatabaseAccessToUsers", err);
          reject({ code: 500, message: err });
        } else {
          let databaseToAccesses = {};
          for (let i = 0; i < accesses.length; i++) {
            let access = accesses[i];
            if (databaseToAccesses[access.database]) {
              databaseToAccesses[access.database] = [];
            }
            databaseToAccesses[access.database].push(access);
          }
          resolve({ code: 200, data: databaseToAccesses });
        }
      });
  });
  return promise;
}
function getDatabasesByUserId(userId) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseAccessCollection")
      .find({ "user._id": userId }, { fields: { database: 1, _id: 0 } })
      .sort({ "database.value": 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("DatabaseService - getDatabasesByUserId", err);
          reject({ code: 500, message: err });
        } else {
          let databases = [];
          for (let i = 0; i < results.length; i++) {
            databases.push(results[i].database);
          }
          resolve({ code: 200, data: databases });
        }
      });
  });
  return promise;
}
function getDatabaseRequests() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseRequestCollection")
      .find({})
      .sort({ dateCreated: 1 })
      .toArray((err, results) => {
        if (err) {
          console.log("DatabaseService - getDatabaseRequest", err);
          reject({ code: 500, message: err });
        } else {
          console.log(results);
          resolve({ code: 200, data: results });
        }
      });
  });
  return promise;
}
function deleteByCollection(collection, query) {
  return dbConn.collection(collection).deleteMany(query).then((result) => {
    return {
      collection: collection,
      deletedCount: result.deletedCount || 0,
    };
  });
}
function dropDatabase(databaseValue) {
  let promise = new Promise((resolve, reject) => {
    if (!databaseValue || !String(databaseValue).trim()) {
      reject({ code: 400, message: "Database name is required" });
      return;
    }
    const database = String(databaseValue).trim();
    dbConn
      .collection("DatabaseCollection")
      .findOne({ value: database })
      .then((databaseRecord) => {
        if (!databaseRecord) {
          reject({ code: 404, message: "Database not found" });
          return;
        }
        dbConn
          .collection("EntryCollection")
          .find({ "_data.database": database }, { fields: { _id: 1 } })
          .toArray()
          .then((entries) => {
            const entryIds = entries.map((entry) => entry._id.toString());
            const entryObjectIds = entries.map((entry) => entry._id);
            const deleteTasks = [
              deleteByCollection("DatabaseCollection", { value: database }),
              deleteByCollection("DatabaseAccessCollection", {
                $or: [{ "database.value": database }, { database: database }],
              }),
              deleteByCollection("DatabaseRequestCollection", {
                $or: [
                  { value: database },
                  { "database.value": database },
                  { database: database },
                ],
              }),
              deleteByCollection("SequenceCollection", { database: database }),
              deleteByCollection("FieldCollection", { database: database }),
              deleteByCollection("ChoiceCollection", { database: database }),
              deleteByCollection("LayoutCollection", { database: database }),
              deleteByCollection("HeaderSetCollection", { database: database }),
              deleteByCollection("FilterSetCollection", { database: database }),
              deleteByCollection("AutomationCollection", { database: database }),
              deleteByCollection("EntryCollection", {
                "_data.database": database,
              }),
            ];
            if (entryIds.length > 0) {
              deleteTasks.push(
                deleteByCollection("CommentCollection", {
                  entryId: { $in: entryIds },
                })
              );
              deleteTasks.push(
                deleteByCollection("HistoryCollection", {
                  entryId: { $in: entryIds.concat(entryObjectIds) },
                })
              );
            }
            Promise.all(deleteTasks)
              .then((results) => {
                const summary = {};
                results.forEach((result) => {
                  summary[result.collection] = result.deletedCount;
                });
                resolve({ code: 200, data: summary });
              })
              .catch((err) => {
                console.log("DatabaseService - dropDatabase", err);
                reject({ code: 500, message: err });
              });
          })
          .catch((err) => {
            console.log("DatabaseService - dropDatabase", err);
            reject({ code: 500, message: err });
          });
      })
      .catch((err) => {
        console.log("DatabaseService - dropDatabase", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
function updateDatabaseAccess(wrappedAccess, createdBy) {
  let today = new Date();
  let database = wrappedAccess.database;
  let selectedUsers = wrappedAccess.selectedUsers;
  delete database.groups;
  let promise = new Promise((resolve, reject) => {
    getAccessesByDatabase(database.value).then((response) => {
      let accesses = response.data;
      let accessDict = {};
      let newAccesses = [];
      for (let i = 0; i < accesses.length; i++) {
        accessDict[accesses[i].user._id] = accesses[i];
      }
      for (let i = 0; i < selectedUsers.length; i++) {
        let user = selectedUsers[i];
        if (accessDict[user._id]) {
          newAccesses.push(accessDict[user._id]);
        } else {
          let access = {};
          access.database = database;
          access.user = user;
          access.createdBy = createdBy;
          access.dateCreated = today;
          newAccesses.push(access);
        }
      }
      dbConn
        .collection("DatabaseAccessCollection")
        .deleteMany({ "database.value": database.value })
        .then(() => {
          if (newAccesses.length > 0) {
            dbConn
              .collection("DatabaseAccessCollection")
              .insertMany(newAccesses, (err, results) => {
                if (err) {
                  console.log("DatabaseService - updateDatabaseAccess", err);
                  reject({ code: 500, message: err });
                } else {
                  resolve({ code: 200 });
                }
              });
          } else {
            resolve({ code: 200 });
          }
        });
    });
  });
  return promise;
}
function updateGroupsInDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    console.log(database);
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

module.exports = {
  setDb,
  addDatabase,
  addRequest,
  dropDatabase,
  getAccessesByDatabase,
  getAllDatabases,
  getDatabaseToAccesses,
  getDatabasesByUserId,
  getDatabaseRequests,
  updateDatabaseAccess,
  updateGroupsInDatabase,
  updateUsersInDatabasesGroups,
};
