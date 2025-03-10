
const { ObjectId } = require("mongodb");

const entryService = require("./entry.js");
let dbConn;
function setDb(conn) {
	dbConn = conn;
}
function getEntriesByDatabase(database) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("EntryCollection")
			.find({ "_data.database":database })
			.sort({ "_id":1 })
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
		getEntriesByDatabase("jaekJayCargo").then((response) => {
			let mainEntries = response.data;
			let mainDict = {}
			const regex = /\d{4}/;
			
			for(let i=0;i<mainEntries.length;i++) {
				let e = mainEntries[i]
				if(e['mtlTracking#']) {
					let tracking = e['mtlTracking#'].match(regex);
					if(tracking)
						mainDict[tracking] = e
				}
					
			}
			//console.log(Object.keys(mainDict))
			let promises = [];
			getEntriesByDatabase("jaekJayCustomOrder").then((response) => {
				let subEntries = response.data;
				let preDate = null;
				for(let i=0;i<subEntries.length;i++) {
					let e = subEntries[i]
					if(e['mtlTracking']) {
						let tracking = e['mtlTracking'].match(regex)
						if(mainDict[tracking]) {
							let promise = new Promise((resolve,reject)=> {
								let dateShipped = mainDict[tracking]['dateShipped']
								if(dateShipped != null)
									preDate = dateShipped;
								else 
									dateShipped = preDate;
								dbConn.collection("EntryCollection").updateOne(
									{ _id: ObjectId(e._id) },
									{
										$set: {
											"_data.dateCreated":dateShipped
										},
										
									},
									{upsert:true}
								);
								resolve();
							})
							promises.push(promise)
						}
						else {
							let promise = new Promise((resolve,reject)=> {
								dbConn.collection("EntryCollection").updateOne(
									{ _id: ObjectId(e._id) },
									{
										$set: {
											"_data.dateCreated":preDate
										},
										
									},
									{upsert:true}
								);
								resolve();
							})
							promises.push(promise)
						}
					}else {
						let promise = new Promise((resolve,reject)=> {
							dbConn.collection("EntryCollection").updateOne(
								{ _id: ObjectId(e._id) },
								{
									$set: {
										"_data.dateCreated":preDate
									},
									
								},
								{upsert:true}
							);
							resolve();
						})
						promises.push(promise)
					}
				}
				Promise.all(promises)
				.then(() => {
					
					resolve({ code: 200 });
				})
				.catch((err) => {
					console.log("BackfillService - run", err);
					reject({ code: 500, message: err });
				});
			})
		});
	});
	return promise;
}
module.exports = {
	setDb,
	run,
};
