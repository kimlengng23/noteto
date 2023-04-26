const { MongoClient, ObjectID } = require("mongodb");
const connUrl = "mongodb://127.0.0.1:27017";
const dbName = "Noteto";
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
