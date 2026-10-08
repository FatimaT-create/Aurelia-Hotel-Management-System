const express = require("express");
const Room = require("../models/Room");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/rooms?type=Deluxe&sort=price_asc&guests=2
router.get("/", async (req, res) => {
  try {
    const { type, sort, guests } = req.query;
    const filter = {};
    if (type && type !== "All") filter.type = type;
    if (guests) filter.capacity = { $gte: Number(guests) };

    let sortOption = { pricePerNight: 1 };
    if (sort === "price_desc") sortOption = { pricePerNight: -1 };
    if (sort === "price_asc") sortOption = { pricePerNight: 1 };

    const rooms = await Room.find(filter).sort(sortOption);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
});

// @route  GET /api/rooms/:id
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch room", error: err.message });
  }
});

// @route  POST /api/rooms  (admin/manager only)
router.post("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: "Failed to create room", error: err.message });
  }
});

// @route  PUT /api/rooms/:id  (admin/manager only)
router.put("/:id", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: "Failed to update room", error: err.message });
  }
});

// @route  PUT /api/rooms/:id/status  (housekeeping/manager) e.g. cleaning -> available
router.put("/:id/status", protect, authorize("housekeeping", "manager", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: "Failed to update room status", error: err.message });
  }
});

// @route  DELETE /api/rooms/:id  (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
});

module.exports = router;
