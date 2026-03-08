import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

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
import UpdateProfile from "./pages/UpdateProfile";
import HelpPage from "./pages/HelpPage";
import GenerateQR from "./pages/GenerateQR";
import ChangePassword from "./pages/ChangePassword";
import TransactionPdf from "./pages/TransactionPdf";
import AddTransaction from "./pages/AddTransaction";
import CurrencyConverterWidget from "./components/CurrencyConverterWidget";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BudgetAdvisor from "./components/BudgetAdvisor";

import AdminDashboard from "./pages/AdminDashboard";
import UserDetails from "./pages/UserDetails";

import "./App.css";

function App() {
  return <AppContent />;
}

function AppContent() {
  const location = useLocation();

  // Hide Navbar on login/register pages
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  // Get role from localStorage
  const role = localStorage.getItem("userRole");

  // RBAC Admin Route Protection
  const AdminProtectedRoute = ({ children }) => {

    if (!role) {
      return <Navigate to="/login" />;
    }

    if (role !== "admin") {
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
      {!shouldHideNavbar && <Navbar />}

      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/converter" element={<CurrencyConverterWidget />} />
        <Route path="/user-summary" element={<UserSummary />} />
        <Route path="/transaction-pdf" element={<TransactionPdf />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Protected Routes */}
        <Route
          path="/generate-qr"
          element={
            <ProtectedRoute>
              <GenerateQR />
            </ProtectedRoute>
          }
        />

        

        {/* Admin RBAC Routes */}
        <Route
          path="/AdminDashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/user/:uid"
          element={
            <AdminProtectedRoute>
              <UserDetails />
            </AdminProtectedRoute>
          }
        />

      </Routes>

      {!shouldHideNavbar && <BudgetAdvisor />}
    </>
  );
}

export default App;