const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
}
function addHeaders(headers) {
	let todayDate = new Date();
	let promise = new Promise((resolve, reject) => {
		headers.forEach((header) => {
			if (header._id) {
				delete header._id;
			}
			header.dateCreated = todayDate;
		});
		dbConn
			.collection("HeaderCollection")
			.insertMany(headers, (err, results) => {
				if (err) {
					console.log("MiscellaneousService - addHeaders", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results.ops });
				}
			});
	});
	return promise;
}
function getNavigationOptions() {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("NavigationOptionCollection")
			.find({})
			.sort({ order: 1 })
			.toArray((err, options) => {
				if (err) {
					console.log(
						"MiscellaneousService - getNavigationOptions",
						err
					);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: options });
				}
			});
	});
	return promise;
}
function getDropdownByName(name) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("DropdownCollection")
			.find({ dropdown: name })
			.sort({ optionText: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log(
						"MiscellaneousService - getDropdownByName",
						err
					);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function getDropdowns() {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("DropdownCollection")
			.find({})
			.toArray((err, results) => {
				if (err) {
					console.log("DropdownService - getDropdowns", err);
					reject({ code: 500, message: err });
				} else {
					let dropdownToSelections = {};
					results.forEach((dropdown) => {
						if (!dropdownToSelections[dropdown.dropdown]) {
							dropdownToSelections[dropdown.dropdown] = [];
						}
						dropdownToSelections[dropdown.dropdown].push(dropdown);
					});
					resolve({ code: 200, data: dropdownToSelections });
				}
			});
	});
	return promise;
}
function getHeadersByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("HeaderCollection")
			.find({ database: database }, { order: 0 })
			.sort({ order: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log(
						"DropdownService - getSelectedHeadersByDatabase",
						err
					);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function removeHeadersByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("HeaderCollection")
			.deleteMany({ database: database })
			.then(() => {
				resolve({ code: 200 });
			})
			.catch((err) => {
				reject({ code: 500, message: err });
			});
	});
	return promise;
}
function getDatabaseToHeaders() {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("HeaderCollection")
			.find({})
			.sort({ database: 1, order: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log(
						"MiscellaneousService - getDatabaseToHeaders",
						err
					);
					reject({ code: 500, message: err });
				} else {
					let databaseToHeaders = {};
					results.forEach((header) => {
						if (!databaseToHeaders[header.database]) {
							databaseToHeaders[header.database] = [];
						}
						databaseToHeaders[header.database].push(header);
					});
					resolve({ code: 200, data: databaseToHeaders });
				}
			});
	});
	return promise;
}
function getDemoRequests() {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("DemoRequestCollection")
			.find({ isActive: true })
			.sort({ dateCreated: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log("Miscellaneous Service - getDemoRequests", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function deleteDemoRequestById(id) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("DemoRequestCollection")
			.findOneAndUpdate(
				{ _id: new ObjectId(id) },
				{ $set: { isActive: false } }
			)
			.then(() => {
				resolve({ code: 200 });
			})
			.catch((err) => {
				console.log(
					"Miscellaneous Service - DeleteDemoRequestById",
					err
				);
				reject({ code: 500, message: err });
			});
	});
	return promise;
}
module.exports = {
	setDb,
	addHeaders,
	getDatabaseToHeaders,
	getDropdownByName,
	getNavigationOptions,
	getDropdowns,
	getHeadersByDatabase,
	removeHeadersByDatabase,
	getDemoRequests,
	deleteDemoRequestById,
};
