const express = require("express");
const helper = require("../js/helper.js");
const filterSetService = require("../services/filter-set.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  filterSetService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyToken, (req, res) => {
  let filterSet = req.body;
  let todayDate = new Date();
  let createdBy = {
    _id: req.decoded.userId,
    first: req.decoded.first,
    last: req.decoded.last,
    username: req.decoded.username,
  };
  filterSet.dateCreated = todayDate;
  filterSet.createdBy = createdBy;
  filterSetService
    .addFilterSet(filterSet)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/database/to/filter/sets", (req, res) => {
  filterSetService
    .getDatabaseToFilterSets()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/by/database/:database", (req, res) => {
  let database = req.params.database;
  filterSetService
    .getFilterSetsByDatabase(database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get(
  "/remove/by/database/:database",
  helper.verifyAdminToken,
  (req, res) => {
    let database = req.params.database;
    filterSetService
      .removeFilterSetsByDatabase(database)
      .then((response) => {
        res.sendStatus(response.code);
      })
      .catch((response) => {
        res.status(response.code).send(response.message);
      });
  }
);
app.post("/set/favorite", helper.verifyToken, (req, res) => {
  let userId = req.decoded.userId;
  let favorite = req.body;
  favorite.createdById = userId;
  filterSetService
    .setFavoriteFilterSet(favorite)
    .then((response) => {
      res.sendStatus(response.code);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/update", helper.verifyToken, (req, res) => {
  let filterSet = req.body;
  filterSetService
    .updateFilterSet(filterSet)
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
