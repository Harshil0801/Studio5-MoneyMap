import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import ForgotPassword from "./pages/ForgotPassword.js";
import Dashboard from "./pages/Dashboard.js";
import Navbar from "./components/Navbar.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import Contact from "./pages/Contact.js";
import Terms from "./pages/Terms.js";
import BudgetAdvisor from "./components/BudgetAdvisor.js";


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

  // Hide Navbar on these paths 👇
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {/* ✅ Show Navbar on most pages */}
      {!shouldHideNavbar && <Navbar />}

      {/* ✅ Define all routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* ✅ Floating AI Assistant (visible on all pages) */}
      {!shouldHideNavbar && <BudgetAdvisor />}
    </>
  );
}

export default App;
