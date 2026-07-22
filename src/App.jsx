import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import GuardianSetup from "./pages/GuardianSetup";
import AddChild from "./pages/AddChild";
import Login from "./pages/Login";
import LoginRoleSelect from "./pages/LoginRoleSelect";
import AdminLogin from "./pages/AdminLogin";
import Landing from "./pages/Landing";
import ChildPicker from "./pages/ChildPicker";
import Home from "./pages/Home";
import Library from "./pages/Library";
import StoryReader from "./pages/StoryReader";
import CreateStory from "./pages/CreateStory";
import Profile from "./pages/Profile";
import ChildReports from "./pages/ChildReports";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding/guardian" element={<GuardianSetup />} />
          <Route path="/onboarding/child" element={<AddChild />} />
          <Route path="/login" element={<LoginRoleSelect />} />
          <Route path="/login/parent" element={<Login />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          <Route
            path="/choose-child"
            element={
              <ProtectedRoute>
                <ChildPicker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/story/:id"
            element={
              <ProtectedRoute>
                <StoryReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-story"
            element={
              <ProtectedRoute>
                <CreateStory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-reports/:childId"
            element={
              <ProtectedRoute>
                <ChildReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-reports"
            element={
              <ProtectedRoute>
                <ChildReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
