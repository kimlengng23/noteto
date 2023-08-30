const express = require("express");
const helper = require("../js/helper.js");
const backfillService = require("../services/backfill.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
	backfillService.setDb(conn);
}
app.use(express.json());
app.use(helper.verifyAdminToken);

app.get("/", (req, res) => {
	res.status(200).send("Up Running");
});
app.get("/run/:database", (req, res) => {
	backfillService
		.run(req.params.database)
		.then((response) => {
			console.log(response);
			res.sendStatus(response.code);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
module.exports = {
	setDb,
	app,
};
