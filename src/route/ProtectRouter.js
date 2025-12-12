// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ authUser, children }) {
  // authUser should be your user object or null/undefined if not logged in
  if (!authUser?.isLoggedin) {
    return <Navigate to="/login" replace />; // Redirect to login
  }

  return children; // Render the protected component
}
