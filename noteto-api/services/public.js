const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
const fieldService = require("./field.js");
let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
	fieldService.setDb(conn);
}
function getEntriesByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({ "_data.database": database })
			.toArray((err, results) => {
				if (err) {
					console.log("EntryService - getEntriesByDatabase", err);
					reject({ code: 500, message: err });
				} else {
					let entries = [];
					fieldService
						.getFieldsByDatabase(database)
						.then((response) => {
							for (let i = 0; i < results.length; i++) {
								let fields = response.data;
								let entry = {};
								for (let j = 0; j < fields.length; j++) {
									let field = fields[j];
									let fldVal = results[i][field.value];
									entry[field.value] = helper.getEntryText(
										field,
										fldVal
									);
								}
								entry._data = helper.getDataText(
									results[i]._data
								);
								entries.push(entry);
							}
							resolve({ code: 200, data: entries });
						});
				}
			});
	});
	return promise;
}

function addDemoRequest(demoRequest) {
	let todayDate = new Date();
	demoRequest["dateCreated"] = todayDate;
	demoRequest["isActive"] = true;
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("DemoRequestCollection")
			.insertOne(demoRequest, (err, result) => {
				if (err) {
					console.log("PublicService - addDemoRequest", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200 });
				}
			});
	});
	return promise;
}
module.exports = {
	setDb,
	getEntriesByDatabase,
	getReceiptById,
	getCustomerDashboard,
	addDemoRequest,
};
