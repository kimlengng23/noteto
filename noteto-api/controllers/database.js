const express = require("express");
const helper = require("../js/helper.js");
const databaseService = require("../services/database.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  databaseService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyAdminToken, (req, res) => {
  let database = req.body;
  database.createdBy = {
    _id: req.decoded.userId,
    first: req.decoded.first,
    last: req.decoded.last,
    username: req.decoded.username,
  };
  databaseService
    .addDatabase(database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/templates", helper.verifyAdminToken, (req, res) => {
  databaseService
    .getTemplates()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/template/spawn", helper.verifyAdminToken, (req, res) => {
  let request = req.body || {};
  request.createdBy = {
    _id: req.decoded.userId,
    first: req.decoded.first,
    last: req.decoded.last,
    username: req.decoded.username,
  };
  databaseService
    .spawnTemplate(request.templateKey, request)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/add/request", helper.verifyToken, (req, res) => {
  let request = req.body;
  request.createdBy = {
    _id: req.decoded.userId,
    first: req.decoded.first,
    last: req.decoded.last,
    username: req.decoded.username,
  };
  request.dateCreated = new Date();
  databaseService
    .addRequest(request)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/database/to/accesses", helper.verifyAdminToken, (req, res) => {
  databaseService
    .getDatabaseToAccesses()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/all/", helper.verifyAdminToken, (req, res) => {
  databaseService
    .getAllDatabases()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get(
  "/get/accesses/by/database/:database",
  helper.verifyAdminToken,
  (req, res) => {
    databaseService
      .getAccessesByDatabase(req.params.database)
      .then((response) => {
        res.status(response.code).send(response.data);
      })
      .catch((response) => {
        res.status(response.code).send(response.message);
      });
  }
);
app.get("/get/by/userId/:userId", (req, res) => {
  databaseService
    .getDatabasesByUserId(req.params.userId)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/requests", helper.verifyAdminToken, (req, res) => {
  databaseService
    .getDatabaseRequests()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/drop", helper.verifyAdminToken, (req, res) => {
  databaseService
    .dropDatabase(req.body.database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update/access", helper.verifyAdminToken, (req, res) => {
  let wrappedAccess = req.body;
  let createdBy = {
    _id: req.decoded.userId,
    first: req.decoded.first,
    last: req.decoded.last,
    username: req.decoded.username,
  };
  databaseService
    .updateDatabaseAccess(wrappedAccess, createdBy)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update/groups", helper.verifyAdminToken, (req, res) => {
  let database = req.body;
  databaseService
    .updateGroupsInDatabase(database)
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
