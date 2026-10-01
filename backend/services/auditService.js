const AuditTrail = require("../models/AuditTrail");

const SENSITIVE_FIELDS = [
  "password",
  "resetToken",
  "resetTokenExpire",
  "token",
  "accessToken",
  "refreshToken",
];

const sanitizeSnapshot = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  // Convert Mongoose documents/subdocuments to plain objects
  let plainData;

  if (typeof data?.toObject === "function") {
    plainData = data.toObject({
      depopulate: true,
      flattenMaps: true,
      minimize: false,
    });
  } else if (Array.isArray(data)) {
    plainData = data.map((item) =>
      typeof item?.toObject === "function"
        ? item.toObject({
            depopulate: true,
            flattenMaps: true,
            minimize: false,
          })
        : item
    );
  } else if (typeof data === "object") {
    plainData = { ...data };
  } else {
    return data;
  }

  const sanitize = (value, seen = new WeakSet()) => {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== "object") {
      return value;
    }

    // Convert MongoDB ObjectId to a readable string
    if (value?._bsontype === "ObjectId") {
      return value.toString();
    }

    // Convert BSON ObjectID variants if encountered
    if (
      value?._bsontype === "ObjectID" &&
      typeof value.toString === "function"
    ) {
      return value.toString();
    }

    // Prevent circular references
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, seen));
    }

    const result = {};

    Object.keys(value).forEach((key) => {
      // Never expose sensitive fields in audit snapshots
      if (SENSITIVE_FIELDS.includes(key)) {
        return;
      }

      result[key] = sanitize(value[key], seen);
    });

    return result;
  };

  return sanitize(plainData);
};

const createAuditLog = async ({
  req,
  session = null,
  action,
  entity,
  entityId = null,
  documentNumber = null,
  description,
  before = null,
  after = null,
  metadata = null,
}) => {
  if (!req?.user) {
    throw new Error("Audit log requires authenticated user");
  }

  const user = req.user;

  const auditData = {
    userId: user._id,

    userName: `${user.firstName} ${user.lastName}`.trim(),

    userEmail: user.email,

    userRole: user.role,

    action,
    entity,
    entityId,
    documentNumber,
    description,

    before: sanitizeSnapshot(before),
    after: sanitizeSnapshot(after),
    metadata: sanitizeSnapshot(metadata),

    ipAddress:
      req.headers["x-forwarded-for"]
        ?.split(",")[0]
        ?.trim() ||
      req.ip ||
      null,

    userAgent: req.get("user-agent") || null,
  };

  if (session) {
    const [auditLog] = await AuditTrail.create([auditData], { session });

    return auditLog;
  }

  return AuditTrail.create(auditData);
};

module.exports = {
  createAuditLog,
  sanitizeSnapshot,
};