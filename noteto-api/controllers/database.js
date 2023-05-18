const express = require("express");
const helper = require("../js/helper.js");
const databaseService = require("../services/database.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  databaseService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyAdminToken, (req, res) => {
  let database = req.body;
  databaseService
    .addDatabase(database)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/all/", helper.verifyAdminToken, (req, res) => {
  databaseService
    .getAllDatabases()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/by/userId/:userId", (req, res) => {
  databaseService
    .getDatabasesByUserId(req.params.userId)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update/groups", helper.verifyAdminToken, (req, res) => {
  let database = req.body;
  databaseService
    .updateGroupsInDatabase(database)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
module.exports = {
  app,
  setDb,
};
