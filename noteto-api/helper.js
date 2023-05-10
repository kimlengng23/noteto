const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const _ = require("lodash");
const secret = fs.readFileSync("key.private");
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
function getTokenBySessionId(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("SessionCollection")
      .findOne({ _id: id }, (err, session) => {
        if (err) {
          console.log("Helper - getTokenBySessionId", err);
          reject({ code: 500, message: err });
        } else if (session) {
          resolve({ code: 200, data: result.token });
        } else {
          reject({ code: 404, message: "Session not found." });
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
function getTokenFromBySessionId(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("SessionCollection")
      .findOne({ _id: ObjectId(id) }, (err, session) => {
        if (err) {
          console.log("helper - getTokenFromBySessionId", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: session });
        }
      });
  });
  return promise;
}
function verifyToken(req, res, next) {
  let authorization = req.headers["authorization"];
  let url = req.originalUrl.split("?")[0];
  console.log(authorization, url);
  if (excludedUrls[url] || url.indexOf("/id/") >= 0) {
    return next();
  }
  if (authorization) {
    let sessionId = authorization;
    getTokenFromBySessionId(sessionId).then((response) => {
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
  if (!fldVal) {
    return "";
  }
  if (field.type == "multipleSelect") {
    return fldVal.map((e) => e.displayName).join(", ");
  } else if (field.type == "singleSelect") {
    return fldVal.displayName;
  } else if (field.type == "singleUser") {
    return getFullName(fldVal);
  } else if (field.type.includes("currency")) {
    return (
      field.options.prefix + " " + _.round(fldVal, field.options.precision)
    );
  } else if (field.type.includes("weight")) {
    return (
      _.round(fldVal, field.options.precision) + " " + field.options.suffix
    );
  } else if (field.type == "multipleUsers") {
    return fldVal.map((e) => getFullName(e)).join(", ");
  } else if (field.type == "date") {
    let date = new Date(fldVal);
    return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
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
  return user.first + " " + user.last;
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
  getTokenFromBySessionId,
  removeTokenBySessionId,
  verifyToken,
  upload,
  setDb,
};
