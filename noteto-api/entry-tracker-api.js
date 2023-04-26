const express = require("express");
const database = require("./database.js");
const { ObjectId } = require("mongodb");
const helper = require("./helper.js");
const path = require("path");
const app = express();
const mail = require("./mail.js");
const { verify } = require("crypto");
let dbConn = null;
function setDb(conn) {
  dbConn = conn;
}
function sendAccountVerifyEmail(user) {
  const mailData = {
    from: "KTeeXpressMail@gmail.com", // sender address
    to: user["email"], // list of receivers
    subject: "Verify Your Email",
    html: `Hello ${user["first"]} ${user["last"]},

          <p>Thank you for regisitering an account with KTeeXpressMail. 
          To finish registering and continue exploring on <a href="KTeeXpressMail.com/store/#/">KTeeXpressMail.com</a>, 
          please verify your email below.</p>
          
          <a href="https://kteexpressmail.com/store/#/verify/${user["_id"]}" style="
              background-color: #4CAF50;  
              border: none; color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;" target="_blank">
          Verify Now    
          </a>
          <p></p>
          <div>Sincerely,</div>
          <div>KTee Xpress Mail Support Team</div>`,
  };
  mail.transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
}
app.use(express.json());

app.post("/update/header/list", (req, res) => {
  let headerList = req.body;
  dbConn.collection("SystemHeader").insertMany(headerList, (err, result) => {
    if (err) {
      return console.log("Unable to insert header list");
    }
    res.sendStatus(200);
  });
});

app.get("/get/navigation/options/:role", (req, res) => {});
app.post("/search/entries", (req, res) => {
  let filter = req.body;
  dbConn
    .collection("EntryCollection")
    .find(filter)
    .sort({ id: -1, dateCreated: -1 })
    .toArray((err, entries) => {
      if (err) {
        return console.log("Unable to get entries");
      }
      res.send(entries);
    });
});
app.get("/get/custom/buttons/by/database/:database", (req, res) => {
  dbConn
    .collection("SystemCustomButton")
    .find({ database: req.params.database })
    .toArray((err, buttons) => {
      if (err) {
        return console.log("Unable to get custom buttons by database");
      }
      res.send(buttons);
    });
});
app.get("/get/automations/by/database/:database", (req, res) => {
  dbConn
    .collection("SystemAutomation")
    .find({ database: req.params.database })
    .toArray((err, automations) => {
      if (err) {
        return console.log("Unable to get automations by database");
      }
      let automationDict = {};
      automations.forEach((automation) => {
        if (typeof automationDict[automation.fieldA] === "undefined") {
          automationDict[automation.fieldA] = [];
        }
        automationDict[automation.fieldA].push(automation);
      });
      res.send(automationDict);
    });
});
app.post("/remove/headers/:database", (req, res) => {});
app.post("/remove/layout/:database", (req, res) => {});
app.post("/remove/database/access", (req, res) => {
  let access = req.body;
  try {
    dbConn.collection("SystemDatabaseAccess").deleteOne(
      {
        "user.username": access["user"]["username"],
        "database.value": access["database"]["value"],
      },
      (err, result) => {
        if (err) {
          console.log("Unable to remove");
          res.sendStatus(500);
        }
        res.sendStatus(200);
      }
    );
  } catch (e) {
    console.log(e);
  }
});
app.post("/register/user", (req, res) => {});
app.post("/login", (req, res) => {});
app.get("/get/address/by/user/id/:userId", (req, res) => {
  dbConn
    .collection("AddressCollection")
    .find({ userId: req.params.userId })
    .toArray((err, allAddresses) => {
      if (err) {
        return console.log("Unable to get all addresses by user Id");
      }
      res.send(allAddresses);
    });
});
app.get("/get/shipping/bills/by/customer/id/:customerId", (req, res) => {
  dbConn
    .collection("EntryCollection")
    .find({ database: "billTracker", "customer._id": req.params.customerId })
    .toArray((err, entries) => {
      if (err) {
        return console.log("Unable to get entries by customerId");
      }
      res.send(entries);
    });
});
app.get("/get/label/bills/by/customer/id/:customerId", (req, res) => {
  dbConn
    .collection("EntryCollection")
    .find({ database: "labelTracker", "requestor._id": req.params.customerId })
    .toArray((err, entries) => {
      if (err) {
        return console.log("Unable to get entries by customerId");
      }
      res.send(entries);
    });
});
app.get("/verify/account/:id", (req, res) => {
  dbConn
    .collection("SystemUser")
    .updateOne({ _id: ObjectId(req.params.id) }, { $set: { isVerified: true } })
    .then((result) => {
      if (result.matchedCount > 0) {
        console.log(result.matchedCount);
        res.sendStatus(200);
      }
    })
    .catch(() => {
      res.sendStatus(500);
    });
});
app.post("/add/deliveryInfo", (req, res) => {
  let deliveryInfo = req.body;
  let query = { _id: new ObjectId(deliveryInfo.userId) };
  console.log(deliveryInfo);
  dbConn
    .collection("SystemUser")
    .updateOne(query, {
      $push: { deliveryInfoList: deliveryInfo.deliveryInfo },
      $set: { primaryDeliveryInfo: deliveryInfo.deliveryInfo },
    })
    .then((result) => {
      if (result.matchedCount > 0) {
        res.sendStatus(200);
      }
    })
    .catch(() => {
      res.sendStatus(500);
    });
});
app.post("/backfill", (req, res) => {
  let body = req.body;
  dbConn
    .collection("EntryCollection")
    .find({ database: body.database })
    .toArray((err, allEntries) => {
      if (err) {
        return console.log("Unable to get all databases");
      }
      allEntries.forEach((e) => {
        let change = {};
        if (
          typeof e[body.src] == "undefined" ||
          e[body.src] == null ||
          e[body.src].length == 0
        )
          change[body.des] = 0;
        else if (e && e[body.src][0] == "$")
          change[body.des] = parseFloat(e[body.src].substring(1));
        else if (e && e[body.src][0] != "$") {
          change[body.des] = parseFloat(e[body.src]);
        }
        dbConn
          .collection("EntryCollection")
          .findOneAndUpdate({ id: e.id }, { $set: change });
      });
      res.sendStatus(200);
    });
});

module.exports = {
  app,
  setDb,
};
