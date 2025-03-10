const express = require("express");
const helper = require("../js/helper.js");
const miscellService = require("../services/miscellaneous.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
	miscellService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
app.post("/add/headers", helper.verifyAdminToken, (req, res) => {
	console.log(req.body)
	let headers = req.body;
	if (headers.length == 0) {
		return res.sendStatus(200);
	}
	miscellService
		.addHeaders(headers)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/navigation/options", (req, res) => {
	miscellService
		.getNavigationOptions()
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/dropdowns", (req, res) => {
	
	miscellService
		.getDropdowns()
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/database/to/headers", (req, res) => {
	miscellService
		.getDatabaseToHeaders()
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/headers/database/:database", (req, res) => {
	let database = req.params.database;
	miscellService
		.getHeadersByDatabase(database)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get(
	"/remove/headers/database/:database",
	helper.verifyAdminToken,
	(req, res) => {
		let database = req.params.database;
		miscellService
			.removeHeadersByDatabase(database)
			.then((response) => {
				res.sendStatus(response.code);
			})
			.catch((response) => {
				res.status(response.code).send(response.message);
			});
	}
);
module.exports = {
	app,
	setDb,
};
