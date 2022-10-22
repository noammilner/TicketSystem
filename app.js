const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const genTicket = require(__dirname + "/ticketNum.js");
const mongoose = require("mongoose");

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

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("new-ticket");
});

app.get("/ticket-created", function (req, res) {
  res.render("ticket-created", { ticketNumber: ticketNumber });
});

app.get("/admin-panel", function (req, res) {
  Ticket.find(
    { ticketStatus: "Unresolved" },
    function (err, unresolvedTickets) {
      if (unresolvedTickets.length === 0) {
        res.render("no-tickets");
      } else {
        res.render("admin-panel", { openTickets: unresolvedTickets });
      }
    }
  );
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
  Ticket.updateOne(
    { ticketNumber: tickNum },
    {
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

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
