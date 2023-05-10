const helper = require("../helper.js");
const { ObjectId } = require("mongodb");
const fieldService = require("./field.js");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
  fieldService.setDb(conn);
}
function getReceiptById(id) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("EntryCollection")
      .findOne({ _id: new ObjectId(id) }, (err, result) => {
        if (err) {
          console.log("EntryService - getEntryById", err);
          reject({ code: 500, message: err });
        } else {
          console.log(result);
          fieldService.getFieldsByDatabase(result.database).then((response) => {
            let fields = response.data;
            let entry = {};
            for (let i = 0; i < fields.length; i++) {
              let field = fields[i];
              let fldVal = result[field.value];
              entry[field.value] = helper.getEntryText(field, fldVal);
            }
            resolve({ code: 200, data: entry });
          });
        }
      });
  });
  return promise;
}
module.exports = {
  setDb,
  getReceiptById,
};
