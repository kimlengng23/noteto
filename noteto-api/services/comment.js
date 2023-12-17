const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");

let dbConn = null;
function setDb(conn) {
	dbConn = conn;
	helper.setDb(conn);
}
function addComment(comment) {
	let todayDate = new Date();
	comment["dateCreated"] = todayDate;
	comment["dateModified"] = todayDate;
	comment["isActive"] = true;
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("CommentCollection")
			.insertOne(comment, (err, result) => {
				if (err) {
					console.log("CommentService - addComment", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: result.ops[0] });
				}
			});
	});
	return promise;
}
function getCommentsByEntryId(entryId) {
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("CommentCollection")
			.find({ entryId: entryId })
			.sort({ dateCreated: 1 })
			.toArray((err, results) => {
				if (err) {
					console.log("CommentService - getCommentsByEntry", err);
					reject({ code: 500, message: err });
				} else {
					resolve({ code: 200, data: results });
				}
			});
	});
	return promise;
}
function updateComment(comment) {
	let todayDate = new Date();
	let commentId = comment._id;
	comment["dateModified"] = todayDate;
	delete comment["_id"];
	let promise = new Promise((resolve, reject) => {
		dbConn
			.collection("CommentCollection")
			.updateOne({ _id: ObjectId(commentId) }, { $set: comment })
			.then(() => {
				resolve({ code: 200 });
			})
			.catch((err) => {
				console.log("CommentService - updateComment", err);
				reject({ code: 500, message: err });
			});
	});
	return promise;
}
module.exports = {
	addComment,
	getCommentsByEntryId,
	updateComment,
	setDb,
};
