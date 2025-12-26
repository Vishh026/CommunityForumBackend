const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Invalid token" });

    const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);

    const user = await User.findById(_id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = { _id: user._id, role: user.role };

    next();
    
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    
    if (!loggedInUser) return res.status(404).send("user not authenticated");

    if(loggedInUser.role  !== "ADMIN"){
      return res.status(403).send("Invalid access");
    }

    next()
  } catch (err) {
    return res.status(404).json({message: err.message})
  }
};

module.exports = {
  userAuth,
  adminAuth
};
