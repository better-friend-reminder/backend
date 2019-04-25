const db = require("../data/dbConfig.js");

module.exports = {
  add,
  getAll
};

async function add(user) {
  const [id] = await db("reminders").insert(user, "id");
  return id;
}

function getAll(user_id) {
  return db("reminders").where({ user_id: user_id });
}
