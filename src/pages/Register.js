import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js"; // ✅ Added .js extension
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 🕓 loading state
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 🔒 Basic password strength check
    if (password.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      // 🎯 Friendly Firebase error messages
      switch (error.code) {
        case "auth/email-already-in-use":
          alert("⚠️ This email is already registered. Try logging in.");
          break;
        case "auth/invalid-email":
          alert("❌ Please enter a valid email address.");
          break;
        case "auth/weak-password":
          alert("⚠️ Password is too weak. Try adding numbers or symbols.");
          break;
        default:
          alert("Something went wrong. Please try again later.");
          console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
