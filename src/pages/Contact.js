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
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Support</h1>
        <p>
          Have questions about <b>MoneyMap</b> before signing up? We're here to help.
          Fill out the form below or email us at <b>support@moneymap.com</b>.
        </p>

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
            <button type="submit" className="btn primary">
              Send Message
            </button>
          </form>
        ) : (
          <div className="thank-you">
            <h3>✅ Message Sent!</h3>
            <p>Thank you for contacting us — our team will reply within 24 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contact;
