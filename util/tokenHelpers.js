const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "It's a secret";

module.exports = {
  generateToken,
  restrict
};

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };
  const options = {
    expiresIn: "1d"
  };
  return jwt.sign(payload, secret, options);
}

function restrict(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    // Check if the token is valid
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        // The token has been modified or expired
        res.status(401).json({ errorMessage: "You have to login first." });
      } else {
        req.userInfo = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ errorMessage: "You have to login first." });
  }
}
