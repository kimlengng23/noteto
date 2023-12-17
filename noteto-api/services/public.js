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
						.getFieldsByDatabase(result._data.database)
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
							entry._data = helper.getDataText(result._data);
							resolve({ code: 200, data: entry });
						});
				}
			});
	});
	return promise;
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
function getCustomerDashboard(customer) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({
				"_data.database": {
					$in: ["jaekJayCargo", "jaekJayCustomOrder"],
				},
				"customer._id": customer._id,
			})
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
							row.tracking = results[i]["mtlTracking#"];
							row.dateCreated =
								results[i]["_data"]["dateCreated"];
							row.paymentStatus =
								results[i]["customerPaymentStatus"][
									"displayName"
								];
							row.amount = 0;
							if (results[i]["chargeList"]) {
								let sum = 0;
								let list = results[i]["chargeList"];
								for (let j = 0; j < list.length; j++) {
									sum +=
										list[j]["quantity"] *
										list[j]["unitPrice"];
								}
								row.amount = sum;
							}
						} else {
							row.idx = i + 1;
							row._id = results[i]._id;
							row.type = results[i]["invoiceType"]["displayName"];
							row.tracking = results[i]["mtlTracking"];
							row.dateCreated =
								results[i]["_data"]["dateCreated"];
							row.paymentStatus =
								results[i]["paymentStatus"]["displayName"];
							row.amount = 0;
							if (results[i]["itemList"]) {
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
								row.amount = sum;
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
module.exports = {
	setDb,
	getEntriesByDatabase,
	getReceiptById,
	getCustomerDashboard,
};
