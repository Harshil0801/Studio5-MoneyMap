import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import UserSummary from "./pages/UserSummary";
import AboutUs from "./pages/AboutUs";

// ✅ ADD THIS
import TransactionPdf from "./pages/TransactionPdf";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BudgetAdvisor from "./components/BudgetAdvisor";

import AdminDashboard from "./pages/AdminDashboard";
import UserDetails from "./pages/UserDetails";

import { auth } from "./firebase";

import "./App.css";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  // Hide Navbar on auth pages
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  // Admin checker (only 1 allowed)
  const isAdmin = auth.currentUser?.email === "moneymapadmin@gmail.com";

  const AdminProtectedRoute = ({ children }) => {
    if (!auth.currentUser) {
      return <Navigate to="/login" />;
    }
    if (!isAdmin) {
      return (
        <div style={{ padding: 30 }}>
          <h2>Access Denied</h2>
          <p>You are not authorised to access the admin dashboard.</p>
        </div>
      );
    }
    return children;
  };

  return (
    <>
      {/* Navbar visible everywhere except login/register/forgot */}
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/feedback" element={<Feedback />} />

        <Route path="/user-summary" element={<UserSummary />} />
        {/* ✅ ADD THIS ROUTE */}
        <Route path="/transaction-pdf" element={<TransactionPdf />} />

        <Route path="/about" element={<AboutUs />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/AdminDashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* Admin → User Details */}
        <Route
          path="/admin/user/:uid"
          element={
            <AdminProtectedRoute>
              <UserDetails />
            </AdminProtectedRoute>
          }
        />
      </Routes>

      {/* Floating assistant */}
      {!shouldHideNavbar && <BudgetAdvisor />}
    </>
  );
}

export default App;
