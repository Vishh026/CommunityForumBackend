const AuditLog = require("../models/AuditLog.model");
const mongoose = require("mongoose");

/**
 * Allowed enums – keep logger strict, not controllers
 */
const ALLOWED_ROLES = ["user", "ADMIN", "ai"];
const ALLOWED_ENTITY_TYPES = [
  "USER",
  "COMMUNITY",
  "POST",
  "COMMENT",
  "REQUEST",
];
const ALLOWED_ACTIONS = [
  "USER_REGISTERED",
  "USER_LOGIN",
  "USER_LOGOUT",
  "COMMUNITY_CREATED",
  "COMMUNITY_JOINED",
  "POST_CREATED",
  "POST_DELETED",
];

function logAction({
  user,              // req.user
  action,
  entityType,
  entityId,
  metadata = {},
  reason = "",
}) {
  try {
    // ---- Basic presence checks ----
    if (!user?._id || !action || !entityType || !entityId) {
      console.warn("[AuditLog] Skipped: missing required fields", {
        userId: user?._id,
        action,
        entityType,
        entityId,
      });
      return;
    }

    // ---- Enum validation ----
    if (!ALLOWED_ACTIONS.includes(action)) {
      console.warn("[AuditLog] Invalid action:", action);
      return;
    }

    if (!ALLOWED_ENTITY_TYPES.includes(entityType)) {
      console.warn("[AuditLog] Invalid entityType:", entityType);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      console.warn("[AuditLog] Invalid entityId:", entityId);
      return;
    }

    const actorRole = ALLOWED_ROLES.includes(user.role)
      ? user.role
      : "user";

    // ---- Non-blocking write ----
    AuditLog.create({
      actorId: user._id,
      actorRole,
      action,
      entityType,
      entityId,
      metadata,
      reason,
    }).catch((err) => {
      // swallow error – audit must never break API
      console.error("[AuditLog] Write failed:", err.message);
    });
  } catch (err) {
    // absolute last safety net
    console.error("[AuditLog] Unexpected failure:", err.message);
  }
}

module.exports = { logAction };
