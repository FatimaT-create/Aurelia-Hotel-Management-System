import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import RequirePermission from "./components/RequirePermission";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminHousekeeping from "./pages/admin/AdminHousekeeping";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminMaintenance from "./pages/admin/AdminMaintenance";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";
import Requests from "./pages/Requests";

function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin console — own layout, no public navbar/footer.
          AdminRoute is the outer gate (any staff role). Each child route
          is further wrapped in RequirePermission so a role without that
          specific feature gets redirected instead of hitting a 403 wall. */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
          index
          element={
            <RequirePermission feature="dashboard">
              <AdminDashboard />
            </RequirePermission>
          }
        />
        <Route
          path="rooms"
          element={
            <RequirePermission feature="rooms">
              <AdminRooms />
            </RequirePermission>
          }
        />
        <Route
          path="bookings"
          element={
            <RequirePermission feature="bookings">
              <AdminBookings />
            </RequirePermission>
          }
        />
        <Route
          path="staff"
          element={
            <RequirePermission feature="staff">
              <AdminStaff />
            </RequirePermission>
          }
        />
        <Route
          path="housekeeping"
          element={
            <RequirePermission feature="housekeeping">
              <AdminHousekeeping />
            </RequirePermission>
          }
        />
        <Route
          path="feedback"
          element={
            <RequirePermission feature="feedback">
              <AdminFeedback />
            </RequirePermission>
          }
        />
        <Route
          path="maintenance"
          element={
            <RequirePermission feature="maintenance">
              <AdminMaintenance />
            </RequirePermission>
          }
        />
        <Route
          path="services"
          element={
            <RequirePermission feature="services">
              <AdminServices />
            </RequirePermission>
          }
        />
        <Route
          path="settings"
          element={
            <RequirePermission feature="settings">
              <AdminSettings />
            </RequirePermission>
          }
        />
      </Route>

      {/* Guest-facing site */}
      <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
      <Route path="/rooms" element={<SiteLayout><Rooms /></SiteLayout>} />
      <Route path="/login" element={<SiteLayout><Login /></SiteLayout>} />
      <Route path="/register" element={<SiteLayout><Register /></SiteLayout>} />
      <Route
        path="/bookings"
        element={
          <SiteLayout>
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          </SiteLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <SiteLayout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </SiteLayout>
        }
      />
      <Route
        path="/requests"
        element={
          <SiteLayout>
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          </SiteLayout>
        }
      />
    </Routes>
  );
}