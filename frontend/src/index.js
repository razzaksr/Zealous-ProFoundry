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

const App = () => {
  const isLoggedIn = sessionStorage.getItem("true");

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/test-modules" element={<TestModule />} />
            <Route path="/test-intro/:testId" element={<TestIntro />} />
            <Route path="/test-details/:testId" element={<TestDetails />} />
            <Route path="/mcq/:testId" element={<McqTest />} />
            <Route path="/coding/:testId" element={<CodingPage />} />
            <Route path="/test-result" element={<TestResult />} />
            <Route path="/certificate" element={<CertificateApp />} />
            <Route path="/testresults" element={<TestResult />} />
            <Route path="/info" element={<InstructionsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
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
