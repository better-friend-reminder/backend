const db = require("../data/dbConfig.js");

module.exports = {
  add,
  findBy
};

async function add(user) {
  const [id] = await db("users").insert(user);
  return id;
}

function findBy(condition) {
  return db("users").where(condition);
}
