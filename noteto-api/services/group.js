const helper = require("../helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addGroup(group) {
  group["dateCreated"] = new Date().getTime();
  group["isActive"] = true;
  let promise = new Promise((resolve, reject) => {
    dbConn.collection("GroupCollection").insertOne(group, (err, result) => {
      if (err) {
        console.log("GroupService - addGroup", err);
        reject({ code: 500, message: err });
      } else {
        resolve({ code: 200, data: { insertedId: result.ops[0]._id } });
      }
    });
  });
  return promise;
}
function getGroupById(groupId) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("GroupCollection")
      .findOne({ _id: ObjectId(groupId) }, (err, group) => {
        if (err) {
          console.log("GroupService - getGroupId", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: group });
        }
      });
  });
  return promise;
}
function addUserToGroup(userGroupInfo) {
  let groupId = userGroupInfo.groupId;
  let user = userGroupInfo.user;
  let query = { _id: new ObjectId(groupId) };
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("SystemUser")
      .updateOne(query, {
        $push: { users: user },
      })
      .then((result) => {
        if (result.matchedCount > 0) {
          res.sendStatus(200);
        }
      });
  });
  return promise;
}
function getGroupByValue(value) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("GroupCollection")
      .findOne({ value: value }, (err, group) => {
        if (err) {
          console.log("GroupService - getGroupByValue", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: group });
        }
      });
  });
  return promise;
}
function getAllGroups() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("GroupCollection")
      .find({})
      .sort({ displayName: 1 })
      .toArray((err, groups) => {
        if (err) {
          console.log("GroupService - getAllGroups", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: groups });
        }
      });
  });
  return promise;
}
function updateUsersInGroup(group) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("GroupCollection")
      .updateOne(
        { _id: ObjectId(group.groupId) },
        { $set: { users: group.users } }
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
  addGroup,
  getGroupById,
  addUserToGroup,
  getGroupByValue,
  getAllGroups,
  updateUsersInGroup,
};
