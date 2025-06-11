const express = require("express");
const helper = require("../js/helper.js");
const app = express();
const path = require("path");
let dbConn = null;

function setDb(conn) {
  fieldService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post(
  "/upload",
  [helper.verifyToken, helper.verifyAccess, helper.upload("file")],
  (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send("No file upload.");
    let fileEntry = {};
    fileEntry.originalName = file.originalname;
    fileEntry.fileName = file.fileName;
    file.mimetype = file.mimetype;
    file.size = file.size;
    file.path = file.path;
    fileService.addFileEntry(fileEntry).then((response) => {
      res.sendStatus(response.code);
    });
  }
);
app.post(
  "/get/by/entry/id/:id",
  [helper.verifyToken, helper.verifyAccess],
  (req, res) => {
    let fields = req.body;
    fieldService
      .addFields(fields)
      .then((response) => {
        res.status(response.code).send(response.data);
      })
      .catch((response) => {
        res.status(response.code).send(response.message);
      });
  }
);

module.exports = {
  app,
  setDb,
};
