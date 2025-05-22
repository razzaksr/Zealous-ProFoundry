import React, { useState, useEffect } from "react";
import { BookOpen, FileText } from "lucide-react";
import AssessmentScores from "../components/AssessmentScores";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import { fetchModuleAndPoc, fetchExpertName, fetchModuleName, fetchOrgName, fetchPocById,fetchResultsByUserId } from "../axios";
import CourseInfoCards from "../components/CourseInfoCards";
import Dash from "../components/dash";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentDashboard() {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studentName, setStudentName] = useState("Loading...");
  const [coordinatorName, setCoordinatorName] = useState("Loading...");
  const [modId, setModId] = useState(null);
  const [pocId, setPocId] = useState(null);
  const [expertName, setExpertName] = useState("Loading...");
  const [moduleName, setModuleName] = useState("Loading...");
  const [orgName, setOrgName] = useState("Loading...");
  const [lastTestId, setLastTestId] = useState(null);
  const [userId, setUserId] = useState(null); // Store user ID
  const [hasTakenTest, setHasTakenTest] = useState(false); // Track if test is taken
  const [testPercentage, setTestPercentage] = useState(0); // Initialize as 0

  const navigate = useNavigate();

  // Initial data fetch from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("User from session:", user);
        setStudentName(user.user.full_name);
        setUserId(user.user.user_id); // Set user ID
        if (user && user.user && user.user.user_id) {
          fetchModuleAndPocData(user.user.user_id);
          fetchTestResults(user.user.user_id); // Fetch test results
        } else {
          console.warn("User ID not found in session storage");
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
      }
    } else {
      console.warn("No user found in session storage");
    }
  }, []);

  // Fetch module and POC data, then check test status
  const fetchModuleAndPocData = async (userId) => {
    try {
      const data = await fetchModuleAndPoc(userId);
      setCoordinatorName(data.mod_poc_name);
      setModId(data.mod_id);
      setPocId(data.mod_poc_id);

      if (data.mod_id) {
        const expertData = await fetchExpertName(data.mod_id);
        setExpertName(expertData.mod_expert_name);
        console.log("Expert Data:", expertData);

        const moduleData = await fetchModuleName(data.mod_id);
        setModuleName(moduleData.mod_name);

        const orgData = await fetchOrgName(data.mod_id);
        setOrgName(orgData.org_name);
      }

      if (data.mod_poc_id) {
        const pocData = await fetchPocById(data.mod_poc_id);
        console.log("POC Data:", pocData);
        const tests = pocData?.mod_tests || [];
        if (tests.length > 0) {
          const latestTestId = tests[tests.length - 1];
          setLastTestId(latestTestId);
          // Check if the user has taken this test
          checkIfTestTaken(userId, latestTestId);
        } else {
          console.warn("No tests found for this POC");
        }
      }
    } catch (error) {
      console.error("Error in fetchModuleAndPocData:", error);
    }
  };

  // Check if the user has already taken the test
  const checkIfTestTaken = async (userId, testId) => {
    if (!userId || !testId) {
      console.warn("Missing userId or testId:", { userId, testId });
      setHasTakenTest(false); // Default to allowing test if data is missing
      return;
    }

    try {
      const response = await axios.get("http://localhost:9000/results/get_result_by_user_id_test_id", {
        params: {
          result_user_id: userId,
          result_test_id: testId,
        },
      });
      const result = response.data;
      console.log("Check Test Response:", result);
      setHasTakenTest(result.length > 0); // True if result exists, false if empty array
    } catch (error) {
      console.error("Error checking test result:", error);
      setHasTakenTest(false); // Allow test in case of error (optional)
    }
  };

  const fetchTestResults = async (userId) => {
    try {
      const resultData = await fetchResultsByUserId(userId);
      if (resultData.success && resultData.data.length > 0) {
        // Calculate percentage from the first result (or modify to average multiple)
        const latestResult = resultData.data[0];
        const percentage = (latestResult.result_score / latestResult.result_total_score) * 100;
        setTestPercentage(Math.round(percentage)); // Round to nearest integer
      } else {
        setTestPercentage(0); // No results, set to 0
      }
    } catch (error) {
      console.error("Error fetching test results:", error);
      setTestPercentage(0); // On error, set to 0
    }
  };

  const upcomingDeadlines = [
    { id: 1, title: "Assignment 3: Data Structures", due: "Tomorrow, 11:59 PM", type: "assignment" },
    { id: 2, title: "Mid-term Exam", due: "May 15, 10:00 AM", type: "exam" },
    { id: 3, title: "Group Project Submission", due: "May 20, 5:00 PM", type: "project" },
  ];

  const styles = {
    container: {
      display: "grid",
      gridTemplateRows: "auto 1fr",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "1fr",
      padding: "24px",
      maxWidth: "1400px",
      margin: "0 auto",
      width: "100%",
    },
    header: {
      background: `linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)`,
      color: "white",
      padding: "24px",
      borderRadius: "0 0 20px 20px",
      boxShadow: "0 4px 20px rgba(12, 131, 200, 0.2)",
      marginBottom: "24px",
    },
    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "8px",
    },
    headerSubtitle: {
      fontSize: "16px",
      opacity: "0.9",
      marginBottom: "16px",
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      marginTop: "16px",
    },
    progressCircle: {
      position: "relative",
      width: "200px",
      height: "200px",
      borderRadius: "50%",
      background: `conic-gradient(#fc7a46 ${testPercentage}%, rgba(255,255,255,0.2) 0)`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 auto",
    },
    innerCircle: {
      position: "absolute",
      inset: "10px",
      borderRadius: "50%",
      background: "rgba(12, 131, 200, 0.8)",
    },
    progressText: {
      position: "relative",
      textAlign: "center",
      zIndex: "1",
    },
    progressPercentage: {
      fontSize: "36px",
      fontWeight: "bold",
    },
    progressLabel: {
      fontSize: "14px",
    },
    statCard: {
      padding: "12px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minHeight: "70px",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    iconWrapper: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statTitle: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    statValue: {
      fontSize: "16px",
      fontWeight: "600",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    sectionSpacing: {
      marginBottom: "24px",
    },
  };

  // Handle window resize for mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Handle "Take Tests" button click
  const handleTestModuleClick = () => {
    if (!lastTestId) {
      console.warn("No test ID available");
      alert("No test available at the moment.");
      return;
    }

    if (hasTakenTest) {
      alert("You have already taken this test.");
    } else {
      navigate(`/test-intro/${lastTestId}`);
    }
  };

  return (
    <div style={styles.container}>
      <Dash />
      <div style={styles.mainContent}>
        {/* Welcome Header */}
        <div style={{ ...styles.header, ...styles.sectionSpacing }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "7fr 5fr",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
              <h1 style={styles.headerTitle}>Welcome back, {studentName}!</h1>
              <p style={styles.headerSubtitle}>Continue your learning journey with {moduleName}</p>
              <div style={styles.buttonContainer}>
                <button
                  style={{
                    backgroundColor: hasTakenTest ? "#cccccc" : "#0c80c3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: hasTakenTest ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleTestModuleClick}
                  disabled={hasTakenTest}
                  onMouseOver={(e) => {
                    if (!hasTakenTest) {
                      e.currentTarget.style.backgroundColor = "#fc7a46";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!hasTakenTest) {
                      e.currentTarget.style.backgroundColor = "#0c83c8";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <FileText size={18} />
                  Take Tests
                </button>
                <button
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid white",
                    borderRadius: "8px",
                    fontWeight: "600",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <BookOpen size={18} />
                  View Resources
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: isMobile ? "16px" : "0",
              }}
            >
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: isMobile ? "16px" : "0" }}>
              <div style={styles.progressCircle}>
                <div style={styles.innerCircle}></div>
                <div style={styles.progressText}>
                  <div style={styles.progressPercentage}>{testPercentage}%</div>
                  <div style={styles.progressLabel}>Test Percentage</div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Course Information Cards */}
        <CourseInfoCards
          orgName={orgName}
          moduleName={moduleName}
          expertName={expertName}
          coordinatorName={coordinatorName}
          styles={styles}
        />

        {/* Main Content Area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <AssessmentScores  />
          <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} />
        </div>
      </div>
    </div>
  );
}