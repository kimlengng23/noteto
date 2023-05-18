require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const https = require("https");
const fs = require("fs");
const app = express();
const key = fs.readFileSync(path.join(__dirname, "certs", "server.key"));
const cert = fs.readFileSync(path.join(__dirname, "certs", "server.crt"));
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
const publicController = require("./controllers/public.js");
const { fstat } = require("fs");

app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "..", "dist")));
app.use("/asset", express.static(path.join(__dirname, "assets")));
app.get("/get/version", (req, res) => {
  res.status(200).send("version 0.1");
});
app.use("/public", publicController.app);
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
const httpServer = http.createServer(app);
const httpsServer = https.createServer(
  {
    key: key,
    cert: cert,
  },
  app
);
// httpServer.listen(nonSecuredPort, () => {
//   console.log("App is listening on port ", nonSecuredPort);
// });
httpsServer.listen(process.env.SECURED_PORT, () => {
  console.log("App is listening on port ", process.env.SECURED_PORT);
});
database.createDbConn().then((dbConn) => {
  automationController.setDb(dbConn);
  commentController.setDb(dbConn);
  publicController.setDb(dbConn);
  userController.setDb(dbConn);
  miscellaneousController.setDb(dbConn);
  databaseController.setDb(dbConn);
  groupController.setDb(dbConn);
  fieldController.setDb(dbConn);
  choiceController.setDb(dbConn);
  layoutController.setDb(dbConn);
  entryController.setDb(dbConn);
});
