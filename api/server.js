const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const cors = require("cors");

const scheduler = require("node-schedule");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const Reminder = require("../reminder/reminder-model");
const db = require("../data/dbConfig.js");

const authRouter = require("../auth/auth-router");
const reminderRouter = require("../reminder/reminder-router");

const server = express();

server.use(express.json());
server.use(helmet());
server.use(logger("dev"));
server.use(cors());

server.use(authRouter);
server.use("/api/reminders", reminderRouter);

server.get("/", (req, res) => {
  res.json("Welcome to the Best Friend Reminders API");
});

// ************************************************************
// db("reminders")
//   .then(reminder => {
//     let date = reminder[3].sendDate;
//     if (typeof date === "number" || typeof date === "string") {
//       console.log("creating date");
//       date = new Date(reminder[3].sendDate);
//     }
//     // const date = new Date("2019-04-27");
//     console.log("date: ", date);
//     console.log("typeof: ", typeof date);
//     const year = date.getUTCFullYear();
//     console.log("year: ", year);
//     const month = date.getUTCMonth();
//     console.log("month: ", month);
//     const day = date.getUTCDate();
//     console.log("day: ", day);
//     const sendDate = new Date(year, month, day, 11, 41, 00);
//     scheduler.scheduleJob(sendDate, async function() {
//       console.log("It's working!");
//     });
//   })
//   .catch(err => console.log(err));

module.exports = server;
