const { MongoClient, ObjectID } = require("mongodb");
const connUrl = process.env.CONN_STR;
const dbName = process.env.DB_NAME;
console.log(dbName,connUrl)
const connOption = {
  useUnifiedTopology: true,
};
function createDbConn() {
  let promise = new Promise((resolve, reject) => {
    MongoClient.connect(connUrl, connOption, (error, client) => {
      if (error) {
        console.log("Unable to connect to database");
        reject("Unable to connect to database!");
      }
      console.log("Successfully connected to database!");
      resolve(client.db(dbName));
    });
  });
  return promise;
}
module.exports = {
  createDbConn,
};
