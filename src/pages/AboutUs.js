import React from "react";
import "../styles/AboutUs.css"; 

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Us</h1>

      <p className="about-intro">
        MoneyMap is a smart and intuitive financial management app designed to help individuals
        take control of their weekly, monthly, and yearly finances. Our app focuses on simplicity,
        accuracy, and a user-friendly experience that makes budgeting effortless.
      </p>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          Our mission is to empower users to develop healthy financial habits by providing clear tools
          to track spending, manage income, and improve savings. We want to make budgeting
          stress-free and accessible for everyone.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Offer</h2>
        <ul>
          <li>Add and categorize transactions</li>
          <li>Track income and expenses</li>
          <li>Interactive dashboards and visual summaries</li>
          <li>Weekly report generation using QR codes</li>
          <li>User-friendly and clean interface</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Why We Built MoneyMap</h2>
        <p>
          Most budgeting apps feel complicated or overwhelming. Our goal was to build something simple,
          fast, and accurate—an app that gives users confidence and control over their financial decisions.
        </p>
      </section>

      

      <section className="about-section">
        <h2>Our Vision</h2>
        <p>
          We envision MoneyMap becoming a complete personal finance companion—helping users budget,
          plan, visualize goals, and make smarter financial decisions with ease.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
