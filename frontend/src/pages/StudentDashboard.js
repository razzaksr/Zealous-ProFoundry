import React, { useState, useEffect } from "react";
import { BookOpen, FileText } from "lucide-react";
import AssessmentScores from "../components/StudentDashboard/AssessmentScores";
import UpcomingDeadlines from "../components/StudentDashboard/UpcomingDeadlines";
import {
  fetchAggregateScores,
  fetchModuleAndPoc,
  fetchExpertName,
  fetchModuleName,
  fetchOrgName,
  checkIfTestTaken,
  fetchTestsToday,
} from "../axios";
import CourseInfoCards from "../components/StudentDashboard/CourseInfoCards";
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
  const [todayTestId, setTodayTestId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasTakenTest, setHasTakenTest] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [testIds, setTestIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage except for 'true' and 'isLoggedIn'
    const preserveKeys = ["true", "isLoggedIn"];
    Object.keys(localStorage).forEach((key) => {
      if (!preserveKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear browser history and set current page as only entry
    window.history.replaceState(null, null, window.location.href);

    const storedUser = localStorage.getItem("true");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("User data from localStorage:", userData);

        setStudentName(userData.user.full_name || "Student");
        setUserId(userData.user.user_id);
        setModId(userData.user.mod_poc_id.mod_id);
        setPocId(userData.user.mod_poc_id.mod_poc_id);
        console.log("User Admin:", userData.user.admin);

        if (userData?.user?.user_id && userData?.user?.mod_poc_id?.mod_poc_id) {
          fetchDashboardData(
            userData.user.user_id,
            userData.user.mod_poc_id.mod_id,
            userData.user.mod_poc_id.mod_poc_id
          );
        } else {
          console.warn("Incomplete user data in localStorage:", userData);
          setError("User session invalid");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setError("Failed to load user data");
        setIsLoading(false);
      }
    } else {
      console.warn("No user found in localStorage");
      setError("Please log in");
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setIsLoading(true);

      const modulePocData = await fetchModuleAndPoc(userId);
      console.log("Module and POC data:", modulePocData);

      setModId(modulePocData.mod_id || null);
      setPocId(modulePocData.mod_poc_id || null);
      setCoordinatorName(modulePocData.mod_poc_name || "Not assigned");

      if (modulePocData.mod_id) {
        const [expertData, moduleData, orgData] = await Promise.all([
          fetchExpertName(modulePocData.mod_id),
          fetchModuleName(modulePocData.mod_id),
          fetchOrgName(modulePocData.mod_id),
        ]);

        setExpertName(expertData.mod_expert_name || "Not assigned");
        setModuleName(moduleData.mod_name || "Unknown module");
        setOrgName(orgData.org_name || "Unknown organization");
      }

      if (userId && modulePocData.mod_poc_id) {
        await fetchCourseProgress(userId, modulePocData.mod_poc_id);
      }
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayTests = async (pocId, userId) => {
    try {
      const testsData = await fetchTestsToday(pocId);
      console.log("Today's tests data:", testsData);

      const tests = testsData.test_ids || [];
      if (tests.length > 0) {
        const testIdsArray = tests;
        console.log("Test IDs for today:", testIdsArray);

        setTestIds(testIdsArray);
        const firstTestId = testIdsArray[0];
        setTodayTestId(firstTestId);
        await checkTestTaken(userId, firstTestId);
      } else {
        console.warn("No tests available for today");
        setTodayTestId(null);
      }
    } catch (testError) {
      console.error("Failed to fetch today's tests:", testError);
      setError("Failed to load today's tests");
      setTodayTestId(null);
    }
  };

  const checkTestTaken = async (userId, testId) => {
    if (!userId || !testId) {
      console.warn("Missing userId or testId:", { userId, testId });
      setHasTakenTest(false);
      return;
    }

    try {
      const result = await checkIfTestTaken(userId, testId);
      console.log("Check Test Response:", result);
      setHasTakenTest(result.length > 0);
    } catch (error) {
      console.error("Error checking test status:", error);
      setHasTakenTest(false);
    }
  };

  const fetchCourseProgress = async (userId, modPocId) => {
    try {
      const response = await fetchAggregateScores(modPocId, userId);
      console.log("Course progress data:", response);

      if (response.response && response.response.average_percentage) {
        const averagePercentage = response.response.average_percentage;
        setCourseProgress(Math.floor(averagePercentage));
      } else {
        setCourseProgress(0);
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
      setCourseProgress(0);
    }
  };

  useEffect(() => {
    if (pocId && userId) {
      console.log("Fetching tests for pocId:", pocId);
      fetchTodayTests(pocId, userId);
    }
  }, [pocId, userId]);

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
      background: `conic-gradient(#fc7a46 ${courseProgress}%, rgba(255,255,255,0.2) 0)`,
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
    errorMessage: {
      color: "#ff4444",
      textAlign: "center",
      padding: "20px",
    },
  };

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

  const handleTestModuleClick = () => {
    if (!todayTestId) {
      console.warn("No test ID available");
      alert("No tests are scheduled for today. Please check back tomorrow or contact your coordinator.");
      return;
    }

    if (hasTakenTest) {
      alert("You have already taken today's test.");
    } else {
      console.log("Navigating to test:", todayTestId);
      navigate(`/test-intro/${todayTestId}`);
    }
  };

  if (isLoading) {
    return <div style={styles.container}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Dash />
      <div style={styles.mainContent}>
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
              <p style={styles.headerSubtitle}>
                Continue your learning journey with {moduleName}
              </p>
              <div style={styles.buttonContainer}>
                <button
                  style={{
                    backgroundColor: !todayTestId || hasTakenTest ? "#cccccc" : "#0c80c3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: !todayTestId || hasTakenTest ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleTestModuleClick}
                  disabled={!todayTestId || hasTakenTest}
                  onMouseOver={(e) => {
                    if (todayTestId && !hasTakenTest) {
                      e.currentTarget.style.backgroundColor = "#fc7a46";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (todayTestId && !hasTakenTest) {
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
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.1)";
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
              <div style={styles.progressCircle}>
                <div style={styles.innerCircle}></div>
                <div style={styles.progressText}>
                  <div style={styles.progressPercentage}>{courseProgress}%</div>
                  <div style={styles.progressLabel}>Course Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CourseInfoCards
          orgName={orgName}
          moduleName={moduleName}
          expertName={expertName}
          coordinatorName={coordinatorName}
          styles={styles}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <AssessmentScores />
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  );
}