const express = require("express");
const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/auth");
const { notifyRoles } = require("../utils/notify");

const router = express.Router();

// @route  POST /api/feedback  (guest — one review per booking)
router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const existing = await Feedback.findOne({ booking: bookingId });
    if (existing) {
      return res.status(409).json({ message: "You already left feedback for this stay" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      booking: bookingId,
      room: booking.room,
      rating,
      comment,
    });

    notifyRoles(["admin", "manager"], {
      type: "feedback",
      message: `${req.user.name} left a ${rating}-star review`,
      link: "/admin/feedback",
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit feedback", error: err.message });
  }
});

// @route  GET /api/feedback/my
router.get("/my", protect, async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feedback", error: err.message });
  }
});

// @route  GET /api/feedback  (staff — all reviews + average rating)
router.get("/", protect, authorize("admin", "manager", "receptionist"), async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("room")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    const avgRating = feedback.length
      ? Number((feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(2))
      : 0;
    res.json({ feedback, avgRating, count: feedback.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feedback", error: err.message });
  }
});

// @route  PUT /api/feedback/:id/respond  (admin/manager)
router.put("/:id/respond", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { staffResponse: req.body.staffResponse },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (err) {
    res.status(400).json({ message: "Failed to save response", error: err.message });
  }
});

module.exports = router;
