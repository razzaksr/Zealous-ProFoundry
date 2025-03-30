import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ZealousSignIn from "./pages/SiginIn";
import LandingPage from "./pages/LandingPage";
import McqTestPage from "./pages/MCQQuestionPage";
import TestModule from "./pages/TestModules";
import TestResult from "./pages/TestResult";
import CertificateApp from "./components/certificate";

const App = () => {
  const isLoggedIn = sessionStorage.getItem("true");

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/test-modules" element={<TestModule />} />
            <Route path="/mcq-test/:testMcqId" element={<McqTestPage />} />
            <Route path="/test-result" element={<TestResult />} />
            <Route path="/certificate" element={<CertificateApp />} />
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
