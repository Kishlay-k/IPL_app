const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const dateFormat = require("dateformat");
const { matches } = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://kishlay-kumar:Test123@cluster0.nw4nx.mongodb.net/IPL_app?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connected");
});

const matchSchema = new mongoose.Schema({
  _id: Number,
  dateNDday: String,
  time: String,
  T1: String,
  T2: String,
});

const userSchema = new mongoose.Schema({
  _id: Number,
  username: String,
  currentKey: String,
  all_keys: Array,
  Bets: Array,
  Wins: Array,
});

const winnerSchema = new mongoose.Schema({
  victorius: Array,
});

const Match = mongoose.model("Match", matchSchema, "table");
let tabl = [];
Match.find({}, function (err, doc) {
  tabl = doc;
}).sort("_id");

const User = mongoose.model("User", userSchema, "user");
const Winners = mongoose.model("Winners", winnerSchema, "Winners");

let user = [];
User.find({}, function (err, doc) {
  user = doc;
}).sort("username");
let dnd = new Date();
let date = new Date();
app.get("/", function (req, res) {
  // const Match = mongoose.model("Match", matchSchema, "table");
  Match.find({}, function (err, doc) {
    tabl = doc;
  }).sort("_id");

  let dnd = new Date();
  let date = new Date();
  // let dnd = "April 18 2021";
  Match.find(
    { dateNDday: dateFormat(dnd, "mmmm d dddd") },
    function (err, doc) {
      let dnd = new Date();
      let date = new Date();
      console.log(doc)
      if (doc.length == 0) {
        console.log(4);
        res.render("notStarted");
      } else if (doc.length == 1) {
        if (
          date.getUTCHours() < 13 ||
          (date.getUTCMinutes() < 30 && date.getUTCHours() == 13)
        ) {
          console.log(5);
          res.render("home", {
            t1: doc[0].T1,
            t2: doc[0].T2,
            id: doc[0]._id,
            matches: 1,
            number: 1,
          });
        } else {
        console.log(6,date.getUTCMinutes(),date.getUTCHours());
          console.log("OVer 1");
          res.render("Over");
        }
      } else if (doc.length == 2) {
        if (
          date.getUTCHours() < 9 ||
          (date.getUTCMinutes() < 30 && date.getUTCHours() == 9)
        ) {
          res.render("home", {
            t1: doc[0].T1,
            t2: doc[0].T2,
            id: doc[0]._id,
            matches: 2,
            number: 1,
          });
        } else if (
          date.getUTCHours() < 13 ||
          (date.getUTCMinutes() < 30 && date.getUTCHours() == 13)
        ) {
          res.render("home", {
            t1: doc[1].T1,
            t2: doc[1].T2,
            id: doc[1]._id,
            matches: 2,
            number: 2,
          });
        } else {
          console.log("OVer 2");

          res.render("Over");
        }
      }
    }
  ).sort("_id");
});

app.get("/coming_soon", function (req, res) {
  res.render("coming_soon");
});

app.get("/leader", function (req, res) {
  let bett = [];
  let winnr = [];
  User.find({}, function (err, doc) {
    doc.forEach(function (ele) {
      let wn = 0;
      let ls = 0;
      for (var jk = 1; jk < 57; jk++) {
        if (ele.Wins[jk] == "") {
          break;
        } else {
          if (ele.Wins[jk] == ele.Bets[jk]) {
            wn++;
          } else {
            ls++;
          }
        }
      }
      winnr.push([wn, ls, ele.username]);
    });
    res.render("leader", { winnr: winnr });
  });
});

app.get("/table", function (req, res) {
  res.render("table", { tabl: tabl });
});
app.get("/time", function (req, res) {
  let date = new Date();
  res.render("var",{ddd:date.getUTCDate(),dnd:date.getUTCHours(),dmd:date.getUTCMinutes()});
});

app.get("/test123", function (req, res) {
  User.find({}, function (err, doc) {
    user = doc;
    res.render("userlist", { user: user });
  }).sort("username");
});

app.post("/test", function (req, res) {
  const dtae = new Date();
  const password = req.body.password;
  const choice = req.body.choice;
  let idd = req.body.id;
  const match = req.body.matches;
  const number = req.body.number;
  if (match == 1) {
    if (
      dtae.getUTCHours() < 13 ||
      (dtae.getUTCMinutes() < 30 && dtae.getUTCHours() == 13)
    ) {
      User.find({ currentKey: password }, function (err, doc) {
        if (doc.length == 0) {
          res.redirect("/");
        } else {
          let username = doc[0].username;
          res.render("success", { username: username, choice: choice });
          User.findOne({ currentKey: password }, function (err, doc) {
            doc.Bets.set(parseInt(idd), choice);
            doc.save();
          });
        }
      });
    } else {
      console.log("OVer 3");

      res.render("Over");
    }
  } else if (match == 2) {
    if (number == 1) {
      if (
        dtae.getUTCHours() < 9 ||
        (dtae.getUTCMinutes() < 30 && dtae.getUTCHours() == 9)
      ) {
        User.find({ currentKey: password }, function (err, doc) {
          if (doc.length == 0) {
            res.redirect("/");
          } else {
            let username = doc[0].username;
            res.render("success", { username: username, choice: choice });
            User.findOne({ currentKey: password }, function (err, doc) {
              doc.Bets.set(parseInt(idd), choice);
              doc.save();
            });
          }
        });
      } else {
        console.log("Over 4");

        res.render("Over");
      }
    } else if (number == 2) {
      if (
        dtae.getUTCHours() < 13 ||
        (dtae.getUTCMinutes() < 30 && dtae.getUTCHours() == 13)
      ) {
        User.find({ currentKey: password }, function (err, doc) {
          if (doc.length == 0) {
            res.redirect("/");
          } else {
            let username = doc[0].username;
            res.render("success", { username: username, choice: choice });
            User.findOne({ currentKey: password }, function (err, doc) {
              doc.Bets.set(parseInt(idd), choice);
              doc.save();
            });
          }
        });
      } else {
        console.log("OVer 5");

        res.render("Over");
      }
    }
  }
});

app.get("/Winner", function (req, res) {
  res.render("winner");
});

app.post("/Winner", function (req, res) {
  if (req.body.key == "adgjlsfhk") {
    User.find({}, function (err, doc) {
      doc.forEach(function (ele) {
        ele.Wins.set(parseInt(req.body.id), req.body.winner);
        ele.save();
      });
    });
  }
  res.redirect("/");
});

app.get("/current", function (req, res) {
  User.find({}, function (err, doc) {
    res.render("current", { doc: doc });
  }).sort("username");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started successfully.");
});
