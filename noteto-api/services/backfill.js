const entryService = require("./entry.js");
let dbConn;
function setDb(conn) {
	dbConn = conn;
}
function getEntriesByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({ database: database })
			.sort({ id: -1, dateCreated: -1 })
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
function run(database) {
	let promise = new Promise((resolve, reject) => {
		getEntriesByDatabase(database).then((response) => {
			let entries = response.data;
			let promises = [];
			console.log(response);
			entries.forEach((e) => {
				try {
					let id = e.id;
					let database = e.database;
					let dateCreated = e.dateCreated;
					let dateLastModified = e.dateLastModified;
					let createdBy = e.owner;
					let data = {
						id,
						database,
						createdBy,
						dateCreated,
						dateLastModified,
						isActive: true,
					};
					let newEntry = {
						_id: e._id,
						_data: data,
					};

					promises.push(entryService.updateEntry1(newEntry));
				} catch (err) {
					console.log(err);
				}
			});
			Promise.all(promises)
				.then(() => {
					// entries.forEach((e) => {
					// 	dbConn.collection("EntryCollection").updateOne(
					// 		{ _id: e._id },
					// 		{
					// 			$unset: {
					// 				id: "",
					// 				database: "",
					// 				owner: "",
					// 				dateCreated: "",
					// 				dateLastModified: "",
					// 			},
					// 		}
					// 	);
					// });
					resolve({ code: 200 });
				})
				.catch((err) => {
					console.log("BackfillService - run", err);
					reject({ code: 500, message: err });
				});
		});
	});
	return promise;
}
module.exports = {
	setDb,
	run,
};
