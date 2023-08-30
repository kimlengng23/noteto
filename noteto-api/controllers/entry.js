const express = require("express");
const helper = require("../js/helper.js");
const entryService = require("../services/entry.js");
const app = express();

let dbConn = null;

function setDb(conn) {
	entryService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add", (req, res) => {
	let wrappedEntry = req.body;
	let todayDate = new Date();
	let createdBy = {
		_id: req.decoded.userId,
		first: req.decoded.first,
		last: req.decoded.last,
		username: req.decoded.username,
	};
	let data = {
		database: wrappedEntry.database,
		createdBy: createdBy,
		dateCreated: todayDate,
		dateLastModified: todayDate,
		isActive: true,
	};
	wrappedEntry.oldEntry._data = data;
	wrappedEntry.newEntry._data = data;
	entryService
		.addEntry2(wrappedEntry.oldEntry, wrappedEntry.newEntry)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/delete/by/id/:id", (req, res) => {
	entryService
		.deleteEntryById(req.params.id)
		.then((response) => {
			res.sendStatus(response.code);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/database/:database", (req, res) => {
	entryService
		.getEntriesByDatabase(req.params.database)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/id/:id", (req, res) => {
	entryService
		.getEntryById(req.params.id)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/empty/:database", (req, res) => {
	let database = req.params.database;
	entryService
		.getEmptyEntryByDatabase(database)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.post("/update/", (req, res) => {
	let wrappedEntry = req.body;
	let createdBy = {
		_id: req.decoded.userId,
		first: req.decoded.first,
		last: req.decoded.last,
		username: req.decoded.username,
	};
	entryService
		.updateEntry2(wrappedEntry.oldEntry, wrappedEntry.newEntry, createdBy)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/backfill/:database", (req, res) => {
	entryService.backfill(req.params.database).then(() => {
		res.sendStatus(200);
	});
});

module.exports = {
	app,
	setDb,
};
