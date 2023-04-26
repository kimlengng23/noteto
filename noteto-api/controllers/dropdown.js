const express = require("express");
const helper = require("../helper.js");
const dropdownService = require("../services/dropdown.js");
const app = express();
const path = require("path");

let dbConn = null;

function setDb(conn) {
  dropdownService.setDb(conn);
}

app.use(express.json());
app.use(helper.verifyToken);
