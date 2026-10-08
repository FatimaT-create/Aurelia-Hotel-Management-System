const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/auth");
const { nextTierInfo, TIERS } = require("../utils/loyalty");

const router = express.Router();

// @route  GET /api/users  (admin only) -> list all users, optional ?role= filter
router.get("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// @route  PUT /api/users/:id/role  (admin only) -> promote/demote a user
router.put("/:id/role", protect, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["guest", "receptionist", "housekeeping", "manager", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Failed to update role", error: err.message });
  }
});

// @route  PUT /api/users/:id/status  (admin only) -> activate/deactivate a user
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Failed to update status", error: err.message });
  }
});

// @route  GET /api/users/me  -> full guest profile incl. loyalty status
router.get("/me", protect, async (req, res) => {
  try {
    const user = req.user;
    const bookings = await Booking.find({ user: user._id, status: { $ne: "cancelled" } });

    const stays = bookings.length;
    const nights = bookings.reduce((sum, b) => sum + b.nights, 0);
    const earned = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const { nextTier, pointsToNext } = nextTierInfo(user.loyaltyPoints);
    const currentTierMin = TIERS.find((t) => t.name === user.loyaltyTier)?.min || 0;

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      initials: user.initials,
      loyaltyId: user.loyaltyId,
      loyaltyTier: user.loyaltyTier,
      loyaltyPoints: user.loyaltyPoints,
      memberSince: user.memberSince,
      nextTier,
      pointsToNext,
      currentTierMin,
      loyaltyStats: { stays, nights, earned },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

// @route  PUT /api/users/me  -> edit profile
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...(name && { name }), ...(phone && { phone }) } },
      { new: true, runValidators: true }
    );
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      initials: user.initials,
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to update profile", error: err.message });
  }
});

module.exports = router;
