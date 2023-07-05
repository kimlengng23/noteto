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
	let entry = req.body;
	entry.owner = {
		_id: req.decoded.userId,
		first: req.decoded.first,
		last: req.decoded.last,
		username: req.decoded.username,
	};
	entryService
		.addEntry(entry)
		.then((response) => {
			res.status(response.code).send(response.data);
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
	let entry = req.body;
	entryService
		.updateEntry(entry)
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
// app.get("/remove/:database", (req, res) => {
//   let database = req.params.database;
//   entryService
//     .removeLayoutByDatabase(database)
//     .then((response) => {
//       res.sendStatus(response.code);
//     })
//     .catch((response) => {
//       res.status(response.code).send(response.message);
//     });
// });
module.exports = {
	app,
	setDb,
};
