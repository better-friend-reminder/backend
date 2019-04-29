const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const cors = require("cors");

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

// Using Bing in New Relic app
// Make an http request every 15 minutes so the server in production doesn't go idle
// const http = require("http");
// setInterval(function() {
//   http.get("https://best-friend-reminders.herokuapp.com/");
// }, 900000); // every 5 minutes (300000)

module.exports = server;
