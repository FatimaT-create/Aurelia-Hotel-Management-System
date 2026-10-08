// Central role → permission map. Keep this in sync with the backend's
// authorize() checks in server/middleware/auth.js and each route file —
// this file only controls what the UI *shows*; the API is the real gate.

export const PERMISSIONS = {
  admin: [
    "dashboard",
    "rooms",
    "bookings",
    "staff",
    "roleChange",
    "feedback",
    "maintenance",
    "services",
    "settings",
  ],
  manager: ["dashboard", "rooms", "bookings", "staff", "feedback", "maintenance", "services"],
  receptionist: ["bookings", "feedback", "services"],
  housekeeping: ["housekeeping", "maintenance"],
};

// Where each role lands when they open the admin console.
export const ROLE_LANDING = {
  admin: "/admin",
  manager: "/admin",
  receptionist: "/admin/bookings",
  housekeeping: "/admin/housekeeping",
};

export function can(role, feature) {
  return PERMISSIONS[role]?.includes(feature) ?? false;
}

export function isStaff(role) {
  return Object.keys(PERMISSIONS).includes(role);
}