const db = require("../data/dbConfig.js");

module.exports = {
  add,
  getAll,
  remove,
  update,
  getById
};

async function add(reminder) {
  const [id] = await db("reminders").insert(reminder, "id");
  return id;
}

function getAll(user_id) {
  return db("reminders").where({ user_id: Number(user_id) });
}

function remove(id, user_id) {
  return db("reminders")
    .where({ id: Number(id), user_id: Number(user_id) })
    .del();
}

function update(id, user_id, reminder) {
  return db("reminders")
    .where({ id: Number(id), user_id: Number(user_id) })
    .update(reminder);
}

function getById(id, user_id) {
  return db("reminders")
    .where({ id: Number(id), user_id: Number(user_id) })
    .first();
}
