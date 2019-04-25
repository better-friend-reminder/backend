const db = require("../data/dbConfig.js");

module.exports = {
  add,
  getAll,
  remove,
  update
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

function update(id, user_id, reminder) {
  return db("reminders")
    .where({ id: id, user_id: user_id })
    .update(reminder);
}
