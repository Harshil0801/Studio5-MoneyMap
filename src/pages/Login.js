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

  // EMAIL LOGIN
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

      // Get user document
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User data not found.");
        return;
      }

      const userData = userSnap.data();
      const role = userData.role;

      // Save role for RBAC
      localStorage.setItem("userRole", role);

      // Redirect based on role
      if (role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "user";

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName || "",
          email: user.email,
          role: role,
          createdAt: new Date(),
        });
      } else {
        role = userSnap.data().role;
      }

      localStorage.setItem("userRole", role);

      if (role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h2>Welcome Back!</h2>

        <form onSubmit={handleLogin}>

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

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <button onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;