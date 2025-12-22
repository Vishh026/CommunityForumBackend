const User = require("../models/user.model");
const {
  validateUpdateProfile,
  sanitizeUser,
} = require("../Utilities/ValidateData");

async function getMyProfile(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Fetch user successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function updateMyProfile(req, res) {
  try {
    // get the loggedin user
    const { _id } = req.user;
    const loggedInUser = await User.findById(_id);

    if (!loggedInUser)
      return res.status(404).json({ message: "user not found" });
    
    if (req.body.skills && !Array.isArray(req.body.skills)) return false;
    if (req.body.firstName && req.body.firstName.trim() === "") return false;

    if (!validateUpdateProfile(req) || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid or empty update" });
    }

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.status(201).json({
      mesasge: `${
        loggedInUser.firstName + " " + loggedInUser.lastName
      }'s profile updated successfully`,
      user: sanitizeUser(loggedInUser),
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function fetchUserProfile(req, res) {
  try {
    const requestedUserId = req.params.userid;

    if (!requestedUserId)
      return res.status(403).json({ message: "Invalid User id" });

    const requestedUser = await User.findById(requestedUserId);
    if (!requestedUser)
      return res.status(404).json({ message: "user not found" });

    if (requestedUser.blockedUsers.includes(req.user._id))
      return res.status(404).json({ message: "User not found" });

    return res.status(201).json({
      message: `fetch ${requestedUser.firstName}'s profile successfully`,
      requestedUser,
    });
    // get the id from req.params
    // check use present or not in the db
    // if user present => gives his data
  } catch (err) {
    res.status(400).json({ mesasge: err.message });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  fetchUserProfile,
};
