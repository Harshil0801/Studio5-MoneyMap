import React from "react";
import { Navigate } from "react-router-dom";
 feature/ai-assistant
import { auth } from "../firebase.js"; // ✅ Added .js extension
 
import { auth } from "../firebase";
  main

function ProtectedRoute({ children }) {
  const user = auth.currentUser;
  return user ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
