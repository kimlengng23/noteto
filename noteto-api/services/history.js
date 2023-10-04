const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
const fieldController = require("./field.js");
let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
}
function addHistory(history) {
	let today = new Date();
	history.dateCreated = today;
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("HistoryCollection")
			.insertOne(history, (err, result) => {
				if (err) {
					console.log("HistoryService - addHistory", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: result.ops[0] });
				}
			});
	});
	return promise;
}
function compareForHistory(oldEntry, newEntry) {
	let promise = new Promise((resolve, reject) => {
		fieldController
			.getFieldsByDatabase(oldEntry._data.database)
			.then((response) => {
				let fields = response.data;
				let history = {};
				let changes = {};
				for (let i = 0; i < fields.length; i++) {
					let fld = fields[i];
					let isDiff = helper.isDiff(
						fld,
						oldEntry[fld.value],
						newEntry[fld.value]
					);
					if (isDiff) {
						changes[fld.value] = {
							from: oldEntry[fld.value],
							to: newEntry[fld.value],
						};
					}
				}
				history.entryId = oldEntry._id;
				history.changes = changes;
				resolve({ code: 200, data: history });
			})
			.catch((response) => {
				reject(response);
			});
	});
	return promise;
}
function getHistoryByEntryId(entryId) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("HistoryCollection")
			.find({ entryId: entryId })
			.sort({ _id: -1, dateCreated: -1 })
			.toArray((err, results) => {
				if (err) {
					console.log("HistoryService - getHistoryByEntryId");
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
module.exports = {
	setDb,
	addHistory,
	compareForHistory,
	getHistoryByEntryId,
};
