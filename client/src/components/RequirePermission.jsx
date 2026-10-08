import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { can, ROLE_LANDING } from "../utils/permissions";

// Wrap an admin page with the feature it requires, e.g.
// <RequirePermission feature="rooms"><AdminRooms /></RequirePermission>
// If the logged-in role doesn't have that permission, send them to
// whichever admin page they DO have access to (never a dead end).
export default function RequirePermission({ feature, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!can(user.role, feature)) {
    return <Navigate to={ROLE_LANDING[user.role] || "/"} replace />;
  }
  return children;
}