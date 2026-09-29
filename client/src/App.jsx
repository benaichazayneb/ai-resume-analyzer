import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Candidate
import CandidateDashboard from "./pages/CandidateDashboard";
import UploadResume from "./pages/UploadResume";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import History from "./pages/History";
import Applications from "./pages/Applications";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";

// Shared
import Profile from "./pages/Profile";

// Recruiter
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJob from "./pages/CreateJob";
import RecruiterApplications from "./pages/RecruiterApplications";
import RecruiterInterviewReport from "./pages/RecruiterInterviewReport";

// Interview
import Interview from "./pages/Interview";

// Other
import NotFound from "./pages/NotFound";


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

          {/* ================================================= */}
          {/* PUBLIC PAGES                                      */}
          {/* ================================================= */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />


          {/* ================================================= */}
          {/* AI INTERVIEW                                      */}
          {/* No MainLayout / no sidebar                        */}
          {/* ================================================= */}

          <Route
            path="/interview/:token"
            element={<Interview />}
          />


          {/* ================================================= */}
          {/* AUTHENTICATED APPLICATION                         */}
          {/* MainLayout = Sidebar + Topbar                     */}
          {/* ================================================= */}

          <Route element={<MainLayout />}>

            {/* ================================================= */}
            {/* Dashboard according to role                       */}
            {/* ================================================= */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleHome />
                </ProtectedRoute>
              }
            />


            {/* ================================================= */}
            {/* CANDIDATE                                         */}
            {/* ================================================= */}

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


            {/* ================================================= */}
            {/* SHARED PROFILE                                    */}
            {/* ================================================= */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />


            {/* ================================================= */}
            {/* RECRUITER                                         */}
            {/* ================================================= */}

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
              path="/recruiter/interview-report/:applicationId"
              element={
                <ProtectedRoute>
                  <RecruiterInterviewReport />
                </ProtectedRoute>
              }
            />

          </Route>


          {/* ================================================= */}
          {/* 404                                                */}
          {/* ================================================= */}

          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}