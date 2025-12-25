const AuditLog = require('../models/AuditLog.model')

async function logAction({
  actorId,
  actorRole,
  action,
  entityType,
  entityId,
  metadata = {},
  reason = ""
}) {
  try {
    if (!actorId || !action || !entityType || !entityId) {
      console.warn("AuditLog skipped: missing required fields", {
        actorId,
        action,
        entityType,
        entityId,
      });
      return;
    }
    await AuditLog.create({
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      metadata,
      reason
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
}

module.exports = { logAction };
