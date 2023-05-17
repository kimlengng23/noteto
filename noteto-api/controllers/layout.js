const express = require("express");
const helper = require("../helper.js");
const layoutService = require("../services/layout.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  layoutService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyAdminToken, (req, res) => {
  let layout = req.body;
  layoutService
    .addLayout(layout)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/database/to/layout/mappings", (req, res) => {
  layoutService
    .getDatabaseToLayoutMappings()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/:database", (req, res) => {
  let database = req.params.database;
  layoutService
    .getLayoutByDatabase(database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});

app.get("/remove/:database", helper.verifyAdminToken, (req, res) => {
  let database = req.params.database;
  layoutService
    .removeLayoutByDatabase(database)
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
