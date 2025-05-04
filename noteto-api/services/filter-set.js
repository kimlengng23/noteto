const helper = require("../js/helper.js");
const { ObjectId } = require("mongodb");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
  helper.setDb(conn);
}
function addFilterSet(filterSet) {
  console.log(filterSet);
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FilterSetCollection")
      .insertOne(filterSet, (err, result) => {
        if (err) {
          console.log("FilterSetService - addFilterSet", err);
          reject({ code: 500, message: err });
        } else {
          resolve({ code: 200, data: result.ops[0] });
        }
      });
  });
  return promise;
}

function getFilterSetsByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FilterSetCollection")
      .find({ database: database })
      .toArray((err, results) => {
        if (err) {
          console.log(
            "FilterSetService - getSelectedFilterSetsByDatabase",
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
function removeFilterSetsByDatabase(database) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FilterSetCollection")
      .deleteMany({ database: database })
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        console.log("FilterSetService - getRemoveFilterSetsByDatabase");
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
function getDatabaseToFilterSets() {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FilterSetCollection")
      .find({})
      .toArray((err, results) => {
        if (err) {
          console.log("FilterSetService - getDatabaseToFilterSets", err);
          reject({ code: 500, message: err });
        } else {
          let databaseToFilterSets = {};
          results.forEach((filterSet) => {
            if (!databaseToFilterSets[filterSet.database]) {
              databaseToFilterSets[filterSet.database] = [];
            }
            databaseToFilterSets[filterSet.database].push(filterSet);
          });
          resolve({ code: 200, data: databaseToFilterSets });
        }
      });
  });
  return promise;
}
function setFavoriteFilterSet(favorite) {
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FilterSetCollection")
      .updateOne(
        { "createdBy._id": favorite.createdById, database: favorite.database },
        { $set: { isFavorite: false } }
      )
      .then(() => {
        dbConn
          .collection("FilterSetCollection")
          .updateOne(
            {
              _id: ObjectId(favorite.id),
              "createdBy._id": favorite.createdById,
            },
            { $set: { isFavorite: true } }
          )
          .then(() => {
            resolve({ code: 200 });
          })
          .catch((err) => {
            console.log("FilterSetSevice - setFavoriteFilterSetById", err);
            reject({ code: 500, message: err });
          });
      })
      .catch((err) => {
        console.log("FilterSetSevice - setFavoriteFilterSetById", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
function updateFilterSet(filterSet) {
  let _id = filterSet._id;
  delete filterSet._id;
  let promise = new Promise((resolve, reject) => {
    dbConn
      .collection("FilterSetCollection")
      .updateOne({ _id: ObjectId(_id) }, { $set: filterSet })
      .then(() => {
        resolve({ code: 200 });
      })
      .catch((err) => {
        console.log("FilterSetService - updateFilterSet", err);
        reject({ code: 500, message: err });
      });
  });
  return promise;
}
module.exports = {
  setDb,
  addFilterSet,
  getDatabaseToFilterSets,
  getFilterSetsByDatabase,
  removeFilterSetsByDatabase,
  setFavoriteFilterSet,
  updateFilterSet,
};
