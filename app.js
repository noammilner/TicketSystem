require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const genTicket = require(__dirname + "/ticketNum.js");
const {
  authUser,
  checkPermission
} = require(__dirname + "/ad.js")
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const sessions = require('express-session')

// Mongoose Configuration

mongoose.connect("mongodb://localhost:27017/ticketsDB", {
  useNewUrlParser: true,
});

const ticketSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: [true, "Must include name."],
  },
  departmentName: {
    type: String,
    required: [true, "Must include department."],
  },
  urgencyLevel: {
    type: String,
    required: true,
  },
  incidentDescp: {
    type: String,
    required: [true, "Must describe incident."],
  },
  incidentSolution: {
    type: String,
    required: false,
  },
  ticketNumber: {
    type: String,
    required: true,
  },
  ticketStatus: {
    type: String,
    required: true,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

// Express Configuration

const app = express();

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: process.env.SECRET,
  saveUninitialized: true,
  cookie: {
    maxAge: oneDay
  },
  resave: false
}));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cookieParser());

var session;

// Routes

app.get("/", function (req, res) {
  session = req.session;
  if (session.userid) {
    res.render("new-ticket")
  } else {
    res.render("login", {
      status: ""
    })
  }
});

app.get("/ticket-created", function (req, res) {
  res.render("ticket-created", {
    ticketNumber: ticketNumber
  });
});

app.get("/admin-panel", async function (req, res) {
  session = req.session;
  if (session.userid) {
    let username = session.userid;
    let groupName = process.env.AD_GROUP;
    try {
      const isMember = await checkPermission(username, groupName);
      if (isMember) {
        Ticket.find({
            ticketStatus: "Unresolved"
          },
          function (err, unresolvedTickets) {
            if (unresolvedTickets.length === 0) {
              res.render("no-tickets");
            } else {
              res.render("admin-panel", {
                openTickets: unresolvedTickets
              });
            }
          }
        );
      } else {
        console.log(`User ${username} does not have sufficient permissions to view the admin-panel!`)
      }
    } catch (error) {
      console.log(error)
    }
  } else {
    res.render("login", {
      status: ""
    })
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.post("/submit", function (req, res) {
  let name = req.body.fullName;
  let department = req.body.department;
  let urgency = req.body.urgency;
  let incident = req.body.incident;
  ticketNumber = genTicket();

  const ticket = new Ticket({
    employeeName: name,
    departmentName: department,
    urgencyLevel: urgency,
    incidentDescp: incident,
    ticketNumber: ticketNumber,
    ticketStatus: "Unresolved",
  });

  ticket.save(async function (err) {
    if (err) {
      console.log(err);
      await mongoose.connection.close();
    } else {
      console.log(`Succesfuly created ticket ${ticket.ticketNumber}!`);
      res.redirect("/ticket-created");
    }
  });
});

app.post("/resolve", function (req, res) {
  let tickNum = req.body.ticketNum;
  let solution = req.body.solution;
  Ticket.updateOne({
      ticketNumber: tickNum
    }, {
      ticketStatus: "Resolved",
      incidentSolution: solution,
    },
    function (err, numAffected) {
      console.log(
        "Successfully resolved " + numAffected.modifiedCount + " ticket."
      );
      res.redirect("/admin-panel");
    }
  );
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const auth = await authUser(username, password);
    if (auth) {
      session = req.session;
      session.userid = username;
      res.redirect("/");
      console.log("Successfull login attempt by " + username)
    } else {
      console.log("Unsuccessfull login attempt by " + username)
    }
  } catch (error) {
    res.render("login", {
      status: "Invalid username or password"
    })
    console.log(error)
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});