exports.up = function(knex, Promise) {
  return knex.schema.table("users", users => {
    users.string("name");
    users.string("email");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("users", users => {
    users.dropColumn("name");
    users.dropColumn("email");
  });
};
