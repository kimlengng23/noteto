const { ObjectId } = require("mongodb");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const _ = require("lodash");
const secretPath = path.join(__dirname, "/../keys/key.private");
const secret = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : fs.existsSync(secretPath)
  ? fs.readFileSync(secretPath)
  : "noteto-development-secret";
if (!process.env.JWT_SECRET && !fs.existsSync(secretPath)) {
  console.warn("JWT_SECRET is not set. Using a development-only JWT secret.");
}
let dbConn = null;
// let excludedUrls = {
// 	"/api/user/register": true,
// 	"/api/user/login": true,
// 	"/api/user/logout": true,
// 	"/api/user/get/avatars": true,
// 	"/api/user/get/avatar": true,
// };
function setDb(conn) {
  dbConn = conn;
}
function getSalt() {
  return crypto.randomBytes(32).toString("hex");
}
function getHash(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}
function createSession(sessionInfo) {
  let promise = new Promise((resolve, reject) => {
    let session = {};
    let token = jwt.sign(sessionInfo, secret, { expiresIn: "7 days" });
    let date = new Date();
    session["userId"] = sessionInfo.userId;
    session["token"] = token;
    session["dateCreated"] = date;
    session["isActive"] = true;
    dbConn.collection("SessionCollection").insertOne(session, (err, result) => {
      if (err) {
        console.log("Helper - createSession", err);
        reject({ code: 500, message: err });
      } else {
        resolve({ code: 200, data: result.ops[0] });
      }
    });
  });
  return promise;
}
function createVerifySession(sessionInfo) {
  let promise = new Promise((resolve, reject) => {
    let session = {};
    let token = jwt.sign(sessionInfo, secret, { expiresIn: "1 days" });
    let date = new Date();
    session["email"] = sessionInfo["email"].toLowerCase().trim();
    session["token"] = token;
    session["dateCreated"] = date;
    session["isActive"] = true;
    dbConn
      .collection("VerifySessionCollection")
      .insertOne(session, (err, result) => {
        if (err) {
          console.log("Helper - createSession", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: result.ops[0] });
        }
      });
  });
  return promise;
}

function getSessionByToken(token) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("SessionCollection")
      .findOne({ token: token }, (err, session) => {
        if (err) {
          console.log("helper - getSessionByToken", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: session });
        }
      });
  });
  return promise;
}
function getVerifyTokenBySessionId(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("VerifySessionCollection")
      .findOne({ _id: ObjectId(id), isActive: true }, (err, session) => {
        if (err) {
          console.log("helper - getTokenBySessionId", err);
          reject({ code: 500, message: err });
        } else if (session == null) {
          reject({ code: 404 });
        } else {
          resolve({ code: 200, data: session });
        }
      });
  });
  return promise;
}
function removeTokenBySessionId(sessionId) {
  let promise = new Promise((resolve, reject) => {
    let change = { isActive: false };
    try {
      dbConn
        .collection("SessionCollection")
        .findOneAndUpdate({ _id: ObjectId(sessionId) }, { $set: change });
      resolve({ code: 200 });
    } catch (err) {
      reject({ code: 500, message: err });
    }
  });
  return promise;
}
function removeVerifyTokenBySessionId(sessionId) {
  let promise = new Promise((resolve, reject) => {
    let change = { isActive: false };
    try {
      dbConn
        .collection("VerifySessionCollection")
        .findOneAndUpdate({ _id: ObjectId(sessionId) }, { $set: change });
      resolve({ code: 200 });
    } catch (err) {
      reject({ code: 500, message: err });
    }
  });
  return promise;
}
function verifyAccess(req, res, next) {
  let entryId = req.params.id;
  dbConn
    .collection("EntryCollection")
    .findOne(
      { _id: ObjectId(entryId), "_data.isActive": true },
      (err, result) => {
        if (err) {
          console.log("Helper - verifyAccess", err);
          res.status(500).send(err);
        } else {
          let userId = req.decoded.userId;
          if (result && result.assignedTo && result.assignedTo._id == userId) {
            next();
          } else if (
            result &&
            result._data &&
            result._data.createdBy &&
            result._data.createdBy._id == userId
          ) {
            next();
          } else if (
            result &&
            result.createdBy &&
            result.createdBy._id == userId
          ) {
            next();
          } else if (result) {
            let databaseValue = result._data.database;
            dbConn.collection("DatabaseAccessCollection").findOne(
              {
                "database.value": databaseValue,
                "user._id": userId,
              },
              (err, result) => {
                if (err) {
                  console.log("Helper - verifyAccess", err);
                  res.status(500).send(err);
                } else if (result) {
                  next();
                } else {
                  res.sendStatus(401);
                }
              }
            );
          } else {
            res.sendStatus(404);
          }
        }
      }
    );
}
function verifyAdminToken(req, res, next) {
  verifyToken(req, res, next);
}
function verifyEmailToken(req, res, next) {
  getVerifyTokenBySessionId(req.params.sessionId)
    .then((response) => {
      let session = response.data;
      jwt.verify(session.token, secret, (err, decoded) => {
        if (err) {
          console.log("helper - emailVerifyToken", err);
          res.sendStatus(500);
        } else {
          req.decoded = decoded;
          removeVerifyTokenBySessionId(req.params.sessionId);
          next();
        }
      });
    })
    .catch((response) => {
      res.sendStatus(response.code);
    });
}
function verifyToken(req, res, next) {
  let authorizationHeader = req.headers["authorization"] || "";
  let authorization = authorizationHeader.split(" ")[1];
  let url = req.originalUrl.split("?")[0];
  //console.log(url, authorization);
  if (authorization) {
    let token = authorization;
    getSessionByToken(token)
      .then((response) => {
        if (response.data) {
          jwt.verify(token, secret, (err, decoded) => {
            if (err) {
              console.log("helper - verifyToken", err);
              res.sendStatus(401);
            } else {
              req.decoded = decoded;
              next();
            }
          });
        } else {
          res.sendStatus(401);
        }
      })
      .catch((err) => {
        console.log("helper - verifyToken", err);
        res.sendStatus(401);
      });
  } else {
    return res.sendStatus(401);
  }
}
//=======================================================================================
function getEntryText(field, fldVal) {
  if (!_.isNumber(fldVal) && _.isEmpty(fldVal) && !(fldVal instanceof Date)) {
    return "";
  }
  if (field.type == "multipleSelect") {
    return fldVal.map((e) => e.displayName).join(", ");
  } else if (field.type == "singleSelect") {
    return fldVal.displayName;
  } else if (field.type == "singleUser") {
    return getFullName(fldVal);
  } else if (field.type.includes("currency")) {
    return _.round(fldVal, field.options.precision);
  } else if (field.type.includes("weight")) {
    return _.round(fldVal, field.options.precision);
  } else if (field.type == "multipleUsers") {
    return fldVal.map((e) => getFullName(e)).join(", ");
  } else if (field.type == "date") {
    return formatDate(fldVal);
  } else if (field.type == "number") {
    return fldVal;
  } else if (field.type == "list") {
    let lst = [];
    for (let i = 0; i < fldVal.length; i++) {
      let fldValI = fldVal[i];
      let e = {};
      for (let j = 0; j < field.listFields.length; j++) {
        let fieldJ = field.listFields[j];
        e[fieldJ.value] = getEntryText(fieldJ, fldValI[fieldJ.value]);
      }
      lst.push(e);
    }
    return lst;
  } else {
    return fldVal;
  }
}
function isDiff(fld, oVal, nVal) {
  if (fld.type.includes("currency")) {
    return oVal != nVal;
  } else if (fld.type.includes("weight")) {
    return oVal != nVal;
  } else if (fld.type == "number") {
    return oVal != nVal;
  }
  if (_.isEmpty(oVal) != _.isEmpty(nVal)) {
    return true;
  } else if (_.isEmpty(oVal) && _.isEmpty(nVal)) {
    return false;
  }
  if (fld.type == "multipleSelect" || fld.type == "multipleUsers") {
    if (oVal.length != nVal.length) return true;
    let set = new Set();
    for (let i = 0; i < oVal.length; i++) {
      let ch = oVal[i];
      set.add(ch._id);
    }
    for (let i = 0; i < nVal.length; i++) {
      let ch = nVal[i];
      if (!set.has(ch._id)) {
        return true;
      }
    }
  } else if (fld.type == "singleSelect") {
    return oVal._id !== nVal._id;
  } else if (fld.type == "singleUser") {
    return oVal._id !== nVal._id;
  } else if (fld.type == "date") {
    let oTime = new Date(oVal).getTime();
    let nTime = new Date(nVal).getTime();
    return oTime != nTime;
  } else if (fld.type == "list") {
    if (oVal.length != nVal.length) {
      return true;
    } else {
      if (JSON.stringify(oVal) != JSON.stringify(nVal)) {
        return true;
      }
    }
  } else if (fld.type == "singleLine" || fld.type == "multipleLines") {
    return oVal.length != nVal.length || oVal != nVal;
  }
  return false;
}
function getFullName(user) {
  return user.first.trim() + " " + user.last.trim();
}
function formatDate(dateStr) {
  let date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
function getDataText(rawData) {
  let data = {};
  data.id = rawData.id;
  data.dateCreated = formatDate(rawData.dateCreated);
  data.dateModified = formatDate(rawData.dateModified);
  data.createdBy = getFullName(rawData.createdBy);
  return data;
}
//=====================================File Upload=======================================
const multer = require("multer");
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../files-prod");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
let upload = multer({ storage: storage });
function setDb(conn) {
  dbConn = conn;
}
module.exports = {
  formatDate,
  getFullName,
  getDataText,
  getSalt,
  getHash,
  getEntryText,
  createSession,
  createVerifySession,
  getSessionByToken,
  isDiff,
  removeTokenBySessionId,
  verifyAdminToken,
  verifyEmailToken,
  verifyToken,
  verifyAccess,
  upload,
  setDb,
};
