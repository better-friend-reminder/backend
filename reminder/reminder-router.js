require("dotenv").config();

const express = require("express");

const scheduler = require("node-schedule");
const sg = require("sendgrid")(process.env.SENDGRID_API_KEY);

const restrict = require("../util/tokenHelpers").restrict;
const Reminder = require("./reminder-model");
const Users = require("../user/user-model");

const router = express.Router();

router.get("/", restrict, async (req, res) => {
  const userId = req.userInfo.subject;
  try {
    const reminders = await Reminder.getAll(userId);
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error fetching the reminders from the database" });
  }
});

router.post("/", restrict, async (req, res) => {
  const userId = req.userInfo.subject;
  const reminder = req.body;
  if (
    !reminder.recipientName ||
    !reminder.recipientEmail ||
    !reminder.message ||
    !reminder.category ||
    !reminder.sendDate
  ) {
    res.status(400).json({
      errorMessage:
        "Please provide all the required information: recipient name, recipient email, message, category, and the send date"
    });
  } else {
    try {
      reminder.sent = false;
      reminder.user_id = userId;
      const reminderId = await Reminder.add(reminder);

      const { recipientName, recipientEmail, message } = reminder;
      let date = reminder.sendDate;
      if (typeof date === "number" || typeof date === "string") {
        date = new Date(date);
      }
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const sendDate = new Date(year, month, day, 11, 10, 00);
      try {
        const user = await Users.findBy({ id: userId }).first();
        if (!user.name) user.name = "friend";
        if (!user.email) user.email = "no-email";
        scheduler.scheduleJob(reminderId.toString(), sendDate, async function() {
          const request = sg.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: {
              personalizations: [
                {
                  to: [
                    {
                      email: recipientEmail
                    }
                  ],
                  subject: "You have a message from someone who cares!"
                }
              ],
              from: {
                email: "no-reply@no-reply.com"
              },
              content: [
                {
                  type: "text/html",
                  value: `
                    <h1>Hello ${recipientName}</h1>
                    <h2>from ${user.name} - ${user.email}</h2>
                    <p>${message}</p>`
                }
              ]
            }
          });
          sg.API(request)
            .then(response => {
              console.log(response.statusCode);
              console.log(response.body);
              console.log(response.headers);
            })
            .catch(error => {
              console.log(error.response.statusCode);
            });

          try {
            await Reminder.update(reminderId, userId, { sent: true });
          } catch (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.log("ERROR: ", err);
      }

      res.status(201).json(reminderId);
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error adding the reminder to the database" });
    }
  }
});

router.delete("/:id", restrict, async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.userInfo.subject;
  try {
    const count = await Reminder.remove(reminderId, userId);
    if (count === 0) {
      res.status(400).json({
        count: count,
        message: "Please provide a valid reminder id"
      });
    } else {
      // cancel the scheduler
      const scheduled = scheduler.scheduledJobs[reminderId.toString()];
      if (scheduled) {
        scheduled.cancel();
      }

      res.status(200).json({ count: count, message: "The reminder has been deleted" });
    }
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error removing the reminder from the database" });
  }
});

router.put("/:id", restrict, async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.userInfo.subject;
  const reminderInfo = req.body;
  if (!reminderInfo || Object.keys(reminderInfo).length === 0) {
    res.status(400).json({
      errorMessage: "Please provide the information to be updated"
    });
  } else {
    try {
      const count = await Reminder.update(reminderId, userId, reminderInfo);
      if (count === 0) {
        res.status(400).json({
          count: count,
          message: "Please provide a valid reminder id and information"
        });
      } else {
        //update scheduler to send the email with the updated date
        if (reminderInfo.sendDate) {
          // get the scheduler
          const scheduled = scheduler.scheduledJobs[reminderId.toString()];
          if (scheduled) {
            //cancel the previously scheduled email
            scheduled.cancel();
          }
          //create a new one with the new date
          let date = reminderInfo.sendDate;
          if (typeof date === "number" || typeof date === "string") {
            date = new Date(date);
          }
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth();
          const day = date.getUTCDate();
          const sendDate = new Date(year, month, day, 11, 10, 00);
          try {
            const user = await Users.findBy({ id: userId }).first();
            if (!user.name) user.name = "friend";
            if (!user.email) user.email = "no-email";
            const reminder = await Reminder.getById(reminderId, userId);
            const { recipientEmail, recipientName, message } = reminder;
            scheduler.scheduleJob(reminderId.toString(), sendDate, async function() {
              console.log(`Schedule for date: ${sendDate}`);
              const request = sg.emptyRequest({
                method: "POST",
                path: "/v3/mail/send",
                body: {
                  personalizations: [
                    {
                      to: [
                        {
                          email: recipientEmail
                        }
                      ],
                      subject: "You have a message from someone who cares!"
                    }
                  ],
                  from: {
                    email: "no-reply@no-reply.com"
                  },
                  content: [
                    {
                      type: "text/html",
                      value: `
                    <h1>Hello ${recipientName}</h1>
                    <h2>from ${user.name} - ${user.email}</h2>
                    <p>${message}</p>`
                    }
                  ]
                }
              });
              sg.API(request)
                .then(response => {
                  console.log(response.statusCode);
                  console.log(response.body);
                  console.log(response.headers);
                })
                .catch(error => {
                  console.log(error.response.statusCode);
                });

              try {
                await Reminder.update(reminderId, userId, { sent: true });
              } catch (err) {
                console.log(err);
              }
            });
          } catch (err) {
            console.log("ERROR: ", err);
          }
        }
        res.status(200).json({ count: count, message: "The reminder has been updated" });
      }
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error removing the reminder from the database" });
    }
  }
});

router.get("/:id", restrict, async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.userInfo.subject;
  try {
    const reminder = await Reminder.getById(reminderId, userId);
    if (!reminder) {
      res.status(400).json({
        message: "Please provide a valid reminder id."
      });
    } else {
      res.status(200).json(reminder);
    }
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error fetching the reminder from the database" });
  }
});

module.exports = router;
