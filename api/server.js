const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const cors = require("cors");

const server = express();

server.use(express.json());
server.use(helmet());
server.use(logger("dev"));
server.use(cors());

module.exports = server;
