const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: "" },

    // Role-based access as per HMS requirements
    role: {
      type: String,
      enum: ["guest", "receptionist", "housekeeping", "manager", "admin"],
      default: "guest",
    },
    isActive: { type: Boolean, default: true },

    // Loyalty program (Gold / Silver / Platinum tiers)
    loyaltyId: { type: String, unique: true, sparse: true },
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    loyaltyPoints: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual initials, e.g. "James Harlow" -> "JH"
userSchema.virtual("initials").get(function () {
  return this.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

userSchema.set("toJSON", { virtuals: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
