const express = require("express");

const restrict = require("../util/tokenHelpers").restrict;
const Reminder = require("./reminder-model");

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
  }
  try {
    reminder.sent = false;
    reminder.user_id = userId;
    const reminderId = await Reminder.add(reminder);
    res.status(201).json(reminderId);
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error adding the reminders to the database" });
  }
});

module.exports = router;
