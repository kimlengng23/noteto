const express = require("express");
const helper = require("../js/helper.js");
const commentService = require("../services/comment.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
	commentService.setDb(conn);
}
app.use(express.json());
app.use(helper.verifyToken);

app.post("/add/", (req, res) => {
	let comment = req.body;
	comment.createdBy = {
		_id: req.decoded.userId,
		first: req.decoded.first,
		last: req.decoded.last,
		username: req.decoded.username,
	};
	commentService
		.addComment(comment)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/by/entry/id/:entryId", (req, res) => {
	commentService
		.getCommentsByEntryId(req.params.entryId)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.post("/update", (req, res) => {
	let comment = req.body;
	commentService
		.updateComment(comment)
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
