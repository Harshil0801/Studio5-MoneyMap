import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // EMAIL & PASSWORD LOGIN 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // For getting user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const role = userData.role;

        alert(" Login successful!");

        //If admin redirects to admin dashboard else if user it redirects to user dashboard
        if (role === "admin") {
          navigate("/AdminDashboard");
        } else {
          navigate("/dashboard");
        }

      } else {
        alert("User data not found in database.");
      }

    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        alert(" Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        alert(" No account found with this email.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName || "",
          email: user.email,
          role: "user", 
          createdAt: new Date()
        });
      }

      alert("Logged in successfully with Google!");

      navigate("/dashboard");

    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">
          Log in to manage your finances smarter 💼
        </p>

        <form onSubmit={handleLogin} className="login-form">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* GOOGLE LOGIN */}
        <div className="google-btn-container">
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
            />
            Continue with Google
          </button>
        </div>

        {/* LINKS */}
        <div className="login-links">
          <p>
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <p className="back-home-link">
            <Link to="/"> Back to Home</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
