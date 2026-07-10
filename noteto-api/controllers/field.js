const express = require("express");
const helper = require("../js/helper.js");
const fieldService = require("../services/field.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  fieldService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyAdminToken, (req, res) => {
  let field = req.body;
  fieldService
    .addField(field)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/add/list", helper.verifyAdminToken, (req, res) => {
  let fields = req.body;
  fieldService
    .addFields(fields)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/by/database/:database", (req, res) => {
  fieldService
    .getFieldsByDatabase(req.params.database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/database/to/fields", helper.verifyAdminToken, (req, res) => {
  fieldService
    .getDatabaseToFields()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update", helper.verifyAdminToken, (req, res) => {
  let field = req.body;
  fieldService
    .updateField(field)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/delete", helper.verifyAdminToken, (req, res) => {
  let field = req.body;
  fieldService
    .deleteField(field)
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
