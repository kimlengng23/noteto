const express = require("express");
const cors = require("cors");
const helper = require("../js/helper.js");
const app = express();
const path = require("path");
const publicService = require("../services/public.js");
const mailService = require("../services/mail.js");
const userService = require("../services/user.js");
const projectPath = process.cwd();
let dbConn = null;

function setDb(conn) {
	publicService.setDb(conn);
	userService.setDb(conn);
}
app.use(cors());
app.use(express.json());
app.get("/receipt", (req, res) => {
	res.sendFile(
		path.join(
			projectPath + `/custom/receipts/${req.query.database}-receipt.html`
		)
	);
});
app.get("/api/get/entry/:id", (req, res) => {
	publicService.getReceiptById(req.params.id).then((response) => {
		res.status(response.code).send(response.data);
	});
});
app.get("/api/get/entries/by/database/:database", (req, res) => {
	publicService.getEntriesByDatabase(req.params.database).then((response) => {
		res.status(response.code).send(response.data);
	});
});
app.get("/dashboard", (req, res) => {
	res.sendFile(
		path.join(
			__dirname + `/dashboards/${req.query.database}-dashboard.html`
		)
	);
});
app.get("/assets/:name", (req, res) => {
	let options = {
		root: path.join(__dirname, "receipts/assets"),
		dotfiles: "deny",
		headers: {
			"x-timestamp": Date.now(),
			"x-sent": true,
		},
	};
	let pictureName = req.params.name;
	res.sendFile(pictureName, options, function (err) {
		if (err) {
			res.sendStatus(500);
			return console.log("Unable to send file");
		}
	});
});
app.get(
	"/api/verify/by/session/:sessionId",
	helper.verifyEmailToken,
	(req, res) => {
		userService
			.markVerifiedByEmail(req.decoded.email)
			.then((response) => {
				res.sendStatus(response.code);
			})
			.catch((response) => {
				res.status(response.code).send(response.message);
			});
	}
);
app.get("/api/get/customer/dashboard", helper.verifyToken, (req, res) => {
	let customer = {
		_id: req.decoded.userId,
	};
	publicService
		.getCustomerDashboard(customer)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/send/email", (req, res) => {
	mailService
		.sendAccountVerifyEmail({
			first: "Tee",
			last: "Nguov",
			email: "kimlengng23@gmail.com",
		})
		.then((response) => {
			res.sendStatus(response.code);
		});
});
module.exports = {
	app,
	setDb,
};
