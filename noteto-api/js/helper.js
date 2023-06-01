const { ObjectId } = require("mongodb");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const _ = require("lodash");
const secret = fs.readFileSync(path.join(__dirname, "/../keys/key.private"));
let dbConn = null;
let excludedUrls = {
  "/api/user/register": true,
  "/api/user/login": true,
  "/api/user/logout": true,
  "/api/user/get/avatars": true,
  "/api/user/get/avatar": true,
};
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
    let date = new Date().getTime();
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
    let date = new Date().getTime();
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

function getTokenBySessionId(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("SessionCollection")
      .findOne({ _id: ObjectId(id) }, (err, session) => {
        if (err) {
          console.log("helper - getTokenBySessionId", err);
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
function verifyAdminToken(req, res, next) {
  let authorization = req.headers["authorization"];
  if (authorization) {
    let sessionId = authorization;
    getTokenBySessionId(sessionId).then((response) => {
      let session = response.data;
      jwt.verify(session.token, secret, (err, decoded) => {
        if (err) {
          console.log("helper - verifyToken", err);
          res.sendStatus(401);
        } else {
          if (decoded.options && decoded.options.isAdmin) {
            req.decoded = decoded;
            req.decoded.sessionId = sessionId;
            next();
          } else {
            res.sendStatus(401);
          }
        }
      });
    });
  } else {
    return res.sendStatus(401);
  }
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
  let authorization = req.headers["authorization"];
  let url = req.originalUrl.split("?")[0];
  console.log(url, authorization);
  if (excludedUrls[url] || url.indexOf("/id/") >= 0) {
    return next();
  }
  if (authorization) {
    let sessionId = authorization;
    getTokenBySessionId(sessionId).then((response) => {
      let session = response.data;
      jwt.verify(session.token, secret, (err, decoded) => {
        if (err) {
          console.log("helper - verifyToken", err);
          res.sendStatus(401);
        } else {
          req.decoded = decoded;
          req.decoded.sessionId = sessionId;
          next();
        }
      });
    });
  } else {
    return res.sendStatus(401);
  }
}
//=======================================================================================
function getEntryText(field, fldVal) {
  if (!_.isNumber(fldVal) && _.isEmpty(fldVal)) {
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
    let date = new Date(fldVal);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
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
function getFullName(user) {
  return user.first.trim() + " " + user.last.trim();
}
//=====================================File Upload=======================================
const multer = require("multer");
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
let upload = multer({ storage: storage }).fields([{ name: "images" }]);
function setDb(conn) {
  dbConn = conn;
}
module.exports = {
  getSalt,
  getHash,
  getEntryText,
  createSession,
  createVerifySession,
  getTokenBySessionId,
  removeTokenBySessionId,
  verifyAdminToken,
  verifyEmailToken,
  verifyToken,
  upload,
  setDb,
};
