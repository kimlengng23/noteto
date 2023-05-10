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
          fieldService.getFieldsByDatabase(result.database).then((response) => {
            let fields = response.data;
            let entry = {};
            for (let i = 0; i < fields.length; i++) {
              entry[fields[i].value] = helper.getEntryText(fields[i], result);
            }
            resolve({ code: 200, data: entry });
          });
          //   getEmptyEntryByDatabase(result.database).then((response) => {
          //     let emptyEntry = response.data;
          //     let fields = Object.keys(emptyEntry);
          //     emptyEntry["_id"] = result["_id"];
          //     for (let i = 0; i < fields.length; i++) {
          //       let field = fields[i];
          //       if (result[field]) {
          //         emptyEntry[field] = result[field];
          //       }
          //     }
          //     resolve({ code: 200, data: emptyEntry });
          //   });
        }
      });
  });
  return promise;
}
module.exports = {
  setDb,
  getReceiptById,
};
