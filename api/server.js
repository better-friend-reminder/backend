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

module.exports = server;
