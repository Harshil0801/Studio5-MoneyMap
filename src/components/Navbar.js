import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🔹 Listen for auth state changes (detects login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2 className="nav-logo">MoneyMap 💸</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <Link to="/dashboard">Dashboard</Link>}

        {/* 👇 Show Logout only if user is logged in */}
        {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
