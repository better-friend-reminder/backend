exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("reminders")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("reminders").insert([
        {
          user_id: "1",
          recipientName: "Anissa",
          recipientEmail: "anissa@anissa.com",
          message: "Hello",
          sent: false,
          category: "family",
          sendDate: new Date()
        },
        {
          user_id: "1",
          recipientName: "Aida",
          recipientEmail: "aida@aida.com",
          message: "Hello",
          sent: false,
          category: "family",
          sendDate: new Date()
        },
        {
          user_id: "1",
          recipientName: "Kenza",
          recipientEmail: "kenza@kenza.com",
          message: "Hello",
          sent: false,
          category: "family",
          sendDate: new Date()
        }
      ]);
    });
};
