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
import CodingPage from "./pages/CodingPage";
import McqPage from "./pages/McqPage";
import InstructionsPage from "./pages/Info";
import AdminDashboard from "./pages/AdminDashboard";
import PocPage from "./pages/PocPage";
import UserPage from "./pages/UserPage";
import ModulePage from "./pages/ModulePage";
import OrganizationPage from "./pages/OrganizationPage";
import ExpertPage from "./pages/ExpertPage";
import McqAdminPage from "./pages/McqAdminPage";
import TestAdminPage from "./pages/TestAdminPage";
import OnlineCompiler from "./pages/CodingPage";
import CodeList from "./pages/CodeList";
import Add_Mcq from "./pages/Add_Mcq";
import Add_Module from "./pages/Add_Module";
import Add_Organisation from "./pages/Add_Organisation";
import Add_TestCase from "./pages/Add_Testcase";
import Add_Coding from "./pages/Add_Coding";
import Add_POC from "./pages/Add_Poc";
import BulkCertificateGenerator from "./pages/BulkCertificateGenerator";

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
              <Route path="/add_mcq" element={<Add_Mcq />} />
              <Route path="/add_module" element={<Add_Module />} />
              <Route path="/add_organisation" element={<Add_Organisation />} />
              <Route path="/add_testcase" element={<Add_TestCase />} />
              <Route path="/add_coding" element={<Add_Coding />} />
              <Route path="/add_poc" element={<Add_POC />} />
              <Route path="/admin_certficate" element={<BulkCertificateGenerator />} />
              <Route path="*" element={<Navigate to="/landing" />} />
            </>
          ) : (
            // 👤 Non-Admin Routes
            <>
              <Route path="/landing" element={<StudentDashboard />} />
              <Route path="/test-modules" element={<TestModule />} />
              <Route path="/test-intro/:testId" element={<TestIntro />} />
              <Route path="/test-details/:testId" element={<TestDetails />} />
              <Route path="/mcq/:testId" element={<McqPage />} />
              <Route path="/coding/:codeId" element={<CodingPage />} />
              <Route path="/test-result" element={<TestResult />} />
              <Route path="/info" element={<InstructionsPage />} />
              <Route path="/coding/:codeId" element={<OnlineCompiler />} />
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