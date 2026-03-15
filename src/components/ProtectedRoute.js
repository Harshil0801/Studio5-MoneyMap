import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {

  const role = localStorage.getItem("userRole");

  if (!role) {
    return <Navigate to="/login" />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;