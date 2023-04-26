const express = require("express");
const helper = require("../helper.js");
const fieldService = require("../services/field.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  fieldService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", (req, res) => {
  let field = req.body;
  fieldService
    .addField(field)
    .then((response) => {
      //console.log(response);
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/database/:database", (req, res) => {
  fieldService.getFieldsByDatabase();
});
app.get("/get/database/to/fields", (req, res) => {
  fieldService
    .getDatabaseToFields()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update", (req, res) => {
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
module.exports = {
  app,
  setDb,
};
