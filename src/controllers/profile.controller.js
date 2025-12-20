const User = require("../models/user.model");

async function getMyProfile(req, res) {
  try {
    const loggedInUser = await User.findById(req.user._id).select("-password");

    if (!loggedInUser)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "Fetch user successfully",
      user: loggedInUser,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}



module.exports = {
  getMyProfile
};
