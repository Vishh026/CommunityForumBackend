const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actorRole: {
    type: String,
    enum: ["user", "admin", "ai"],
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  entityType: {  
    type: String, 
    required: true,
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  reason: {
    type: String,
  },
  metadata: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

// Indexes for faster queries
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetType: 1 });
auditLogSchema.index({ createdAt: -1 });

// Compound index for common queries
auditLogSchema.index({ actorId: 1, action: 1, createdAt: -1 });

// Optional TTL: automatically delete logs older than 1 year
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 } // 1 year
);




const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
