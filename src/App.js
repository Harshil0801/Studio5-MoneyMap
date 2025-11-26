import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
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


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BudgetAdvisor from "./components/BudgetAdvisor";

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
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/user-summary" element={<UserSummary />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* ✅ Floating AI Assistant (visible on all pages except auth) */}
      {!shouldHideNavbar && <BudgetAdvisor />}
    </>
  );
}

export default App;
