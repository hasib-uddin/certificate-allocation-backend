const jwt = require("jsonwebtoken");
const jwtSecret = "assignment_task"; //process.env.JWT_SECRET;
const expiresIn = "3d"; //process.env.JWT_EXPIRES_IN;

const createToken = (info) => {
  const accessToken = jwt.sign(info, jwtSecret, {
    expiresIn: expiresIn,
  });
  return accessToken;
};

const verifyToken = (token) => {
  try {
    const tokenData = jwt.verify(token, jwtSecret);
    return tokenData;
  } catch (error) {
    return false;
  }
};

module.exports = {
  createToken,
  verifyToken,
};
