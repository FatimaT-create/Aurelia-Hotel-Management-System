const express = require("express");
const ServiceRequest = require("../models/ServiceRequest");
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/auth");
const { notifyRoles } = require("../utils/notify");

const router = express.Router();

const LABELS = {
  room_service: "Room Service",
  wake_up_call: "Wake-up Call",
  transportation: "Transportation",
  housekeeping_extra: "Extra Housekeeping",
  other: "Other Request",
};

// @route  POST /api/services  (guest)
router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, type, details, scheduledFor } = req.body;
    if (!bookingId || !type) {
      return res.status(400).json({ message: "Booking and service type are required" });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const request = await ServiceRequest.create({
      user: req.user._id,
      booking: bookingId,
      type,
      details,
      scheduledFor,
    });

    notifyRoles(["admin", "manager", "receptionist"], {
      type: "service",
      message: `${req.user.name} requested ${LABELS[type] || type}`,
      link: "/admin/services",
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit request", error: err.message });
  }
});

// @route  GET /api/services/my
router.get("/my", protect, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user._id })
      .populate("booking")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// @route  GET /api/services  (staff — optional ?status= filter)
router.get("/", protect, authorize("admin", "manager", "receptionist"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await ServiceRequest.find(filter)
      .populate("booking")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// @route  PUT /api/services/:id/status  (staff)
router.put("/:id/status", protect, authorize("admin", "manager", "receptionist"), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "in_progress", "completed", "cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("booking")
      .populate("user", "name email phone");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: "Failed to update request", error: err.message });
  }
});

module.exports = router;
