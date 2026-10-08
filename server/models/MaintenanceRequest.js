const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    issue: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["reported", "in_progress", "resolved"],
      default: "reported",
    },
    resolutionNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRequest", maintenanceSchema);
