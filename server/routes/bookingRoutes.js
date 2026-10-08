const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { pointsEarned, tierForPoints } = require("../utils/loyalty");
const { notifyRoles } = require("../utils/notify");
const { sendBookingConfirmation, sendCancellationEmail, sendInvoiceEmail } = require("../utils/email");
const Settings = require("../models/Settings");

const router = express.Router();

const genBookingCode = () =>
  `BK-${new Date().getFullYear()}${String(Math.floor(1000 + Math.random() * 8999))}`;

const nightsBetween = (checkIn, checkOut) =>
  Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

// @route  POST /api/bookings  (guest creates a reservation)
router.post("/", protect, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.isBookable || room.status !== "available") {
      return res.status(400).json({ message: "This room is not available for booking" });
    }

    const nights = nightsBetween(checkIn, checkOut);
    if (nights <= 0) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }
    if (guests > room.capacity) {
      return res.status(400).json({ message: `This room fits up to ${room.capacity} guests` });
    }

    // Prevent overlapping confirmed bookings on the same room
    const overlap = await Booking.findOne({
      room: roomId,
      status: "confirmed",
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });
    if (overlap) {
      return res.status(409).json({ message: "Room is already booked for the selected dates" });
    }

    const totalAmount = nights * room.pricePerNight;

    const booking = await Booking.create({
      bookingCode: genBookingCode(),
      user: req.user._id,
      room: room._id,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight: room.pricePerNight,
      totalAmount,
    });

    // Award loyalty points and update tier
    const user = await User.findById(req.user._id);
    user.loyaltyPoints += pointsEarned(totalAmount);
    user.loyaltyTier = tierForPoints(user.loyaltyPoints);
    await user.save();

    const populated = await booking.populate("room");

    notifyRoles(["admin", "manager", "receptionist"], {
      type: "booking",
      message: `New booking ${booking.bookingCode} for ${populated.room.name}`,
      link: "/admin/bookings",
    });
    sendBookingConfirmation(user, populated).catch(() => {});

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
});

// @route  GET /api/bookings/my  (current guest's bookings, split upcoming/past)
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room")
      .sort({ checkIn: -1 });

    const now = new Date();
    const upcoming = bookings.filter(
      (b) => b.status === "confirmed" && new Date(b.checkOut) >= now
    );
    const past = bookings.filter(
      (b) => b.status !== "confirmed" || new Date(b.checkOut) < now
    );

    const totalStays = bookings.filter((b) => b.status !== "cancelled").length;
    const nightsStayed = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.nights, 0);
    const totalSpent = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      stats: {
        totalStays,
        upcomingCount: upcoming.length,
        nightsStayed,
        totalSpent,
      },
      upcoming,
      past,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
});

// @route  PUT /api/bookings/:id  (modify dates)
router.put("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be modified" });
    }

    const { checkIn, checkOut } = req.body;
    const nights = nightsBetween(checkIn || booking.checkIn, checkOut || booking.checkOut);
    if (nights <= 0) return res.status(400).json({ message: "Check-out must be after check-in" });

    booking.checkIn = checkIn || booking.checkIn;
    booking.checkOut = checkOut || booking.checkOut;
    booking.nights = nights;
    booking.totalAmount = nights * booking.pricePerNight;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to modify booking", error: err.message });
  }
});

// @route  PUT /api/bookings/:id/cancel
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    notifyRoles(["admin", "manager", "receptionist"], {
      type: "cancellation",
      message: `Booking ${booking.bookingCode} was cancelled by the guest`,
      link: "/admin/bookings",
    });
    sendCancellationEmail(req.user, booking).catch(() => {});

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel booking", error: err.message });
  }
});

// @route  POST /api/bookings/:id/email-invoice  (guest — emails their own invoice)
router.post("/:id/email-invoice", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const settings = await Settings.findOne();
    const result = await sendInvoiceEmail(req.user, booking, settings?.taxRatePercent || 0);

    res.json({
      message: result.sent
        ? "Invoice emailed successfully."
        : "Email isn't configured on the server yet (see server/.env) — check the server console for the invoice.",
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to email invoice", error: err.message });
  }
});

// @route  GET /api/bookings  (staff/admin - view all bookings, optional ?status= filter)
router.get("/", protect, authorize("receptionist", "manager", "admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const bookings = await Booking.find(filter)
      .populate("room")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
});

// @route  PUT /api/bookings/:id/admin-status  (staff/admin - override any booking's status)
router.put(
  "/:id/admin-status",
  protect,
  authorize("receptionist", "manager", "admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
        .populate("room")
        .populate("user", "name email");
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: "Failed to update booking", error: err.message });
    }
  }
);

module.exports = router;
