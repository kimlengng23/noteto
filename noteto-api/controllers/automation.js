const express = require("express");
const helper = require("../helper.js");
const automationService = require("../services/automation.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  automationService.setDb(conn);
}
app.use(express.json());
app.use(helper.verifyToken);

app.post("/add/", helper.verifyAdminToken, (req, res) => {
  let automation = req.body;
  automationService
    .addAutomation(automation)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/by/database/:database", (req, res) => {
  automationService
    .getAutomationsByDatabase(req.params.database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update", helper.verifyAdminToken, (req, res) => {
  let automation = req.body;
  automationService
    .updateAutomation(automation)
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
