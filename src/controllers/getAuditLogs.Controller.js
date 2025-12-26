const AuditLog = require("../models/AuditLog.model");
const mongoose = require("mongoose");
const { getDataRanges } = require("../Utilities/dataRange");
const User = require("../models/user.model");
const Community = require("../models/community.model");

// Controller to get audit logs with security checks
async function getAuditLogsController(req, res) {
  try {
    // Only allow admin to access
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { actorId, entityType, action, page = 1, limit = 20 } = req.query;

    // Validate ObjectId
    const query = {};
    if (actorId) {
      if (!mongoose.Types.ObjectId.isValid(actorId)) {
        return res.status(400).json({ message: "Invalid actorId" });
      }
      query.actorId = actorId;
    }

    // Sanitize input for entityType and action
    if (entityType) query.entityType = entityType.trim();
    if (action) query.action = action.trim();

    // Pagination
    const parsedPage = Math.max(parseInt(page), 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit), 1), 100); // max 100

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .populate("actorId", "firstName lastName userName");

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      logs,
      total,
      limit: parsedLimit,
      page: parsedPage,
    });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function getAdminAnalyticsController(req, res) {
  try {
    // 🔐 Admin guard
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { range, from, to } = req.query;

    // 📅 dynamic date calculation
    const { startDate, endDate } = getDateRange({ range, from, to });

    // 🚀 Parallel DB queries
    const [
      totalUsers,
      usersInRange,
      totalCommunities,
      communitiesInRange,
      loginsInRange,
      joinsInRange,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),

      Community.countDocuments({}),
      Community.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      AuditLog.countDocuments({
        action: "USER_LOGIN",
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      AuditLog.countDocuments({
        action: "JOIN_COMMUNITY",
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      AuditLog.find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("actorId", "firstName lastName userName role"),
    ]);

    return res.status(200).json({
      range: range || "7d",
      users: {
        total: totalUsers,
        newUsers: usersInRange,
      },
      communities: {
        total: totalCommunities,
        created: communitiesInRange,
      },
      activity: {
        logins: loginsInRange,
        joins: joinsInRange,
      },
      recentAuditLogs,
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { getAdminAnalyticsController };



module.exports = { getAuditLogsController, getAdminAnalyticsController };
