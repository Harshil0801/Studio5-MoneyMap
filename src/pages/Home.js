// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import "../styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
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

  const loadSummary = async (uid) => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    const incomeSnap = await getDocs(collection(db, "users", uid, "income"));
    incomeSnap.forEach((doc) => {
      incomeTotal += parseFloat(doc.data().amount || 0);
    });

    const expenseSnap = await getDocs(collection(db, "users", uid, "expenses"));
    expenseSnap.forEach((doc) => {
      expenseTotal += parseFloat(doc.data().amount || 0);
    });

    const balance = incomeTotal - expenseTotal;
    setSummary({ income: incomeTotal, expenses: expenseTotal, balance });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ======== VIEW FOR LOGGED-IN USER ========
  if (user) {
    return (
      <div className="home logged-home">
        <section className="dashboard-intro" data-aos="fade-up">
          <h1>
            Welcome back, <span>{user.displayName || "User"}</span> 👋
          </h1>
          <p>Here’s your financial summary:</p>

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

          <div className="logged-buttons">
            <button onClick={() => navigate("/dashboard")} className="btn primary">
              Go to Dashboard
            </button>
            <button onClick={handleLogout} className="btn secondary">
              Logout
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ======== VIEW FOR GUEST USERS ========
  return (
    <div className="home">
      {/* ---------- HERO SECTION ---------- */}
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

      {/* ---------- FEATURES ---------- */}
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
            <p>Interactive graphs give insights into where your money really goes.</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <i className="fas fa-bullseye"></i>
            <h3>Set Goals</h3>
            <p>Save smarter with clear financial goals and progress tracking.</p>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="how-it-works">
        <h2 data-aos="fade-up">How It Works</h2>
        <div className="steps">
          <div className="step" data-aos="zoom-in" data-aos-delay="100">
            <span>1</span>
            <h4>Create an Account</h4>
            <p>Sign up in seconds to start managing your finances.</p>
          </div>
          <div className="step" data-aos="zoom-in" data-aos-delay="200">
            <span>2</span>
            <h4>Add Transactions</h4>
            <p>Record your income and expenses effortlessly.</p>
          </div>
          <div className="step" data-aos="zoom-in" data-aos-delay="300">
            <span>3</span>
            <h4>Review & Improve</h4>
            <p>See reports and plan better for your future goals.</p>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="testimonials">
        <h2 data-aos="fade-up">What Our Users Say</h2>
        <div className="testimonial-list">
          <div className="testimonial" data-aos="fade-right">
            <p>“MoneyMap helped me save $1,000 in 2 months!”</p>
            <h5>- Sarah W.</h5>
          </div>
          <div className="testimonial" data-aos="fade-up">
            <p>“Clean interface + powerful insights = game changer.”</p>
            <h5>- Jason L.</h5>
          </div>
          <div className="testimonial" data-aos="fade-left">
            <p>“Now budgeting feels easy and even fun!”</p>
            <h5>- Priya K.</h5>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta" data-aos="zoom-in">
        <h2>Start your journey to smarter finances today</h2>
        <Link to="/register" className="btn primary cta-btn">
          Join MoneyMap Now
        </Link>
      </section>

      {/* ---------- FOOTER ---------- */}
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
