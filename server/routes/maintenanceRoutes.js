const express = require("express");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const { protect, authorize } = require("../middleware/auth");
const { notifyRoles } = require("../utils/notify");

const router = express.Router();

// @route  POST /api/maintenance  (any logged-in user — guest or staff)
router.post("/", protect, async (req, res) => {
  try {
    const { roomId, issue, priority } = req.body;
    if (!roomId || !issue) {
      return res.status(400).json({ message: "Room and issue description are required" });
    }

    const request = await MaintenanceRequest.create({
      reportedBy: req.user._id,
      room: roomId,
      issue,
      priority: priority || "medium",
    });

    notifyRoles(["admin", "manager", "housekeeping"], {
      type: "maintenance",
      message: `New maintenance issue reported: ${issue.slice(0, 60)}`,
      link: "/admin/maintenance",
    });

    const populated = await request.populate("room");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to report issue", error: err.message });
  }
});

// @route  GET /api/maintenance/my
router.get("/my", protect, async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ reportedBy: req.user._id })
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// @route  GET /api/maintenance  (staff — optional ?status= filter)
router.get("/", protect, authorize("admin", "manager", "housekeeping"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await MaintenanceRequest.find(filter)
      .populate("room")
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// @route  PUT /api/maintenance/:id/status  (staff)
router.put("/:id/status", protect, authorize("admin", "manager", "housekeeping"), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const valid = ["reported", "in_progress", "resolved"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { status, ...(resolutionNotes !== undefined && { resolutionNotes }) },
      { new: true }
    ).populate("room");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: "Failed to update request", error: err.message });
  }
});

module.exports = router;
