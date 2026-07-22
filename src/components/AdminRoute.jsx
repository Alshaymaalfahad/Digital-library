import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

// Standalone guard for /admin (does NOT wrap ProtectedRoute, since
// ProtectedRoute itself redirects admins to /admin — nesting them would loop).
export default function AdminRoute({ children }) {
  const { state } = useApp();

  if (!state.authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medad-gray50 text-medad-gray500 text-sm">
        جارِ التحقق من الجلسة...
      </div>
    );
  }

  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  if (!state.emailVerified) return <Navigate to="/verify-email" replace />;
  if (!state.guardian?.isAdmin) return <Navigate to="/home" replace />;

  return children;
}
