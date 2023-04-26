const helper = require("../helper.js");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function getAllHeaders() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("HeaderCollection")
      .find({ database: req.params.database })
      .toArray((err, headers) => {
        if (err) {
          console.log("HeaderService - getAllHeaders", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: headers });
        }
      });
  });
  return promise;
}
function removeHeaders(database) {
  let promise = new Promise((resolve, reject) => {
    try {
      dbConn.collection("HeaderCollection").deleteMany({ database: database });
      resolve({ code: 200 });
    } catch (err) {
      console.log("HeaderService - removeHeader", err);
      reject({ code: 500, message: err });
    }
  });
  return promise;
}
module.exports = {
  setDb,
  getAllHeaders,
};
