import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isStaff } from "../utils/permissions";

// Outer gate: any staff role (admin/manager/receptionist/housekeeping)
// may enter the /admin area. Which pages they can actually see inside
// it is controlled per-route by <RequirePermission>.
export default function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff(user.role)) return <Navigate to="/" replace />;
  return children;
}