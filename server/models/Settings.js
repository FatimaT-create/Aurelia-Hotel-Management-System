const mongoose = require("mongoose");

// Singleton document — there is only ever one Settings row in the collection.
const settingsSchema = new mongoose.Schema(
  {
    hotelName: { type: String, default: "Aurelia Grand Hotel" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    taxRatePercent: { type: Number, default: 5 },
    checkInTime: { type: String, default: "14:00" },
    checkOutTime: { type: String, default: "12:00" },
    cancellationPolicy: {
      type: String,
      default: "Cancellations are free up to 24 hours before check-in.",
    },
    currency: { type: String, default: "PKR" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
