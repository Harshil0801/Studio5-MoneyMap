import React, { useState } from "react";
  feature/ai-assistant
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js"; // ✅ added .js extension
 
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
 main
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  feature/ai-assistant
  const [loading, setLoading] = useState(false); // 🕓 loading state
  const navigate = useNavigate();

 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // 🔹 Email/Password Login
  main
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
 feature/ai-assistant
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      // ✅ Friendlier error messages
      if (error.code === "auth/invalid-credential") {
        alert("❌ Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        alert("⚠️ No account found with this email.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
 
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optional: Fetch user data from Firestore if you need it later
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        console.log("User data:", userSnap.data());
      }

      alert("✅ Login successful!");
      navigate("/dashboard");
    } catch (error) {
      alert("❌ " + error.message);
    }
    setLoading(false);
  };

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      alert("✅ Logged in successfully with Google!");
      navigate("/dashboard");
    } catch (error) {
      alert("❌ " + error.message);
  main
    }
  };

  return (
    <div className="login-page">
  feature/ai-assistant
      <div className="login-container">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
 
      <div className="login-card">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Log in to manage your finances smarter 💼</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
  main
          />
          <input
            type="password"
            placeholder="Password"
  feature/ai-assistant
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="google-btn-container">
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
            />
            Continue with Google
          </button>
        </div>

  main
        <div className="login-links">
          <p>
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
