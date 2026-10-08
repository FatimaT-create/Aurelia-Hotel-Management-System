const mongoose = require("mongoose");

// A notification is written once and shown to every role listed in
// `roles` (e.g. ["admin","manager"]). Any staff member marking it read
// marks it read for that whole role group — simple, matches the
// "System Notifications" requirement without needing per-user inboxes.
const notificationSchema = new mongoose.Schema(
  {
    roles: { type: [String], required: true },
    type: {
      type: String,
      enum: ["booking", "cancellation", "maintenance", "service", "feedback", "system"],
      default: "system",
    },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
