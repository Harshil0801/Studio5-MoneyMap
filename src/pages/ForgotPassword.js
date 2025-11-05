import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (error) {
      alert("❌ " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        {!emailSent ? (
          <>
            <h2 className="forgot-title">Reset Your Password</h2>
            <p className="forgot-subtitle">
              Enter your registered email and we’ll send you a reset link.
            </p>

            <form onSubmit={handleReset} className="forgot-form">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="forgot-footer">
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Email Sent!</h2>
            <p className="success-text">
              A password reset link has been sent to <strong>{email}</strong>.
              Please check your inbox or spam folder.
            </p>
            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
