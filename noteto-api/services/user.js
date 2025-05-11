const helper = require("../js/helper.js");
const mailService = require("./mail.js");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}

function addAccount(userAccount) {
  let salt = helper.getSalt();
  let saltedPassword = helper.getHash(userAccount.password, salt);
  userAccount["dateCreated"] = new Date();
  userAccount["email"] = userAccount["email"].toLowerCase().trim();
  userAccount["username"] = userAccount["email"].toLowerCase().trim();
  userAccount["password"] = saltedPassword;
  userAccount["salt"] = salt;
  userAccount["options"] = getDefaultUserOptions();
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("UserCollection")
      .insertOne(userAccount, (err, result) => {
        if (err) {
          console.log("UserService - addAccount", err);
          reject({ code: 500, message: err });
        } else {
          let sessionInfo = {
            email: userAccount["email"].toLowerCase().trim(),
            first: userAccount["first"],
            last: userAccount["last"],
          };
          helper.createVerifySession(sessionInfo).then((response) => {
            sessionInfo["sessionId"] = response.data._id;
            mailService.sendAccountVerifyEmail(sessionInfo);
          });
          resolve({ code: 200 });
        }
      });
  });
  return promise;
}
function login(account) {
  account.email = account.email.toLowerCase().trim();
  if (!account.username) {
    account.username = account.email;
  }
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("UserCollection")
      .findOne({ username: account.username }, (err, result) => {
        console.log("check");
        if (err) {
          console.log("check");
          console.log("UserService - login", err);
          reject({ code: 500, message: err });
        } else if (result) {
          let inputSaltedPassword = helper.getHash(
            account.password,
            result.salt
          );
          if (inputSaltedPassword == result.password) {
            console.log("check");
            let sessionInfo = {
              last: result["last"],
              first: result["first"],
              userId: result["_id"].toString(),
              username: result["username"],
              options: result["options"]
                ? result["options"]
                : getDefaultUserOptions(),
            };
            helper.createSession(sessionInfo).then((response) => {
              sessionInfo["token"] = response.data.token;
              console.log(sessionInfo);
              resolve({ code: 200, data: sessionInfo });
            });
          } else {
            console.log("check");
            reject({
              code: 401,
              message: "Incorrect username or password",
            });
          }
        } else {
          console.log("check");
          reject({
            code: 401,
            message: "Incorrect username or password",
          });
        }
      });
  });
  return promise;
}

function getAllUsers() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("UserCollection")
      .find({}, { fields: { username: 1, first: 1, last: 1, dateCreated: 1 } })
      .sort({ first: 1, last: 1 })
      .toArray((err, users) => {
        if (err) {
          console.log("UserService - getAllUsers", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: users });
        }
      });
  });
  return promise;
}
function getAccountByUsername(username) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("UserCollection")
      .findOne({ username: username.toLowerCase() }, (err, result) => {
        if (err) {
          console.log("UserService - getAccountByUsername", err);
          reject({ code: 500, message: err });
        } else {
          if (result != null) {
            resolve({ code: 200, data: result });
          } else {
            resolve({ code: 404, data: null });
          }
        }
      });
  });
  return promise;
}

function getDefaultUserOptions() {
  let userOptions = {
    isVerified: false,
    isAdmin: false,
  };
  return userOptions;
}
function getUsersByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("DatabaseCollection")
      .findOne({ value: database }, (err, result) => {
        if (err) {
          console.log("UserService - getUsersByDatabase", err);
          reject({ code: 500, message: err });
        } else {
          let users = [];
          for (let i = 0; i < result.groups.length; i++) {
            let group = result.groups[i];
            users = users.concat(group.users);
          }
          resolve({ code: 200, data: users });
        }
      });
  });
  return promise;
}
function logout(sessionId) {
  let promise = new Promise((resolve, reject) => {
    helper
      .removeTokenBySessionId(sessionId)
      .then((response) => {
        resolve(response);
      })
      .catch((response) => {
        reject(response);
      });
  });
  return promise;
}
function markVerifiedByEmail(email) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("UserCollection")
      .updateOne(
        { email: email.toLowerCase().trim() },
        { $set: { "options.isVerified": true } }
      )
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  addAccount,
  getAllUsers,
  getAccountByUsername,
  getUsersByDatabase,
  login,
  logout,
  markVerifiedByEmail,
  setDb,
};
