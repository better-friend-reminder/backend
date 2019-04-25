const db = require("../data/dbConfig.js");

module.exports = {
  add,
  getAll
};

async function add(reminder) {
  const [id] = await db("reminders").insert(reminder, "id");
  return id;
}

function getAll(user_id) {
  return db("reminders").where({ user_id: user_id });
}
