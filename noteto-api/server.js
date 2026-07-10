const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
require("dotenv").config({ path: envFile });
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");
const app = express();
const database = require("./database.js");
const systemController = require("./controllers/system.js");
const automationController = require("./controllers/automation.js");
const backfillController = require("./controllers/backfill.js");
const commentController = require("./controllers/comment.js");
const historyController = require("./controllers/history.js");
const databaseController = require("./controllers/database.js");
const userController = require("./controllers/user.js");
const miscellaneousController = require("./controllers/miscellaneous.js");
const groupController = require("./controllers/group.js");
const fieldController = require("./controllers/field.js");
const choiceController = require("./controllers/choice.js");
const layoutController = require("./controllers/layout.js");
const entryController = require("./controllers/entry.js");
const publicController = require("./controllers/public.js");
const headerSetController = require("./controllers/header-set.js");
const filterSetController = require("./controllers/filter-set.js");
app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "..", "dist")));
app.use("/asset", express.static(path.join(__dirname, "assets")));
app.get("/get/version", (req, res) => {
	res.status(200).send("version 1.0");
});
app.get("/health", (req, res) => {
	res.status(200).send({ status: "ok", database: database.getStatus() });
});
app.use("/api/system", systemController.app);
app.use("/public", publicController.app);
app.use("/api/automation/", automationController.app);
app.use("/api/backfill/", backfillController.app);
app.use("/api/comment/", commentController.app);
app.use("/api/history/", historyController.app);
app.use("/api/user/", userController.app);
app.use("/api/miscellaneous/", miscellaneousController.app);
app.use("/api/database/", databaseController.app);
app.use("/database/", databaseController.app);
app.use("/api/group/", groupController.app);
app.use("/api/field/", fieldController.app);
app.use("/api/choice/", choiceController.app);
app.use("/api/layout/", layoutController.app);
app.use("/api/entry/", entryController.app);
app.use("/api/header/set/", headerSetController.app);
app.use("/api/filter/set/", filterSetController.app);

function setDbForControllers(dbConn) {
	automationController.setDb(dbConn);
	backfillController.setDb(dbConn);
	commentController.setDb(dbConn);
	historyController.setDb(dbConn);
	publicController.setDb(dbConn);
	userController.setDb(dbConn);
	miscellaneousController.setDb(dbConn);
	databaseController.setDb(dbConn);
	groupController.setDb(dbConn);
	fieldController.setDb(dbConn);
	choiceController.setDb(dbConn);
	layoutController.setDb(dbConn);
	entryController.setDb(dbConn);
	headerSetController.setDb(dbConn);
	filterSetController.setDb(dbConn);
}

function connectDatabase() {
	return database
		.createDbConn()
		.then((dbConn) => {
			setDbForControllers(dbConn);
			return dbConn;
		})
		.catch((error) => {
			console.log(
				"MongoDB is not connected yet. Open the app and use the setup dialog, or set CONN_STR and DB_NAME.",
				error.message || error
			);
		});
}

function startServer() {
	const securedPort = Number(process.env.SECURED_PORT || process.env.PORT || 3000);
	const useHttps = String(process.env.USE_HTTPS || "").toLowerCase() === "true";
	const keyPath = path.join(__dirname, "certs", "server.key");
	const certPath = path.join(__dirname, "certs", "server.crt");

	if (useHttps && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
		const key = fs.readFileSync(keyPath);
		const cert = fs.readFileSync(certPath);
		https.createServer({ key: key, cert: cert }, app).listen(securedPort, () => {
			console.log("Noteto API is listening with HTTPS on port ", securedPort);
		});
		return;
	}

	http.createServer(app).listen(securedPort, () => {
		console.log("Noteto API is listening with HTTP on port ", securedPort);
	});
}

systemController.setReconnectDatabase(connectDatabase);
connectDatabase();
startServer();
