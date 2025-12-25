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

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
