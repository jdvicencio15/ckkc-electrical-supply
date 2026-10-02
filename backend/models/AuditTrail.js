const mongoose = require("mongoose");

const auditTrailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    userRole: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "STATUS_CHANGE",
        "LOGIN",
        "LOGOUT",
        "PASSWORD_RESET",
        "POST",
        "RELEASE",
        "CANCEL",
        "RECEIVE",
        "PAYMENT",
        "EXPORT",
      ],
      index: true,
    },

    entity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    documentNumber: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },

    userAgent: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Audit Trail query indexes
auditTrailSchema.index({ createdAt: -1 });
auditTrailSchema.index({
  entity: 1,
  entityId: 1,
  createdAt: -1,
});
auditTrailSchema.index({
  userId: 1,
  createdAt: -1,
});
auditTrailSchema.index({
  action: 1,
  createdAt: -1,
});

module.exports = mongoose.model("AuditTrail", auditTrailSchema);
