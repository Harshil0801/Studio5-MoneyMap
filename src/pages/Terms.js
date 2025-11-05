import React from "react";
import "../styles/Terms.css";

function Terms() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms & Conditions</h1>
        <p>Welcome to <b>MoneyMap</b>. Please read these terms and conditions carefully before using our website.</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using MoneyMap, you agree to comply with these terms and all applicable laws and regulations.</p>
        </section>

        <section>
          <h2>2. Use of Service</h2>
          <p>MoneyMap is designed to help users manage personal finances, track expenses, and set budgeting goals. You agree not to misuse or disrupt the platform.</p>
        </section>

        <section>
          <h2>3. Privacy</h2>
          <p>We respect your privacy. Any personal information you provide will be handled according to our Privacy Policy.</p>
        </section>

        <section>
          <h2>4. Account Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>MoneyMap is provided “as is”. We are not liable for any financial losses resulting from reliance on data or calculations within the app.</p>
        </section>

        <section>
          <h2>6. Updates to Terms</h2>
          <p>We may update these terms periodically. Continued use of the platform implies acceptance of any revised terms.</p>
        </section>

        <footer className="terms-footer">
          <p>Last updated: November 2025</p>
        </footer>
      </div>
    </div>
  );
}

export default Terms;
