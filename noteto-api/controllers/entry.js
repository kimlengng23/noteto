const express = require("express");
const converter = require('json-2-csv')
const helper = require("../js/helper.js");
const entryService = require("../services/entry.js");
const app = express();

let dbConn = null;

function setDb(conn) {
	entryService.setDb(conn);
}

app.use(express.json());
app.post("/add", helper.verifyToken, (req, res) => {
	let wrappedEntry = req.body;
	let todayDate = new Date();
	let createdBy = {
		_id: req.decoded.userId,
		first: req.decoded.first,
		last: req.decoded.last,
		username: req.decoded.username,
	};
	let data = {
		database: wrappedEntry.database,
		createdBy: createdBy,
		dateCreated: todayDate,
		dateLastModified: todayDate,
		isActive: true,
	};
	wrappedEntry.oldEntry._data = data;
	wrappedEntry.newEntry._data = data;
	entryService
		.addEntry2(wrappedEntry.oldEntry, wrappedEntry.newEntry)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/delete/by/id/:id", helper.verifyToken, (req, res) => {
	console.log('askldfj;asldfjlk')
	entryService
		.deleteEntryById(req.params.id)
		.then((response) => {
			res.sendStatus(response.code);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/assigned", helper.verifyToken, (req, res) => {
	entryService
		.getAssignedEntriesByUserId(req.decoded.userId)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get("/get/dashboard/data",helper.verifyToken,(req,res) => {
	entryService.getDashboardData().then((response) => {
		res.status(response.code).send(response.data);
	})
	.catch((response) => {
		res.status(response.code).send(response.message);
	})
})
app.get("/get/by/database/:database", helper.verifyToken, (req, res) => {
	entryService
		.getEntriesByDatabase(req.params.database)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.get(
	"/get/by/id/:id",
	[helper.verifyToken, helper.verifyAccess],
	(req, res) => {
		entryService
			.getEntryById(req.params.id)
			.then((response) => {
				res.status(response.code).send(response.data);
			})
			.catch((response) => {
				res.status(response.code).send(response.message);
			});
	}
);
app.get("/get/empty/:database", helper.verifyToken, (req, res) => {
	let database = req.params.database;
	entryService
		.getEmptyEntryByDatabase(database)
		.then((response) => {
			res.status(response.code).send(response.data);
		})
		.catch((response) => {
			res.status(response.code).send(response.message);
		});
});
app.post(
	"/update/:id",
	[helper.verifyToken, helper.verifyAccess],
	(req, res) => {
		let wrappedEntry = req.body;
		let createdBy = {
			_id: req.decoded.userId,
			first: req.decoded.first,
			last: req.decoded.last,
			username: req.decoded.username,
		};
		entryService
			.updateEntry2(
				wrappedEntry.oldEntry,
				wrappedEntry.newEntry,
				createdBy
			)
			.then((response) => {
				res.status(response.code).send(response.data);
			})
			.catch((response) => {
				res.status(response.code).send(response.message);
			});
	}
);
app.get("/backfill/:database", helper.verifyToken, (req, res) => {
	entryService.backfill(req.params.database).then(() => {
		res.sendStatus(200);
	});
});
app.get("/get/cvs/report/:database", (req, res) => {
	let database = req.params.database;
	let filter = {};
	if (database == "jaekJayCargo") {
		filter = {
			"_data.database": database,
			"_data.isActive": true,
			dateShipped: { $gt: "2024-01-01" },
		};
	} else if (database == "jaekJayCustomOrder") {
		filter = {
			"_data.database": database,
			"_data.isActive": true,
			"_data.id": { $gte: 284 },
		};
	}
	entryService.getReportList(filter).then((response) => {
		let results = response.data;
		let rows = []
		for(let i=0;i<results.length;i++) {
			let row = {}
			if (results[i]._data.database == "jaekJayCargo") {
				let year = new Date(results[i]["_data"]["dateCreated"]).getFullYear();
				if(year != 2024) continue;
				row.idx = i + 1;
				row._id = results[i]._id.toString();
				row.type = "Shipment";
				row.tracking = results[i]["mtlTracking#"]
					? results[i]["mtlTracking#"]
					: "N/A";
				row.dateCreated = year
				row.amount = 0;	
				row.paymentStatus = results[i][
					"customerPaymentStatus"
				]
					? results[i]["customerPaymentStatus"][
							"displayName"
						]
					: "N/A";
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
					row.amount = sum ;
				}
			} else if(results[i]._data.database == "jaekJayCustomOrder") {
				let year = new Date(results[i]["_data"]["dateCreated"]).getFullYear();
				if(year != 2024) continue;
				row.idx = i + 1;
				row._id = results[i]._id.toString();
				row.type = results[i]["invoiceType"]
					? results[i]["invoiceType"]["displayName"]
					: "N/A";
				row.tracking = results[i]["mtlTracking"]
					? results[i]["mtlTracking"]
					: "N/A";
				row.dateCreated =year;
				row.paymentStatus = results[i]["paymentStatus"]
					? results[i]["paymentStatus"]["displayName"]
					: "N/A";
				row.amount = 0;
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
					row.amount = sum;
				}
				
			}
			rows.push(row);
		}
		let options = {
			delimiter:{field:';'},
			keys:['idx',"_id","type","tracking","dateCreated","paymentStatus","amount"]
		}
		//res.status(response.code).send(rows)
		res.status(response.code).send(converter.json2csv(rows,options));
	});
	
});

module.exports = {
	app,
	setDb,
};
