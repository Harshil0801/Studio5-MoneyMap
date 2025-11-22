import React, { useState } from "react";
import "../styles/Contact.css";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="contact-page">

      {/* ===== HEADER ===== */}
      <h1 className="contact-title">Contact Support</h1>
      <p className="contact-subtitle">
        Have questions about <b>MoneyMap</b>? We're here to help.
        <br />
        Fill out the form below or email us at{" "}
        <span className="highlight-email">support@moneymap.com</span>.
      </p>

      {/* ===== SUPPORT INFO CARDS ===== */}
      <div className="support-cards">
        <div className="support-card">
          <i className="fas fa-envelope"></i>
          <h4>Email Us</h4>
          <p>support@moneymap.com</p>
        </div>

        <div className="support-card">
          <i className="fas fa-phone-alt"></i>
          <h4>Call Support</h4>
          <p>+64 021 123 4567</p>
        </div>

        <div className="support-card">
          <i className="fas fa-clock"></i>
          <h4>Working Hours</h4>
          <p>Mon–Fri, 9AM–6PM</p>
        </div>
      </div>

      {/* ===== CATEGORY SHORTCUTS ===== */}
      <h2 className="section-heading">Support Categories</h2>
      <div className="categories">
        <div className="cat-box">💳 Billing Issues</div>
        <div className="cat-box">🔧 Technical Support</div>
        <div className="cat-box">👤 Account Help</div>
        <div className="cat-box">💬 General Inquiry</div>
      </div>

      {/* ===== FORM ===== */}
      <div className="contact-container">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Type your question..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit" className="btn primary">Send Message</button>
          </form>
        ) : (
          <div className="thank-you">
            <h3>✅ Message Sent!</h3>
            <p>Thank you for contacting us — our team will reply within 24 hours.</p>
          </div>
        )}
      </div>

      {/* ===== FAQ SECTION ===== */}
      <h2 className="section-heading">Frequently Asked Questions</h2>
      <div className="faq-list">
        <details>
          <summary>How do I reset my password?</summary>
          <p>Go to the login page → Forgot Password → Enter email.</p>
        </details>

        <details>
          <summary>Why is my balance incorrect?</summary>
          <p>Make sure all income/expenses are added correctly.</p>
        </details>

        <details>
          <summary>How do I delete my account?</summary>
          <p>Contact support with the subject: “Delete My Account”.</p>
        </details>

        <details>
          <summary>Is MoneyMap free?</summary>
          <p>Yes, MoneyMap is completely free for all users.</p>
        </details>
      </div>

    </div>
  );
}

export default Contact;
