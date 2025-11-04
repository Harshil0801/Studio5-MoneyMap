import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home">
      <div className="home-container">
        <h1 className="home-title">Welcome to MoneyMap 💸</h1>
        <p className="home-subtitle">
          Track your income, expenses, and reach your financial goals effortlessly.
        </p>

        <div className="home-buttons">
          <Link to="/login" className="btn login-btn">Login</Link>
          <Link to="/register" className="btn register-btn">Get Started</Link>
        </div>
      </div>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} MoneyMap — Smart Budgeting Made Simple</p>
      </footer>
    </div>
  );
}

export default Home;
