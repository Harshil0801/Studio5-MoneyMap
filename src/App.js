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
 feature/chatbot-enhancements
import GenerateQR from "./pages/GenerateQR";
 
import ChangePassword from "./pages/ChangePassword";

 
import TransactionPdf from "./pages/TransactionPdf";

import AddTransaction from "./pages/AddTransaction"; // ✅ EXISTS in pages
import CurrencyConverterWidget from "./components/CurrencyConverterWidget"; // ✅ EXISTS in components

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BudgetAdvisor from "./components/BudgetAdvisor";

import AdminDashboard from "./pages/AdminDashboard";
import UserDetails from "./pages/UserDetails";

import { auth } from "./firebase";

import "./App.css";

function App() {
  return <AppContent />;
}

function AppContent() {
  const location = useLocation();

 feature/chatbot-enhancements
  // Hide Navbar + chatbot on auth pages
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  // Admin checker
 
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);


 
  const isAdmin = auth.currentUser?.email === "moneymapadmin@gmail.com";

  const AdminProtectedRoute = ({ children }) => {
    if (!auth.currentUser) return <Navigate to="/login" />;

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
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/feedback" element={<Feedback />} />
  feature/chatbot-enhancements
 

        <Route path="/user-summary" element={<UserSummary />} />
         feature/qr-transaction-pdf
        
        <Route path="/transaction-pdf" element={<TransactionPdf />} />
 
        <Route path="/about" element={<AboutUs />} />

        {/* Update profile (keep as you had) */}
        <Route path="/update-profile" element={<UpdateProfile />} />
  feature/chatbot-enhancements

        {/* ✅ Add Transaction page */}
        <Route path="/add-transaction" element={<AddTransaction />} />
 
        <Route path="/change-password" element={<ChangePassword />} />
 

        {/* ✅ Multi-Currency page */}
        <Route path="/converter" element={<CurrencyConverterWidget />} />

        {/* ✅ QR page (Protected) */}
        <Route
          path="/generate-qr"
          element={
            <ProtectedRoute>
              <GenerateQR />
            </ProtectedRoute>
          }
        />

        {/* Public summary */}
        <Route path="/user-summary" element={<UserSummary />} />

        {/* PDF export */}
        <Route path="/transaction-pdf" element={<TransactionPdf />} />

        {/* Protected dashboard */}
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

        
        <Route
          path="/admin/user/:uid"
          element={
            <AdminProtectedRoute>
              <UserDetails />
            </AdminProtectedRoute>
          }
        />
      </Routes>

  feature/chatbot-enhancements
 
 
      {!shouldHideNavbar && <BudgetAdvisor />}
    </>
  );
}

export default App;