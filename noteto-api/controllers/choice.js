const express = require("express");
const helper = require("../js/helper.js");
const choiceService = require("../services/choice.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  choiceService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyAdminToken, (req, res) => {
  let choices = req.body;
  choiceService
    .addChoices(choices)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/by/database/:database", (req, res) => {
  choiceService
    .getChoicesByDatabase(req.params.database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/database/to/choices", helper.verifyAdminToken, (req, res) => {
  choiceService
    .getDatabaseToChoices()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update", helper.verifyAdminToken, (req, res) => {
  let choices = req.body;
  choiceService
    .updateChoices(choices)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
module.exports = {
  app,
  setDb,
};
