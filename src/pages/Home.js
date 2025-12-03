import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import "../styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalFeedback: 0,
  });

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email === "moneymapadmin@gmail.com") {
        await loadAdminStats();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load admin stats
  const loadAdminStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const feedbackSnap = await getDocs(collection(db, "feedback"));

      setAdminStats({
        totalUsers: usersSnap.size,
        totalFeedback: feedbackSnap.size,
      });
    } catch (err) {
      console.log("Admin stats error:", err);
    }
  };

  return (
    <div className="home">
      
      {/* ===================== ADMIN OVERVIEW ===================== */}
      {user?.email === "moneymapadmin@gmail.com" && (
        <section className="dashboard-intro" data-aos="fade-up">
          <h1>
            Welcome back, <span>Admin 👑</span>
          </h1>
          <p>Here’s your system overview:</p>

          <div className="summary-cards admin-cards">
            <div className="summary-card admin-card">
              <h3>Total Users</h3>
              <p>{adminStats.totalUsers}</p>
            </div>

            <div className="summary-card admin-card">
              <h3>Total Feedback</h3>
              <p>{adminStats.totalFeedback}</p>
            </div>
          </div>
        </section>
      )}

      {/* ===================== HERO (GUEST ONLY) ===================== */}
      {!user && (
        <section className="hero">
          <div className="hero-content" data-aos="fade-up">
            <h1>
              Simplify Your <span>Finances</span> with{" "}
              <span className="brand">MoneyMap 💸</span>
            </h1>
            <p>
              Track your income and expenses, set goals, and manage your money
              with ease.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn primary">Get Started</Link>
              <Link to="/login" className="btn secondary">Login</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================== FEATURES ===================== */}
      {!user && (
        <section className="features" id="features">
          <h2 data-aos="fade-up">
            Why People Love <span>MoneyMap</span>
          </h2>

          <div className="feature-grid">
            <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
              <i className="fas fa-wallet"></i>
              <h3>Track Spending</h3>
              <p>Automatically categorize and visualize your daily expenses.</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
              <i className="fas fa-chart-line"></i>
              <h3>Analyze Trends</h3>
              <p>Interactive charts show where your money goes.</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
              <i className="fas fa-bullseye"></i>
              <h3>Set Goals</h3>
              <p>Save smarter with clear goals and progress tracking.</p>
            </div>
          </div>
        </section>
      )}

      {/* ===================== CTA ===================== */}
      <section className="cta" data-aos="zoom-in">
        <h2>
          {user ? "Plan your financial future smarter" : "Start your journey to smarter finances today"}
        </h2>

        <Link
          to={user ? "/dashboard" : "/register"}
          className="btn primary cta-btn"
        >
          {user ? "Open Dashboard" : "Join MoneyMap Now"}
        </Link>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
        <p>© {new Date().getFullYear()} MoneyMap — Smart Budgeting Made Simple</p>
      </footer>
    </div>
  );
}

export default Home;
