import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";

import UploadResume from "./pages/UploadResume";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import History from "./pages/History";
import Profile from "./pages/Profile";

import CreateJob from "./pages/CreateJob";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Applications from "./pages/Applications";
import RecruiterApplications from "./pages/RecruiterApplications";

import NotFound from "./pages/NotFound";
import Interview from "./pages/Interview";

function RoleHome() {
  const { user } = useAuth();

  return (
    <Navigate
      to={
        user?.role === "RECRUITER"
          ? "/recruiter/dashboard"
          : "/candidate/dashboard"
      }
      replace
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard selon le rôle */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleHome />
                </ProtectedRoute>
              }
            />

            {/* Candidate */}
            <Route
              path="/candidate/dashboard"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload-resume"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <UploadResume />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <Jobs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <JobDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <Applications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analyze"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <Analyze />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results/:id"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <Results />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute allowedRoles={["CANDIDATE"]}>
                  <History />
                </ProtectedRoute>
              }
            />

            {/* Profil partagé */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Recruiter */}
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={["RECRUITER"]}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter/jobs/new"
              element={
                <ProtectedRoute allowedRoles={["RECRUITER"]}>
                  <CreateJob />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter/jobs/:jobId/applications"
              element={
                <ProtectedRoute allowedRoles={["RECRUITER"]}>
                  <RecruiterApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:token"
              element={<Interview />}
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}