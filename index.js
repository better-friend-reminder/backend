require("dotenv").config();
require("newrelic");

const server = require("./api/server");
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`The server is listening on port ${PORT}`);
});
