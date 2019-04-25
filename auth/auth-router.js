const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const generateToken = require("../util/tokenHelpers").generateToken;
const Users = require("../user/user-model");

router.post("/api/register", (req, res) => {
  const user = req.body;

  if (!user.username || !user.password) {
    res.status(400).json({
      errorMessage: "Please provide a username, and password."
    });
  } else {
    //generate hash from user's password
    const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times

    //override use.password with hash
    user.password = hash;

    // Add user to database and send back response, with token info
    Users.add(user)
      .then(userId => {
        user.id = userId;
        //Create token with user info - Login the user when registering
        const token = generateToken(user);

        res.status(201).json({ userId: userId, token: token });
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: "There was an error saving the new user to the database"
        });
      });
  }
});

router.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      errorMessage: "Please provide a username, and password."
    });
  } else {
    Users.findBy({ username }) // Check username exist in database
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          // Check that password is same as in database
          const token = generateToken(user); // Create token because user is valid
          res.status(200).json({ message: `Welcome ${user.username}!`, token }); // Send token to client
        } else {
          res.status(400).json({ errorMessage: "Invalid Credentials" });
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: "There was an error logging user"
        });
      });
  }
});

module.exports = router;
