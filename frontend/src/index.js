import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EnhancedSignIn from "./pages/page";
import ZealousSignIn from "./pages/SiginIn";
import LandingPage from "./pages/LandingPage";
import McqTestPage from "./pages/MCQQuestionPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ZealousSignIn />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/mcq-test/:testMcqId" element={<McqTestPage />} />
        
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
