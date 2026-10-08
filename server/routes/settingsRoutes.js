const express = require("express");
const Settings = require("../models/Settings");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

async function getSingleton() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}

// @route  GET /api/settings  (public — guests see policies/tax/check-in times too)
router.get("/", async (req, res) => {
  try {
    const settings = await getSingleton();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load settings", error: err.message });
  }
});

// @route  PUT /api/settings  (admin only)
router.put("/", protect, authorize("admin"), async (req, res) => {
  try {
    const settings = await getSingleton();
    const editable = [
      "hotelName",
      "contactEmail",
      "contactPhone",
      "taxRatePercent",
      "checkInTime",
      "checkOutTime",
      "cancellationPolicy",
      "currency",
    ];
    editable.forEach((key) => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: "Failed to update settings", error: err.message });
  }
});

module.exports = router;
