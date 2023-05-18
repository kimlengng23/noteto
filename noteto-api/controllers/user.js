const express = require("express");
const helper = require("../js/helper.js");
const userService = require("../services/user.js");
const app = express();
const path = require("path");

//const mail = require('./mail.js');

let dbConn = null;

function setDb(conn) {
  userService.setDb(conn);
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
app.use(helper.verifyToken);

app.post("/register", (req, res) => {
  let account = req.body;
  userService
    .getAccountByUsername(account.username.toLowerCase())
    .then((response) => {
      if (response.code == 200) {
        res.sendStatus(409);
      } else {
        userService
          .addAccount(account)
          .then((response) => {
            res.sendStatus(response.code);
          })
          .catch((response) => {
            res.status(response.code).send(response.message);
          });
      }
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.post("/login", (req, res) => {
  let account = req.body;
  userService
    .login(account)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.sendStatus(response.code);
    });
});
app.get("/logout", (req, res) => {
  let sessionId = req.headers["authorization"];
  sessionId = sessionId == null ? "" : sessionId;
  if (sessionId) {
    userService
      .logout(sessionId)
      .then((response) => {
        res.sendStatus(response.code);
      })
      .catch((response) => {
        res.status(response.code).send(response.message);
      });
  } else {
    res.sendStatus(200);
  }
});
app.get("/verify/token", (req, res) => {
  let decoded = req.decoded;
  let sessionInfo = {
    last: decoded["last"],
    first: decoded["first"],
    userId: decoded["userId"],
    username: decoded["username"],
    sessionId: decoded["sessionId"],
    options: decoded["options"],
  };
  res.send(sessionInfo);
});
app.get("/get/by/database/:database", (req, res) => {
  userService
    .getUsersByDatabase(req.params.database)
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
app.get("/get/avatars", (req, res) => {
  userService
    .getAvatars()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.sendStatus(response.code);
    });
});
app.get("/verify/account/:id", (req, res) => {
  let sql = "UPDATE User t SET t.verified = true";
  dbConn.query(sql, [], (err, result) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});
app.get("/get/avatar", (req, res) => {
  let options = {
    root: path.join(__dirname, "../assets"),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };
  let fileName = req.query.id;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      res.sendStatus(500);
      return console.log("Unable to send file");
    }
  });
});
app.get("/get/all", helper.verifyAdminToken, (req, res) => {
  userService
    .getAllUsers()
    .then((response) => {
      res.status(response.code).send(response.data);
    })
    .catch((response) => {
      res.status(response.code).send(response.message);
    });
});
module.exports = {
  app,
  setDb,
};
