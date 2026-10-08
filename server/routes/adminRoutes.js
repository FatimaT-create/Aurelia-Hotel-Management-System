const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/admin/dashboard  (admin/manager only)
// Returns headline stats for the admin dashboard.
router.get("/dashboard", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const [totalRooms, occupiedRooms, totalGuests, bookings] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: "occupied" }),
      User.countDocuments({ role: "guest" }),
      Booking.find().populate("room").populate("user", "name email"),
    ]);

    const activeBookings = bookings.filter((b) => b.status !== "cancelled");
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
    const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
    const completedCount = bookings.filter((b) => b.status === "completed").length;

    const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

    // Revenue grouped by room type
    const revenueByType = {};
    activeBookings.forEach((b) => {
      const type = b.room?.type || "Unknown";
      revenueByType[type] = (revenueByType[type] || 0) + b.totalAmount;
    });

    // Most recent bookings for an activity feed
    const recentBookings = [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    res.json({
      totalRooms,
      occupiedRooms,
      occupancyRate,
      totalGuests,
      totalBookings: bookings.length,
      totalRevenue,
      bookingsByStatus: { confirmed: confirmedCount, cancelled: cancelledCount, completed: completedCount },
      revenueByType,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard", error: err.message });
  }
});

module.exports = router;
