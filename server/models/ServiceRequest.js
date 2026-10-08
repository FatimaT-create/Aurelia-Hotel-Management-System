const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    type: {
      type: String,
      enum: ["room_service", "wake_up_call", "transportation", "housekeeping_extra", "other"],
      required: true,
    },
    details: { type: String, default: "", trim: true },
    scheduledFor: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
