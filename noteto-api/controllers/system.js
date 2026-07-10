const express = require("express");
const database = require("../database.js");

const app = express();
let reconnectDatabase = null;

app.use(express.json());

function setReconnectDatabase(handler) {
  reconnectDatabase = handler;
}

app.get("/database/status", (req, res) => {
  res.status(200).send(database.getStatus());
});

app.post("/database/test", (req, res) => {
  database
    .testDbConn(req.body)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((error) => {
      res.status(400).send({
        message: error.message || "Unable to connect to MongoDB.",
      });
    });
});

app.post("/database/save", (req, res) => {
  if (!reconnectDatabase) {
    res.status(500).send({ message: "Database reconnect handler is not ready." });
    return;
  }

  database
    .testDbConn(req.body)
    .then(() => {
      const config = database.saveLocalConfig(req.body);
      return reconnectDatabase().then(() => config);
    })
    .then((config) => {
      res.status(200).send(config);
    })
    .catch((error) => {
      res.status(400).send({
        message: error.message || "Unable to save MongoDB configuration.",
      });
    });
});

module.exports = {
  app,
  setReconnectDatabase,
};
