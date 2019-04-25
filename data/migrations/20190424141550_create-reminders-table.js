exports.up = function(knex, Promise) {
  return knex.schema.createTable("reminders", tbl => {
    tbl.increments();
    tbl
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users");
    tbl.string("recipientName", 128).notNullable();
    tbl.string("recipientEmail", 128).notNullable();
    tbl.string("message").notNullable();
    tbl.boolean("sent").notNullable();
    tbl.string("category").notNullable();
    tbl.date("sendDate").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("reminders");
};
