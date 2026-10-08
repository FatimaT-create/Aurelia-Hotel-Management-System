const Notification = require("../models/Notification");

// Fire-and-forget: creates one notification doc visible to every role
// listed in `roles`. Never throws into the calling route — a failed
// notification shouldn't ever break a booking/checkout/etc.
async function notifyRoles(roles, { type, message, link }) {
  try {
    await Notification.create({ roles, type, message, link });
  } catch (err) {
    console.error("[notify] Failed to create notification:", err.message);
  }
}

module.exports = { notifyRoles };
