import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openLang, setOpenLang] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    navigate("/login");
  };

 feature/mobile-responsive-ui
  const changeLanguage = (lang) => {
    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo");

const changeLanguage = (lang) => {
  const googleTranslateCookie = `/auto/${lang}`;
  
  document.cookie = `googtrans=${googleTranslateCookie};path=/`;
  document.cookie = `googtrans=${googleTranslateCookie};domain=${window.location.hostname};path=/`;

  window.location.reload();

  setOpenLang(false);
};

 feature/mobile-responsive-ui
    setOpenLang(false);
    setMenuOpen(false);
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setOpenLang(false);
  };


  return (
    <nav className="navbar">
      <h2 className="nav-logo">MoneyMap 💸</h2>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
      >
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenus}>Home</Link>

        {!user && <Link to="/login" onClick={closeMenus}>Login</Link>}
        {!user && <Link to="/register" onClick={closeMenus}>Register</Link>}

        {user && auth.currentUser?.email !== "moneymapadmin@gmail.com" && (
          <Link to="/dashboard" onClick={closeMenus}>Dashboard</Link>
        )}

        {user && auth.currentUser?.email === "moneymapadmin@gmail.com" && (
          <Link to="/AdminDashboard" onClick={closeMenus}>Dashboard</Link>
        )}

        <Link to="/contact" onClick={closeMenus}>Contact</Link>
        <Link to="/help" onClick={closeMenus}>Help</Link>
        <Link to="/terms" onClick={closeMenus}>Terms</Link>

        {user && (
          <button onClick={handleLogout} className="logout-btn" type="button">
            Logout
          </button>
        )}

        <div className="language-container">
          <button
            className="language-btn"
            onClick={() => setOpenLang(!openLang)}
            type="button"
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

      <div id="google_translate_element" style={{ display: "none" }}></div>
    </nav>
  );
}

export default Navbar;