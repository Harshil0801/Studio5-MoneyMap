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
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // fetch role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User data not found.");
        return;
      }

      const userData = userSnap.data();
      const role = userData.role;

      // store role locally
      localStorage.setItem("userRole", role);

      // redirect based on role
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      alert(error.message);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {

        await setDoc(userRef, {
          email: user.email,
          role: "user",
          createdAt: new Date(),
        });

        localStorage.setItem("userRole", "user");

      } else {
        const role = userSnap.data().role;
        localStorage.setItem("userRole", role);
      }

      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>

      <Link to="/register">Register</Link>
    </div>
  );
}

export default Login;