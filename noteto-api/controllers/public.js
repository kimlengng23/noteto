const express = require("express");
const helper = require("../helper.js");
const app = express();
const path = require("path");
const publicService = require("../services/public.js");
const projectPath = process.cwd();
let dbConn = null;

function setDb(conn) {
  publicService.setDb(conn);
}

app.use(express.json());
//app.use(helper.verifyToken);

app.get("/receipt", (req, res) => {
  res.sendFile(
    path.join(
      projectPath + `/custom/receipts/${req.query.database}-receipt.html`
    )
  );
});
app.get("/api/get/entry/:id", (req, res) => {
  publicService.getReceiptById(req.params.id).then((response) => {
    res.status(response.code).send(response.data);
  });
});
app.get("/dashboard", (req, res) => {
  res.sendFile(
    path.join(__dirname + `/dashboards/${req.query.database}-dashboard.html`)
  );
});
app.get("/assets/:name", (req, res) => {
  let options = {
    root: path.join(__dirname, "receipts/assets"),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };
  let pictureName = req.params.name;
  res.sendFile(pictureName, options, function (err) {
    if (err) {
      res.sendStatus(500);
      return console.log("Unable to send file");
    }
  });
});
module.exports = {
  app,
  setDb,
};
