import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children }) {
  const { state } = useApp();

  // Wait for the initial Supabase session check before deciding anything —
  // otherwise we'd flash a redirect to /login on every page refresh.
  if (!state.authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rawaa-cream text-rawaa-grayDark text-sm">
        جارِ التحقق من الجلسة...
      </div>
    );
  }

  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  if (!state.emailVerified) return <Navigate to="/verify-email" replace />;
  if (!state.guardian?.region) return <Navigate to="/onboarding/guardian" replace />;

  // Admins only ever see the admin dashboard — never the parent-facing app.
  if (state.guardian?.isAdmin) return <Navigate to="/admin" replace />;

  // "Must add a child" is enforced by the registration flow itself
  // (Register -> VerifyEmail -> GuardianSetup -> AddChild navigates forward
  // explicitly). We do NOT force it again on every later login — a returning
  // guardian with zero children (e.g. removed their only child) can browse
  // normally and add one later from Settings / the parent dashboard.

  return children;
}
