// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadSummary(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // ======================== FIRESTORE SUMMARY LOGIC ========================
  const loadSummary = async (uid) => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    try {
      const q = query(collection(db, "transactions"), where("uid", "==", uid));
      const snap = await getDocs(q);

      snap.forEach((doc) => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);

        if (data.type === "income") incomeTotal += amount;
        if (data.type === "expense") expenseTotal += amount;
      });

      const balance = incomeTotal - expenseTotal;

      setSummary({
        income: incomeTotal,
        expenses: expenseTotal,
        balance,
      });
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };
  // =====================================================================

  // ============ VIEW FOR LOGGED-IN USERS (with guest content below) ============
  if (user) {
    return (
      <div className="home">

        {/* DASHBOARD SUMMARY */}
        <section className="dashboard-intro" data-aos="fade-up">
          <h1>
            Welcome back 👋
          </h1>

          <div className="summary-cards">
            <div className="summary-card income">
              <h3>Total Income</h3>
              <p>${summary.income.toFixed(2)}</p>
            </div>
            <div className="summary-card expenses">
              <h3>Total Expenses</h3>
              <p>${summary.expenses.toFixed(2)}</p>
            </div>
            <div className="summary-card balance">
              <h3>Remaining Balance</h3>
              <p>${summary.balance.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* ================= GUEST HOMEPAGE CONTENT ================= */}

        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-content" data-aos="fade-up">
            <h1>
              Simplify Your <span>Finances</span> with{" "}
              <span className="brand">MoneyMap 💸</span>
            </h1>
            <p>
              Track your income and expenses, set goals, and manage your money with ease.
            </p>
          </div>
        </section>

        {/* FEATURES SECTION */}
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
              <p>Interactive charts give insights into where your money goes.</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
              <i className="fas fa-bullseye"></i>
              <h3>Set Goals</h3>
              <p>Save smarter with clear financial goals and progress tracking.</p>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta" data-aos="zoom-in">
          <h2>Plan your financial future smarter</h2>
          <Link to="/dashboard" className="btn primary cta-btn">
            Open Dashboard
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <p>© {new Date().getFullYear()} MoneyMap — Smart Budgeting Made Simple</p>
        </footer>
      </div>
    );
  }

  // ============ VIEW FOR GUEST USERS ============
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content" data-aos="fade-up">
          <h1>
            Simplify Your <span>Finances</span> with{" "}
            <span className="brand">MoneyMap 💸</span>
          </h1>
          <p>
            Track your income and expenses, set goals, and manage your money with ease.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn primary">
              Get Started
            </Link>
            <Link to="/login" className="btn secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
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
            <p>Interactive charts give insights into where your money goes.</p>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <i className="fas fa-bullseye"></i>
            <h3>Set Goals</h3>
            <p>Save smarter with clear financial goals and progress tracking.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta" data-aos="zoom-in">
        <h2>Start your journey to smarter finances today</h2>
        <Link to="/register" className="btn primary cta-btn">
          Join MoneyMap Now
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <p>© {new Date().getFullYear()} MoneyMap — Smart Budgeting Made Simple</p>
      </footer>
    </div>
  );
}

export default Home;
