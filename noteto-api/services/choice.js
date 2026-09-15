const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
}

function hasText(value) {
	return Boolean(value && String(value).trim());
}

function normalizeText(value) {
	return String(value || "").trim().toLowerCase();
}

function normalizeColor(color) {
	if (!color) return "#e0e0e0";
	if (typeof color == "string") {
		const value = color.trim();
		return value || "#e0e0e0";
	}
	if (typeof color == "object") {
		return (
			color.hexa ||
			color.hex ||
			color.value ||
			"#e0e0e0"
		);
	}
	return "#e0e0e0";
}

function validateChoices(choices) {
	if (!Array.isArray(choices) || choices.length == 0) {
		return "At least one choice is required";
	}
	const seen = new Set();
	for (let i = 0; i < choices.length; i++) {
		const choice = choices[i];
		if (
			!hasText(choice.database) ||
			!hasText(choice.field) ||
			!hasText(choice.displayName) ||
			!hasText(choice.value)
		) {
			return "Choice names cannot be empty";
		}
		choice.database = choice.database.trim();
		choice.field = choice.field.trim();
		choice.displayName = choice.displayName.trim();
		choice.value = choice.value.trim();
		choice.color = normalizeColor(choice.color);

		const valueKey = `${choice.database}:${choice.field}:value:${normalizeText(
			choice.value
		)}`;
		const displayKey = `${choice.database}:${choice.field}:display:${normalizeText(
			choice.displayName
		)}`;
		if (seen.has(valueKey) || seen.has(displayKey)) {
			return "Choice names must be unique";
		}
		seen.add(valueKey);
		seen.add(displayKey);
	}
	return null;
}

function checkDuplicateChoices(choices) {
	const fieldGroups = {};
	choices.forEach((choice) => {
		const key = `${choice.database}:${choice.field}`;
		if (!fieldGroups[key]) {
			fieldGroups[key] = {
				database: choice.database,
				field: choice.field,
				choices: [],
			};
		}
		fieldGroups[key].choices.push(choice);
	});

	const checks = Object.values(fieldGroups).map((group) => {
		return dbConn
			.collection("ChoiceCollection")
			.find({ database: group.database, field: group.field })
			.toArray()
			.then((existingChoices) => {
				return group.choices.some((choice) => {
					return existingChoices.some((existingChoice) => {
						return (
							normalizeText(existingChoice.value) ==
								normalizeText(choice.value) ||
							normalizeText(existingChoice.displayName) ==
								normalizeText(choice.displayName)
						);
					});
				});
			});
	});

	return Promise.all(checks).then((results) => {
		return results.some((hasDuplicate) => hasDuplicate);
	});
}

function addChoices(choices) {
	let promise = new Promise((resolve, reject) => {
		const validationMessage = validateChoices(choices);
		if (validationMessage) {
			reject({ code: 400, message: validationMessage });
			return;
		}
		checkDuplicateChoices(choices)
			.then((hasDuplicate) => {
				if (hasDuplicate) {
					reject({ code: 400, message: "Choice names must be unique" });
					return;
				}
				dbConn
					.collection("ChoiceCollection")
					.insertMany(choices, (err, result) => {
						if (err) {
							console.log("ChoiceService - addChoices", err);
							reject({ code: 500, message: err });
						} else {
							resolve({ code: 200, data: result.ops });
						}
					});
			})
			.catch((err) => {
				console.log("ChoiceService - addChoices", err);
				reject({ code: 500, message: err });
			});
	});
	return promise;
}
function getChoicesByDatabase(databaseValue) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("ChoiceCollection")
			.find({ database: databaseValue })
			.sort({ value: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log("ChoiceService - getChoicesByDatabase", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function getChoicesByFieldAndDatabase(fieldValue, databaseValue) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("ChoiceCollection")
			.find({ field: fieldValue, database: databaseValue })
			.sort({ value: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log(
						"ChoiceService - getChoicesByFieldAndDatabase",
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
function getDatabaseToChoices() {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("ChoiceCollection")
			.find({})
			.sort({ field: 1, value: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log("ChoiceService - getAllChoicesByDatabase", err);
					reject({ code: 500, message: err });
				} else {
					let databaseToChoices = {};
					for (let i = 0; i < results.length; i++) {
						let choice = results[i];
						if (!databaseToChoices[choice.database])
							databaseToChoices[choice.database] = [];
						databaseToChoices[choice.database].push(choice);
					}
					resolve({ code: 200, data: databaseToChoices });
				}
			});
	});
	return promise;
}
function updateChoices(choices) {
	const validationMessage = validateChoices(choices);
	if (validationMessage) {
		return Promise.reject({ code: 400, message: validationMessage });
	}
	let promises = [];
	let fieldValue = "";
	let databaseValue = "";
	choices.forEach((choice) => {
		let promise = new Promise((resolve, reject) => {
			let query = {
				field: choice.field,
				database: choice.database,
				_id: ObjectId(choice._id),
			};
			if (choice._id) {
				delete choice._id;
			}
			if (!fieldValue && !databaseValue) {
				fieldValue = choice.field;
				databaseValue = choice.database;
			}
			dbConn
				.collection("ChoiceCollection")
				.updateOne(query, { $set: choice }, { upsert: true })
				.then(() => {
					resolve({ code: 200 });
				})
				.catch((err) => {
					console.log("ChoiceService - updateChoice", err);
					reject({ code: 500, message: err });
				});
		});
		promises.push(promise);
	});
	let promise = new Promise((resolve, reject) => {
		Promise.all(promises)
			.then(() => {
				getChoicesByFieldAndDatabase(fieldValue, databaseValue).then(
					(response) => {
						resolve({ code: 200, data: response.data });
					}
				);
			})
			.catch((err) => {
				console.log("ChoiceService - updateChoice", err);
				reject({ code: 500, message: err });
			});
	});
	return promise;
}
module.exports = {
	setDb,
	addChoices,
	getChoicesByDatabase,
	getDatabaseToChoices,
	updateChoices,
};
