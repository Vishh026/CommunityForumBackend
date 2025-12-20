const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function isValidLinkedinUrl(url) {
  if (!validator.isURL(url)) return false;

  return url.startsWith("https://www.linkedin.com/in/");
}

function isValidGithubUrl(url) {
  if (!validator.isURL(URL)) return false;

  return url.startsWith("https://github.com/");
}

async function generateRefreshToken(id) {
  return jwt.sign({ _id: id }, process.env.REFRESH_TOKEN_SECRETE, {
    expiresIn: "1h",
  });
}

async function generateAccessToken(id) {
  return jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRETE, {
    expiresIn: "1h",
  });
}

async function hashPassword(inputPassword) {
  return await bcrypt.hash(inputPassword, 10);
}

async function comparePassword(userInputPassword, hashPassword) {
  return await bcrypt.compare(userInputPassword, hashPassword);
}

module.exports = {
  isValidGithubUrl,
  isValidLinkedinUrl,
  comparePassword,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
};
