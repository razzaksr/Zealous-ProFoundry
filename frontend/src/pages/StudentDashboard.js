import React, { useState, useEffect } from "react";
import { BookOpen, FileText } from "lucide-react";
import AssessmentScores from "../components/AssessmentScores";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import { fetchModuleAndPoc, fetchExpertName, fetchModuleName, fetchOrgName,fetchPocById  } from "../axios";
import CourseInfoCards from "../components/CourseInfoCards";
import Dash from "../components/dash";
import { useNavigate } from "react-router-dom";




export default function StudentDashboard() {
  const [assessmentData] = useState([
    { name: "Quiz 1", score: 85 },
    { name: "Assignment 1", score: 92 },
    { name: "Mid-term", score: 78 },
    { name: "Project", score: 88 },
    { name: "Quiz 2", score: 90 },
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studentName, setStudentName] = useState("Loading...");
  const [coordinatorName, setCoordinatorName] = useState("Loading...");
  const [modId, setModId] = useState(null);
  const [pocId, setPocId] = useState(null);
  const [expertName, setExpertName] = useState("Loading...");
  const [moduleName, setModuleName] = useState("Loading...");
  const [orgName, setOrgName] = useState("Loading...");
  const [testIds, setTestIds] = useState([]);
  const [lastTestId, setLastTestId] = useState(null);
  const courseProgress = 68;
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("User from session:", user);
        console.log("User ID:", user.user.user_id);
        console.log("Full Name:", user.user.full_name);
        setStudentName(user.user.full_name);
        if (user && user.user && user.user.user_id) {
          fetchModuleAndPocData(user.user.user_id);
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
  
      // 🔥 Fix: Use the pocId from the response, not expertData
      if (data.mod_poc_id) {
        const pocData = await fetchPocById(data.mod_poc_id);
        console.log("POC Data:", pocData);
        console.log("POC ID used for fetch:", data.mod_poc_id);
        const tests = pocData?.mod_tests || [];
        if (tests.length > 0) {
          setLastTestId(tests[tests.length - 1]); // last test ID
        }
      }
    } catch (error) {
      console.error("Error in fetchModuleAndPocData:", error);
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
    if (lastTestId) {
      navigate(`/test-intro/${lastTestId}`);
    } else {
      console.warn("No test ID available");
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
                    backgroundColor: "#0c80c3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleTestModuleClick}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#fc7a46";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#0c83c8";
                    e.currentTarget.style.transform = "translateY(0)";
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
          <AssessmentScores assessmentData={assessmentData} />
          <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} />
        </div>
      </div>
    </div>
  );
}