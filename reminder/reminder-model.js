const db = require("../data/dbConfig.js");

module.exports = {
  add,
  getAll,
  remove
};

async function add(reminder) {
  const [id] = await db("reminders").insert(reminder, "id");
  return id;
}

function getAll(user_id) {
  return db("reminders").where({ user_id: user_id });
}

function remove(id, user_id) {
  return db("reminders")
    .where({ id: id, user_id: user_id })
    .del();
}
