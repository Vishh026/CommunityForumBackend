const User = require("../models/user.model");
const {
  validateUpdateProfile,
  sanitizeUser,
} = require("../Utilities/ValidateData");
const AuditLog = require("../models/AuditLog.model");
const { logAction } = require("../Utilities/logAction");

async function getMyProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Fetched logged-in user successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


async function updateMyProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Allowed fields for students/users
    const allowedFields = [
      "firstName",
      "lastName",
      "profileURL",
      "avatar",
      "bio",
      "headline",
      "skills",
      "publicVisibility",
      "githubUrl",
      "linkedinUrl"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();

    // Audit log
    await logAction({
      actorId: user._id,
      actorRole: user.role,
      action: "USER_UPDATED",
      entityType: "PROFILE",
      entityId: user._id,
      metadata: { ip: req.ip, userAgent: req.headers["user-agent"] },
    });

    return res.status(200).json({
      message: `${user.firstName} ${user.lastName}'s profile updated successfully`,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


async function fetchUserProfile(req, res) {
  try {
    const requestedUserId = req.params.userid;
    if (!requestedUserId) return res.status(400).json({ message: "Invalid user id" });

    const requestedUser = await User.findById(requestedUserId);
    if (!requestedUser) return res.status(404).json({ message: "User not found" });

    // Check if current user is blocked
    if (requestedUser.blockedUsers?.includes(req.user._id)) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: `Fetched ${requestedUser.firstName}'s profile successfully`,
      user: sanitizeUser(requestedUser),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


module.exports = {
  getMyProfile,
  updateMyProfile,
  fetchUserProfile,
};
