import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.js"; // ✅ Added .js extension
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      </div>
    </div>
  );
}

export default ForgotPassword;
