const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
const historyService = require("./history.js");
let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
}
function getNextId(database) {
	return dbConn
		.collection("SequenceCollection")
		.findOneAndUpdate({ database: database }, { $inc: { seqValue: 1 } });
}
function addEntry2(orignal, newEntry) {
	let promise = new Promise((resolve, reject) => {
		historyService.compareForHistory(orignal, newEntry).then((response) => {
			let history = response.data;
			addEntry1(newEntry).then((response) => {
				let addEntryResponsse = response;
				history.createdBy = newEntry._data.createdBy;
				history.entryId = response.data._id.toString();
				historyService.addHistory(history).then(() => {
					resolve(addEntryResponsse);
				});
			});
		});
	});
	return promise;
}
function addEntry1(entry) {
	let promise = new Promise((resolve, reject) => {
		getNextId(entry._data.database).then((document) => {
			entry._data.id = document.value.seqValue;
			dbConn
				.collection("EntryCollection")
				.insertOne(entry, (err, result) => {
					if (err) {
						console.log("EntryService - addEntry", err);
						reject({ code: 500, message: err });
					} else {
						resolve({ code: 200, data: result.ops[0] });
					}
				});
		});
	});
	return promise;
}
function getAssignedEntriesByUserId(userId) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({ "assignedTo._id": userId })
			.sort({
				"_data.id": -1,
				"_data.dateCreated": -1,
				"_data.database": 1,
			})
			.toArray((err, results) => {
				if (err) {
					console.log(
						"EntryService - getAssignedEntriesByUserId",
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
function getDashboardData() {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({
				"_data.database": {
					$in: ["jaekJayCargo", "jaekJayCustomOrder"],
				},
				"_data.isActive": true,
				"_data.id":{$gte:284}
			})
			.sort({ "_data.id": -1 })
			.toArray((err, results) => {
				if (err) {
					console.log("EntryService - getEntriesByDatabase", err);
					reject({ code: 500, message: err });
				} else {
					let rows = [];

					for (let i = 0; i < results.length; i++) {
						let row = {};
						if (results[i]._data.database == "jaekJayCargo") {
							row.idx = i + 1;
							row._id = results[i]._id;
							row.type = "Shipment";
							row.tracking = results[i]["mtlTracking#"]
								? results[i]["mtlTracking#"]
								: "N/A";
							row.dateCreated =
								results[i]["_data"]["dateCreated"];
							row.paymentStatus = results[i][
								"customerPaymentStatus"
							]
								? results[i]["customerPaymentStatus"][
										"displayName"
								  ]
								: "N/A";
							row.amount = 0
							row.profit = 0
							row.amount = results[i]['mtlBillAmount'];
							if (results[i]["chargeList"]) {
								let sum = 0;
								let list = results[i]["chargeList"];
								for (let j = 0; j < list.length; j++) {
									sum +=
										list[j]["quantity"] *
										list[j]["unitPrice"];
								}
								if(isNaN(sum))
									continue;
								row.profit = sum - row.amount;
							}
						} else {
							row.idx = i + 1;
							row._id = results[i]._id;
							row.type = results[i]["invoiceType"]
								? results[i]["invoiceType"]["displayName"]
								: "N/A";
							row.tracking = results[i]["mtlTracking"]
								? results[i]["mtlTracking"]
								: "N/A";
							row.dateCreated =
								results[i]["_data"]["dateCreated"];
							row.paymentStatus = results[i]["paymentStatus"]
								? results[i]["paymentStatus"]["displayName"]
								: "N/A";
							row.amount = 0
							row.profit = 0
							if(results[i]['mtlPaymentAmount']){
								row.amount = results[i]['mtlPaymentAmount'];
							}
							if(results[i]["itemList"]) {
								let sum = 0;
								let list = results[i]["itemList"];
								for (let j = 0; j < list.length; j++) {
									let sub =
										list[j]["itemQty"] *
										list[j]["itemUnitPrice"];
									
									let tax = list[j]["itemTax"]
										? (list[j]["itemTax"] * sub) / 100
										: 0;
									sum += sub + tax;
								}
								if(isNaN(sum))
									continue;
								if(results[i]["collectingFee"]) {
									sum = ((results[i]["collectingFee"] + 100) * sum) /100
								}
								row.profit = sum - row.amount
							}
							
						}
						rows.push(row);
					}
					resolve({ code: 200, data: rows });
				}
			});
	});
	return promise;
}
function getEmptyEntryByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("FieldCollection")
			.find({ database: database })
			.toArray((err, fields) => {
				if (err) {
					console.log("EntryService - getEmptyEntryByDatabase", err);
					reject({ code: 500, message: err });
				}
				let emptyEntry = {};
				fields.forEach((field) => {
					if (field.type == "list") {
						emptyEntry[field.value] = [];
					} else if (
						field.type == "weightInKg" ||
						field.type == "weightInLb" ||
						field.type == "currencyInDollar"
					) {
						emptyEntry[field.value] = null;
					} else if (
						field.type == "singleLine" ||
						field.type == "multipleLines"
					) {
						emptyEntry[field.value] = "";
					} else if (field.type == "number") {
						emptyEntry[field.value] = null;
					} else if (field.type == "date") {
						//1/1/2000
						emptyEntry[field.value] = null;
					} else {
						emptyEntry[field.value] = null;
					}
				});
				resolve({ code: 200, data: emptyEntry });
			});
	});
	return promise;
}
function getEntryById(id) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.findOne(
				{ _id: new ObjectId(id), "_data.isActive": true },
				(err, result) => {
					if (err) {
						console.log("EntryService - getEntryById", err);
						reject({ code: 500, message: err });
					} else {
						getEmptyEntryByDatabase(result._data.database).then(
							(response) => {
								let emptyEntry = response.data;
								let fields = Object.keys(emptyEntry);
								emptyEntry["_id"] = result["_id"];
								emptyEntry["_data"] = result["_data"];
								for (let i = 0; i < fields.length; i++) {
									let field = fields[i];
									if (result[field]) {
										emptyEntry[field] = result[field];
									}
								}
								resolve({ code: 200, data: emptyEntry });
							}
						);
					}
				}
			);
	});
	return promise;
}
function getEntriesByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({ "_data.database": database, "_data.isActive": true })
			.sort({ "_data.id": -1, "_data.dateCreated": -1 })
			.toArray((err, results) => {
				if (err) {
					console.log("EntryService - getAllEntriesByDatabase", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function getReportList(filter) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find(filter)
			.sort({ "_data.id": -1, "_data.dateCreated": -1 })
			.toArray((err, results) => {
				if (err) {
					console.log("EntryService - getAllEntriesByDatabase", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function updateEntry2(oldEntry, newEntry, createdBy) {
	let promise = new Promise((resolve, reject) => {
		historyService
			.compareForHistory(oldEntry, newEntry)
			.then((response) => {
				let history = response.data;
				history.createdBy = createdBy;
				let pm1 = historyService.addHistory(history);
				let pm2 = updateEntry1(newEntry);
				Promise.all([pm1, pm2]).then((values) => {
					resolve(values[0]);
				});
			});
	});
	return promise;
}
function updateEntry1(entry) {
	let promise = new Promise((resolve, reject) => {
		let id = entry._id;
		let todayDate = new Date();
		entry._data.dateLastModified = todayDate;
		delete entry._id;
		dbConn
			.collection("EntryCollection")
			.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: entry })
			.then(() => {
				resolve({ code: 200 });
			})
			.catch((err) => {
				console.log("EntryService - UpdateEntry", err);
				reject({ code: 500, message: err });
			});
	});
	return promise;
}
function deleteEntryById(id) {
	console.log(id)
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.findOneAndUpdate(
				{ _id: new ObjectId(id) },
				{ $set: { "_data.isActive": false } }
			)
			.then(() => {
				resolve({ code: 200 });
			})
			.catch((err) => {
				console.log("EntryService - DeleteEntryById", err);
				reject({ code: 500, message: err });
			});
	});
	return promise;
}

module.exports = {
	setDb,
	addEntry1,
	addEntry2,
	deleteEntryById,
	getAssignedEntriesByUserId,
	getDashboardData,
	getEntryById,
	getEmptyEntryByDatabase,
	getEntriesByDatabase,
	getReportList,
	updateEntry1,
	updateEntry2,
};
