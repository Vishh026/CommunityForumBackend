const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Invalid token" });

    const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);

    const user = await User.findById(_id);
    
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { _id: user._id, role: user.role };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  userAuth,
};
