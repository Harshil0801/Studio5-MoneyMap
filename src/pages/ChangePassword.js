import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("No user logged in.");
        return;
      }

      await sendPasswordResetEmail(auth, user.email);
      setMessage("Reset email sent! Please check your inbox.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-shell">
        <div className="dash-card">
          <h2 style={{ marginBottom: "20px" }}>Change Password</h2>
          <p style={{ marginBottom: "20px" }}>
            Click the button below to receive a password reset email.
          </p>

          <button
            onClick={handleReset}
            className="dash-modal-btn"
            type="button"
          >
            Send Reset Email
          </button>

          {message && (
            <p style={{ marginTop: "20px", fontWeight: "500" }}>
              {message}
            </p>
          )}

          <br />

          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: "#2e7d73",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;