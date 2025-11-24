import React from "react";
import "../styles/Terms.css";

function Terms() {
  return (
    <div className="terms-page">

      <div className="terms-container">
        <h1>Terms & Conditions</h1>
        <p className="last-updated">Last Updated: November 2025</p>

        <div className="divider"></div>

        <h2>📘 1. Acceptance of Terms</h2>
        <p>
          By accessing or using MoneyMap, you agree to comply with these terms and all
          applicable laws and regulations.
        </p>

        <h2>⚙️ 2. Use of Service</h2>
        <p>
          MoneyMap helps users manage finances, track expenses, and set budgeting goals.
          You agree not to misuse or disrupt the platform.
        </p>

        <h2>🔐 3. Privacy</h2>
        <p>
          Any personal information you provide will be handled according to our Privacy Policy.
        </p>

        <h2>👤 4. Account Responsibilities</h2>
        <p>
          You are responsible for keeping your login credentials secure and for all activities
          under your account.
        </p>

        <h2>⚠️ 5. Limitation of Liability</h2>
        <p>
          MoneyMap is provided “as is.” We are not liable for financial losses due to data errors
          or calculations within the app.
        </p>

        <h2>🔄 6. Updates to Terms</h2>
        <p>
          We may update these terms periodically. Continued use of the platform means acceptance
          of the revised terms.
        </p>

        <div className="support-box">
          <p>Have questions about these terms?</p>
          <a href="/contact" className="support-btn">Contact Support</a>
        </div>

      </div>
    </div>
  );
}

export default Terms;
