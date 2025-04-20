import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ZealousSignIn from "./pages/SiginIn";
import TestModule from "./pages/TestModules";
import TestResult from "./pages/TestResult";
import CertificateApp from "./components/certificate";
import StudentDashboard from "./pages/StudentDashboard";
import TestIntro from "./pages/TestIntro";
import TestDetails from "./pages/TestDetails";
import CodingPage from "./pages/CodingTest";
import McqTest from "./pages/McqTest";
import InstructionsPage from "./pages/Info";
import AdminDashboard from "./pages/AdminDashboard";
import PocPage from "./pages/PocPage";
import UserPage from "./pages/UserPage";
import ModulePage from "./pages/ModulePage";
import OrganizationPage from "./pages/OrganizationPage";
import ExpertPage from "./pages/ExpertPage";
import McqAdminPage from "./pages/McqAdminPage";
import TestAdminPage from "./pages/TestAdminPage";
import OnlineCompiler from "./pages/CodingTest";
import CodeList from "./pages/CodeList";

const App = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Correctly fetch user from localStorage (based on your message)
  const sessionData = JSON.parse(localStorage.getItem("true"));
  const user = sessionData?.user;
  const isAdmin = user?.admin === true;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ZealousSignIn />} />

        {isLoggedIn ? (
          isAdmin ? (
            // 🔐 Admin Routes
            <>
              <Route path="/landing" element={<AdminDashboard />} />
              <Route path="/poc" element={<PocPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/module" element={<ModulePage />} />
              <Route path="/organization" element={<OrganizationPage />} />
              <Route path="/expert" element={<ExpertPage />} />
              <Route path="/mcq-admin" element={<McqAdminPage />} />
              <Route path="/test" element={<TestAdminPage />} />
              <Route path="*" element={<Navigate to="/landing" />} />
            </>
          ) : (
            // 👤 Non-Admin Routes
            <>
              <Route path="/landing" element={<StudentDashboard />} />
              <Route path="/test-modules" element={<TestModule />} />
              <Route path="/test-intro/:testId" element={<TestIntro />} />
              <Route path="/test-details/:testId" element={<TestDetails />} />
              <Route path="/mcq/:testId" element={<McqTest />} />
              <Route path="/coding/:testId" element={<CodingPage />} />
              <Route path="/test-result" element={<TestResult />} />
              <Route path="/testresults" element={<TestResult />} />
              <Route path="/info" element={<InstructionsPage />} />
              <Route path="/compiler/:codeId" element={<OnlineCompiler />} />
              <Route path="/codelist" element={<CodeList />} />

              <Route path="*" element={<Navigate to="/landing" />} />
            </>
          )
        ) : (
          // 🚫 Not Logged In
          <>
            <Route path="/" element={<ZealousSignIn />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
