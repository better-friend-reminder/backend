const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const generateToken = require("../util/tokenHelpers").generateToken;
const Users = require("../user/user-model");

router.post("/api/register", (req, res) => {
  const user = req.body;

  if (!user.username || !user.password) {
    res.status(400).json({
      errorMessage: "Please provide a email, and password."
    });
  } else {
    //generate hash from user's password
    const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times

    //override use.password with hash
    user.password = hash;

    //Create token with user info - Login the user when registering
    const token = generateToken(user);

    // Add user to database and send back response, with token info
    Users.add(user)
      .then(userId => {
        res.status(201).json({ userId: userId, token: token });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          errorMessage: "There was an error saving the new user to the database"
        });
      });
  }
});

module.exports = router;
