import React, { useState } from "react";
 feature/ai-assistant
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js"; // ✅ Added .js extension
 
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
  main
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  feature/ai-assistant
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 🕓 loading state
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 🔒 Basic password strength check
    if (password.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Email/password registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
  main
      return;
    }

    setLoading(true);
    try {
 feature/ai-assistant
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
 
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contact: formData.contact,
        dob: formData.dob,
        createdAt: new Date(),
        uid: user.uid,
        authProvider: "email",
      });

      alert(" Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          email: user.email,
          contact: "",
          dob: "",
          createdAt: new Date(),
          uid: user.uid,
          authProvider: "google",
        });
      }

      alert("Signed in with Google successfully!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.message);
  main
    }
  };

  return (
    <div className="register-page">
 feature/ai-assistant
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
 
      <div className="register-card">
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">
          Join us to manage your finances smarter 💰
        </p>

        <form onSubmit={handleRegister} className="register-form">
          <div className="name-group">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* Primary Sign Up button */}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        {/* Google Sign-in button */}
        <div className="google-btn-container">
          <button className="google-btn" onClick={handleGoogleSignIn}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
            />
            Continue with Google
          </button>
        </div>

        <p className="register-footer">
  main
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
