const express = require("express");
const path = require("path");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const app = express();

const database = require("./database.js");
const automationController = require("./controllers/automation.js");
const commentController = require("./controllers/comment.js");
const databaseController = require("./controllers/database.js");
const userController = require("./controllers/user.js");
const miscellaneousController = require("./controllers/miscellaneous.js");
const groupController = require("./controllers/group.js");
const fieldController = require("./controllers/field.js");
const choiceController = require("./controllers/choice.js");
const layoutController = require("./controllers/layout.js");
const entryController = require("./controllers/entry.js");
const { fstat } = require("fs");

app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "..", "dist")));
app.get("/get/version", (req, res) => {
  res.status(200).send("version 0.1");
});
app.use("/api/automation", automationController.app);
app.use("/api/comment", commentController.app);
app.use("/api/user/", userController.app);
app.use("/api/miscellaneous/", miscellaneousController.app);
app.use("/api/database/", databaseController.app);
app.use("/api/group/", groupController.app);
app.use("/api/field/", fieldController.app);
app.use("/api/choice/", choiceController.app);
app.use("/api/layout/", layoutController.app);
app.use("/api/entry", entryController.app);
const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
  },
  app
);
sslServer.listen(3000, () => {
  console.log("App is listening on port 3000");
  database.createDbConn().then((dbConn) => {
    automationController.setDb(dbConn);
    commentController.setDb(dbConn);
    userController.setDb(dbConn);
    miscellaneousController.setDb(dbConn);
    databaseController.setDb(dbConn);
    groupController.setDb(dbConn);
    fieldController.setDb(dbConn);
    choiceController.setDb(dbConn);
    layoutController.setDb(dbConn);
    entryController.setDb(dbConn);
  });
});
