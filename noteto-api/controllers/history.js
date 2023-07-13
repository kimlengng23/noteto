const express = require("express");
const helper = require("../js/helper.js");
const historyService = require("../services/history.js");
const app = express();

let dbConn = null;

function setDb(conn) {
	historyService.setDb(conn);
}
app.use(express.json());
app.use(helper.verifyToken);

app.post("/add/", (req, res) => {
	let history = req.body;
	history.createdBy = {
		_id: req.decoded.userId,
		first: req.decoded.first,
		last: req.decoded.last,
		username: req.decoded.username,
	};
	historyService
		.addHistory(history)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/by/entry/id/:entryId", (req, res) => {
	historyService
		.getHistoryByEntryId(req.params.entryId)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
module.exports = {
	app,
	setDb,
};
