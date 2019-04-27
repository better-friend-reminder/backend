require("dotenv").config();

const express = require("express");

const scheduler = require("node-schedule");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

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
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.API_KEY
      }
    })
  );

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

      // add scheduler to send email at specified date
      const day = reminder.sendDate.split("-");
      const year = Number(day[0]);
      const month = Number(day[1]) - 1;
      const dayNum = Number(day[2]);
      const date = new Date(year, month, dayNum);
      try {
        const user = await Users.findBy({ id: userId }).first();
        scheduler.scheduleJob(reminderId.toString(), date, async function() {
          transporter
            .sendMail({
              to: reminder.recipientEmail,
              from: user.email,
              subject: "You have a message!!",
              html: `
                <h1>From ${user.name} </h1>
                <h2> Hello ${reminder.recipientName}</h2>
                <p>${reminder.message}</p>`
            })
            .then(res => {
              console.log(res);
            })
            .catch(err => {
              console.log(err);
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
