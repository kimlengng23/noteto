const express = require("express");
const helper = require("../js/helper.js");
const headerSetService = require("../services/header-set.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
    headerSetService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", helper.verifyToken, (req, res) => {
    let headerSet = req.body;
    let todayDate = new Date();
    let createdBy = {
        _id: req.decoded.userId,
        first: req.decoded.first,
        last: req.decoded.last,
        username: req.decoded.username,
    };
    headerSet.dateCreated = todayDate;
    headerSet.createdBy = createdBy;
    if (headerSet.fields.length == 0) {
        return res.sendStatus(200);
    }
    headerSetService
        .addHeaderSet(headerSet)
        .then((response) => {
            res.status(response.code).send(response.data);
        })
        .catch((response) => {
            res.status(response.code).send(response.message);
        });
});
app.get("/get/database/to/header/sets", (req, res) => {
    headerSetService
        .getDatabaseToHeaderSets()
        .then((response) => {
            res.status(response.code).send(response.data);
        })
        .catch((response) => {
            res.status(response.code).send(response.message);
        });
});
app.get("/get/by/database/:database", (req, res) => {
    let database = req.params.database;
    headerSetService
        .getHeaderSetsByDatabase(database)
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
        headerSetService
            .removeHeaderSetsByDatabase(database)
            .then((response) => {
                res.sendStatus(response.code);
            })
            .catch((response) => {
                res.status(response.code).send(response.message);
            });
    }
);
app.get("/set/favorite/by/id/:id",helper.verifyToken,(req,res) => {
    let userId = req.decoded.userId;
    let id = req.params.id;
    headerSetService.setFavoriteHeaderSetById(id,userId).then(response => {
        res.sendStatus(response.code);
    }).catch((response) => {
        res.status(response.code).send(response.message);
    })
})

module.exports = {
    app,
    setDb,
};
