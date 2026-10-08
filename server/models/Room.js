const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true }, // e.g. "205"
    name: { type: String, required: true }, // e.g. "Garden Deluxe"
    type: {
      type: String,
      enum: ["Standard", "Deluxe", "Suite", "Presidential"],
      required: true,
    },
    pricePerNight: { type: Number, required: true }, // stored in PKR
    capacity: { type: Number, required: true }, // max guests
    sizeSqm: { type: Number, required: true },
    floor: { type: Number, required: true },
    amenities: { type: [String], default: ["Wi-Fi", "TV", "Mini Bar", "Safe"] },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },

    // Real-time room status for housekeeping coordination
    status: {
      type: String,
      enum: ["available", "occupied", "cleaning", "maintenance"],
      default: "available",
    },

    // Whether guests can currently reserve this room (e.g. "Taken" badge)
    isBookable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roomSchema.index({ type: 1, pricePerNight: 1 });

module.exports = mongoose.model("Room", roomSchema);
