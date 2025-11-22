import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="nav-logo">MoneyMap 💸</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {/* Only show when NOT logged in */}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

       {/* Show different dashboard link for admin */}
{user && auth.currentUser?.email !== "moneymapadmin@gmail.com" && (
  <Link to="/dashboard">Dashboard</Link>
)}

{user && auth.currentUser?.email === "moneymapadmin@gmail.com" && (
  <Link to="/AdminDashboard">Dashboard</Link>
)}


        <Link to="/contact">Contact</Link>
        <Link to="/terms">Terms & Conditions</Link>

        {/* Logout shown only when logged in */}
        {user && (
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
              marginLeft: "10px",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
