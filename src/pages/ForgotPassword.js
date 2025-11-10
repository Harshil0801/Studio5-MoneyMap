import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
  feature/ai-assistant
import { auth } from "../firebase.js"; // ✅ Added .js extension
 
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
  main
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  feature/ai-assistant
  const [message, setMessage] = useState("");
 
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  main

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
  feature/ai-assistant
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent! Please check your inbox.");
      setEmail(""); // Clear the input field
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case "auth/user-not-found":
          setMessage("⚠️ No account found with that email.");
          break;
        case "auth/invalid-email":
          setMessage("❌ Please enter a valid email address.");
          break;
        default:
          setMessage("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <h2>Reset Password</h2>
        <p className="reset-info">
          Enter your registered email address below and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="reset-message">{message}</p>}
 
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
  main
      </div>
    </div>
  );
}

export default ForgotPassword;
