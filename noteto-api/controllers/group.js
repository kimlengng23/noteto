const express = require("express");
const helper = require("../helper.js");
const groupService = require("../services/group.js");
const databaseService = require("../services/database.js");
const app = express();
const path = require("path");
const { resolve } = require("path");
const { group } = require("console");

//const mail = require('./mail.js');

let dbConn = null;

function setDb(conn) {
  groupService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);

app.post("/add", helper.verifyAdminToken, (req, res) => {
  let group = req.body;
  groupService
    .addGroup(group)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/all", helper.verifyAdminToken, (req, res) => {
  groupService
    .getAllGroups()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/by/id/:id", helper.verifyAdminToken, (req, res) => {
  groupService
    .getGroupById(req.params.id)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/add/user", helper.verifyAdminToken, (req, res) => {
  let userGroupInfo = req.body;
  groupService
    .addUserToGroup(userGroupInfo)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update/members", helper.verifyAdminToken, (req, res) => {
  let group = req.body;
  let promises = [];
  promises.push(groupService.updateUsersInGroup(group));
  promises.push(databaseService.updateUsersInDatabasesGroups(group));
  Promise.all(promises)
    .then((responses) => {
      res.sendStatus(200);
    })
    .catch((responses) => {
      let messages = [];
      responses.forEach((response) => {
        messages.push(response.message);
      });
      res.status(500).send(messages);
    });
});
module.exports = {
  app,
  setDb,
};
