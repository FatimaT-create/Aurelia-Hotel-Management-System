// Seeds the database with rooms, demo guest, staff accounts,
// and a demo booking for the Hotel Management System.

require("dotenv").config();

const connectDB = require("./config/db");
const Room = require("./models/Room");
const User = require("./models/User");
const Booking = require("./models/Booking");

// ============================================================
// ROOM SEED DATA
// ============================================================

const rooms = [
  {
    roomNumber: "101",
    name: "Classic Standard",
    type: "Standard",
    pricePerNight: 33600,
    capacity: 2,
    sizeSqm: 32,
    floor: 1,

    amenities: [
      "Wi-Fi",
      "TV",
      "Mini Bar",
      "Safe",
    ],

    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    ],

    status: "available",
    isBookable: true,
  },

  {
    roomNumber: "205",
    name: "Garden Deluxe",
    type: "Deluxe",
    pricePerNight: 61600,
    capacity: 2,
    sizeSqm: 42,
    floor: 2,

    amenities: [
      "Wi-Fi",
      "TV",
      "Mini Bar",
      "Safe",
      "Balcony",
      "Garden View",
    ],

    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    ],

    status: "available",
    isBookable: true,
  },

  {
    roomNumber: "312",
    name: "Panorama Deluxe",
    type: "Deluxe",
    pricePerNight: 72800,
    capacity: 3,
    sizeSqm: 48,
    floor: 3,

    amenities: [
      "Wi-Fi",
      "TV",
      "Mini Bar",
      "Safe",
      "City View",
    ],

    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    ],

    status: "occupied",
    isBookable: false,
  },

  {
    roomNumber: "408",
    name: "Executive Suite",
    type: "Suite",
    pricePerNight: 134400,
    capacity: 4,
    sizeSqm: 75,
    floor: 4,

    amenities: [
      "Wi-Fi",
      "TV",
      "Mini Bar",
      "Safe",
      "Living Room",
      "Bathtub",
    ],

    images: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
    ],

    status: "available",
    isBookable: true,
  },

  {
    roomNumber: "501",
    name: "Royal Suite",
    type: "Suite",
    pricePerNight: 190400,
    capacity: 4,
    sizeSqm: 95,
    floor: 5,

    amenities: [
      "Wi-Fi",
      "TV",
      "Mini Bar",
      "Safe",
      "Jacuzzi",
      "Butler Service",
    ],

    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
    ],

    status: "available",
    isBookable: true,
  },

  {
    roomNumber: "601",
    name: "Presidential Suite",
    type: "Presidential",
    pricePerNight: 336000,
    capacity: 6,
    sizeSqm: 180,
    floor: 6,

    amenities: [
      "Wi-Fi",
      "TV",
      "Mini Bar",
      "Safe",
      "Private Terrace",
      "Dining Room",
      "Butler Service",
    ],

    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],

    status: "available",
    isBookable: true,
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================

const seed = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("Clearing existing data...");

    await Promise.all([
      Room.deleteMany({}),
      User.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    // ========================================================
    // ROOMS
    // ========================================================

    console.log("Seeding rooms...");

    const createdRooms = await Room.insertMany(rooms);

    console.log(`${createdRooms.length} rooms created.`);

    // ========================================================
    // DEMO GUEST
    // ========================================================

    console.log("Seeding demo guest...");

    const guest = await User.create({
      name: "James Harlow",
      email: "james.harlow@email.com",
      password: "password123",
      phone: "+1 (212) 555-0174",
      role: "guest",
      loyaltyId: "AUR-GLD-00821",
      loyaltyTier: "Gold",
      loyaltyPoints: 2840,
      memberSince: new Date("2024-03-01"),
    });

    // ========================================================
    // ADMIN & STAFF ACCOUNTS
    // ========================================================

    console.log("Seeding admin & staff accounts...");

    await User.create([
      {
        name: "Aurelia Admin",
        email: "admin@aurelia.com",
        password: "admin123",
        role: "admin",
        loyaltyId: "AUR-STAFF-ADMIN",
      },

      {
        name: "Sofia Reyes",
        email: "manager@aurelia.com",
        password: "manager123",
        role: "manager",
        loyaltyId: "AUR-STAFF-MGR01",
      },

      {
        name: "Omar Chaudhry",
        email: "reception@aurelia.com",
        password: "reception123",
        role: "receptionist",
        loyaltyId: "AUR-STAFF-RCP01",
      },

      {
        name: "Bilal Ahmed",
        email: "housekeeping@aurelia.com",
        password: "housekeeping123",
        role: "housekeeping",
        loyaltyId: "AUR-STAFF-HSK01",
      },
    ]);

    // ========================================================
    // DEMO BOOKING
    // ========================================================

    console.log("Seeding an upcoming booking...");

    const executiveSuite = createdRooms.find(
      (room) => room.roomNumber === "408"
    );

    if (!executiveSuite) {
      throw new Error("Executive Suite (Room 408) was not found.");
    }

    await Booking.create({
      bookingCode: "BK-20248431",

      user: guest._id,

      room: executiveSuite._id,

      checkIn: new Date("2026-09-10"),

      checkOut: new Date("2026-09-14"),

      guests: 2,

      nights: 4,

      pricePerNight: executiveSuite.pricePerNight,

      totalAmount: 4 * executiveSuite.pricePerNight,

      status: "confirmed",
    });

    // ========================================================
    // COMPLETE
    // ========================================================

    console.log("");
    console.log("======================================");
    console.log("       SEED COMPLETE SUCCESSFULLY     ");
    console.log("======================================");
    console.log("");

    console.log("Guest login:");
    console.log("Email:    james.harlow@email.com");
    console.log("Password: password123");
    console.log("");

    console.log("Admin login:");
    console.log("Email:    admin@aurelia.com");
    console.log("Password: admin123");
    console.log("");

    console.log("Manager login:");
    console.log("Email:    manager@aurelia.com");
    console.log("Password: manager123");
    console.log("");

    console.log("Reception login:");
    console.log("Email:    reception@aurelia.com");
    console.log("Password: reception123");
    console.log("");

    console.log("Housekeeping login:");
    console.log("Email:    housekeeping@aurelia.com");
    console.log("Password: housekeeping123");
    console.log("");

    process.exit(0);

  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("           SEED FAILED                 ");
    console.error("======================================");
    console.error("");

    console.error(error);

    process.exit(1);
  }
};

// ============================================================
// RUN SEED
// ============================================================

seed();