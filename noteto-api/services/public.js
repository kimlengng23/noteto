const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
const fieldService = require("./field.js");
let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
	fieldService.setDb(conn);
}
function getReceiptById(id) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.findOne({ _id: new ObjectId(id) }, (err, result) => {
				if (err) {
					console.log("EntryService - getEntryById", err);
					reject({ code: 500, message: err });
				} else {
					fieldService
						.getFieldsByDatabase(result.database)
						.then((response) => {
							let fields = response.data;
							let entry = {};
							for (let i = 0; i < fields.length; i++) {
								let field = fields[i];
								let fldVal = result[field.value];
								entry[field.value] = helper.getEntryText(
									field,
									fldVal
								);
							}
							resolve({ code: 200, data: entry });
						});
				}
			});
	});
	return promise;
}
function getEntriesByDatabase(database) {
	console.log(database);
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({ database: database })
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
								for (let i = 0; i < fields.length; i++) {
									let field = fields[i];
									console.log(results[i]);
									let fldVal = results[i][field.value];
									entry[field.value] = helper.getEntryText(
										field,
										fldVal
									);
								}
								entries.push(entry);
							}
							resolve({ code: 200, data: entries });
						});
				}
			});
	});
	return promise;
}
module.exports = {
	setDb,
	getEntriesByDatabase,
	getReceiptById,
};
