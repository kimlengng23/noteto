const express = require("express");
const helper = require("../helper.js");
const databaseService = require("../services/database.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  databaseService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", (req, res) => {
  let database = req.body;
  databaseService
    .addDatabase(database)
    .then((response) => {
      console.log(response);
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/all/", (req, res) => {
  databaseService
    .getAllDatabases()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/userId/:userId", (req, res) => {
  databaseService
    .getDatabasesByUserId(req.params.userId)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/users/database/:database", (req, res) => {
  databaseService
    .getUsersByDatabase(req.params.database)
    .then((response) => {
      console.log("users", response);
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update/groups", (req, res) => {
  let database = req.body;
  databaseService
    .updateGroupsInDatabase(database)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      console.log(response);
      res.status(response.code).send(response.message);
    });
});
module.exports = {
  app,
  setDb,
};
