import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { hasPickedChildThisSession } from "../utils/childPickerSession";

export default function ProtectedRoute({ children }) {
  const { state } = useApp();
  const location = useLocation();

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

  // Guardian setup (language/region/notifications) is enforced only by the
  // registration flow itself (Register -> VerifyEmail -> GuardianSetup),
  // same as the "add a child" step below — never re-forced on a plain
  // login, even if the profile happens to be missing a region.

  // Admins only ever see the admin dashboard — never the parent-facing app.
  if (state.guardian?.isAdmin) return <Navigate to="/admin" replace />;

  // "Must add a child" is enforced by the registration flow itself
  // (Register -> VerifyEmail -> GuardianSetup -> AddChild navigates forward
  // explicitly). We do NOT force it again on every later login — a returning
  // guardian with zero children (e.g. removed their only child) can browse
  // normally and add one later from Settings / the parent dashboard.

  // Ask "مين بيقرأ اليوم؟" once per login session — checked here (not just
  // on the login button click) so it reliably shows regardless of how the
  // user arrived at a protected page (refresh, deep link, back button...).
  if (
    state.children.length > 0 &&
    !hasPickedChildThisSession() &&
    location.pathname !== "/choose-child" &&
    location.pathname !== "/onboarding/child"
  ) {
    return <Navigate to="/choose-child" replace />;
  }

  return children;
}
