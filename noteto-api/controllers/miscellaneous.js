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
app.get("/get/demo/requests", helper.verifyAdminToken, (req, res) => {
	miscellService
		.getDemoRequests()
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get(
	"/delete/demo/request/by/id/:id",
	helper.verifyAdminToken,
	(req, res) => {
		console.log(req.params);
		miscellService
			.deleteDemoRequestById(req.params.id)
			.then((response) => {
				console.log(response);
				res.sendStatus(response.code);
			})
			.catch((response) => {
				console.log(response);
				res.status(response.code).send(response.message);
			});
	}
);
module.exports = {
	app,
	setDb,
};
