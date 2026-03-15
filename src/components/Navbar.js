import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openLang, setOpenLang] = useState(false);

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

const changeLanguage = (lang) => {
  const googleTranslateCookie = `/auto/${lang}`;
  
  document.cookie = `googtrans=${googleTranslateCookie};path=/`;
  document.cookie = `googtrans=${googleTranslateCookie};domain=${window.location.hostname};path=/`;

  window.location.reload();

  setOpenLang(false);
};



  return (
    <nav className="navbar">

      <h2 className="nav-logo">MoneyMap 💸</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

        {user && auth.currentUser?.email !== "moneymapadmin@gmail.com" && (
          <Link to="/dashboard">Dashboard</Link>
        )}

        {user && auth.currentUser?.email === "moneymapadmin@gmail.com" && (
          <Link to="/AdminDashboard">Dashboard</Link>
        )}

        <Link to="/contact">Contact</Link>
        <Link to="/help">Help</Link>
        <Link to="/terms">Terms</Link>

        {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}

        <div className="language-container">
          <button
            className="language-btn"
            onClick={() => setOpenLang(!openLang)}
          >
            🌐 Language
          </button>

          {openLang && (
            <div className="language-menu">
              <div onClick={() => changeLanguage("en")}>English</div>
              <div onClick={() => changeLanguage("mi")}>Māori</div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

    </nav>
  );
}

export default Navbar;