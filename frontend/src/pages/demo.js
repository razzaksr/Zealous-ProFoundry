import React, { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  User,
  BookOpen,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
  Building,
  GraduationCap,
  Users,
  BarChart2,
} from "lucide-react"

export default function StudentDashboard() {
  // Mock data for student assessment scores
  const [assessmentData, setAssessmentData] = useState([
    { name: "Quiz 1", score: 85 },
    { name: "Assignment 1", score: 92 },
    { name: "Mid-term", score: 78 },
    { name: "Project", score: 88 },
    { name: "Quiz 2", score: 90 },
  ])

  // Mock data for course progress
  const courseProgress = 68
  const moduleCompletion = [
    { name: "Introduction", progress: 100, color: "#4caf50" },
    { name: "Core Concepts", progress: 75, color: "#2196f3" },
    { name: "Advanced Topics", progress: 45, color: "#ff9800" },
    { name: "Final Project", progress: 10, color: "#f44336" },
  ]

  // Mock data for upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, title: "Assignment 3: Data Structures", due: "Tomorrow, 11:59 PM", type: "assignment" },
    { id: 2, title: "Mid-term Exam", due: "May 15, 10:00 AM", type: "exam" },
    { id: 3, title: "Group Project Submission", due: "May 20, 5:00 PM", type: "project" },
  ]

  // Mock data for recent announcements
  const recentAnnouncements = [
    { id: 1, title: "New learning resources added", date: "2 hours ago" },
    { id: 2, title: "Office hours rescheduled", date: "Yesterday" },
  ]

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [studentName, setStudentName] = useState("Alex Johnson")
  const [moduleName, setModuleName] = useState("Advanced Web Development")
  const [orgName, setOrgName] = useState("Tech University")
  const [expertName, setExpertName] = useState("Dr. Sarah Miller")
  const [coordinatorName, setCoordinatorName] = useState("Prof. James Wilson")
  

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const handleTestModuleClick = () => {
    console.log("Navigate to test module")
  }

  // Styles for components
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      fontFamily: "'Inter', sans-serif",

    },
    mainContent: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    contentContainer: {
      flexGrow: 1,
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
    headerGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "16px",
      alignItems: "center",
      "@media (min-width: 768px)": {
        gridTemplateColumns: "7fr 5fr",
      },
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
    primaryButton: {
      backgroundColor: "#0c83c8",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      padding: "10px 20px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      "&:hover": {
        backgroundColor: "#0a6eaa",
        transform: "translateY(-2px)",
      },
    },
    outlinedButton: {
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
      transition: "background-color 0.3s ease, transform 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        transform: "translateY(-2px)",
      },
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
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "16px",
      marginBottom: "24px",
      "@media (min-width: 640px)": {
        gridTemplateColumns: "repeat(2, 1fr)",
      },
      "@media (min-width: 1024px)": {
        gridTemplateColumns: "repeat(4, 1fr)",
      },
    },
    statCard: {
      padding: "16px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      height: "100%",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      },
    },
    iconWrapper: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statTitle: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    statValue: {
      fontSize: "18px",
      fontWeight: "600",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
      "@media (min-width: 1024px)": {
        gridTemplateColumns: "8fr 4fr",
      },
    },
    card: {
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      height: "100%",
      backgroundColor: "white",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      },
    },
    cardHeader: {
      padding: "24px",
      background: "linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)",
      color: "white",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "8px",
    },
    cardSubtitle: {
      fontSize: "14px",
      opacity: "0.9",
      marginBottom: "0",
    },
    cardContent: {
      padding: "24px",
    },
    assessmentGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "16px",
      "@media (min-width: 640px)": {
        gridTemplateColumns: "repeat(3, 1fr)",
      },
    },
    assessmentItem: {
      textAlign: "center",
      padding: "16px",
    },
    assessmentIcon: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px auto",
    },
    assessmentTitle: {
      fontSize: "16px",
      fontWeight: "500",
      marginBottom: "8px",
    },
    assessmentDescription: {
      fontSize: "14px",
      color: "#6b7280",
    },
    secondaryButton: {
      backgroundColor: "#fc7a46",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      padding: "10px 20px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      "&:hover": {
        backgroundColor: "#e56b3d",
        transform: "translateY(-2px)",
      },
    },
    deadlinesHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "24px",
    },
    deadlinesTitle: {
      fontSize: "20px",
      fontWeight: "600",
      marginLeft: "8px",
    },
    deadlineItem: {
      padding: "12px 0",
    },
    deadlineHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    deadlineTitle: {
      fontSize: "14px",
      fontWeight: "500",
    },
    deadlineType: {
      fontSize: "12px",
      padding: "2px 8px",
      borderRadius: "12px",
      fontWeight: "500",
    },
    deadlineTime: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: "#6b7280",
    },
    divider: {
      height: "1px",
      backgroundColor: "#f0f0f0",
      margin: "8px 0",
    },
    outlinedButtonSmall: {
      backgroundColor: "transparent",
      color: "#0c83c8",
      border: "1px solid #0c83c8",
      borderRadius: "8px",
      fontWeight: "600",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      fontSize: "14px",
      "&:hover": {
        backgroundColor: "rgba(12, 131, 200, 0.05)",
        transform: "translateY(-2px)",
      },
    },
    chartContainer: {
      height: "300px",
      width: "100%",
      marginTop: "16px",
    },
  }

  return (
    <div style={styles.container}>
      {/* Sidebar placeholder - you would implement your Dash component here */}
      {isDrawerOpen && (
        <div style={{ width: "240px", backgroundColor: "#fff", boxShadow: "2px 0 10px rgba(0,0,0,0.1)" }}>
          {/* Sidebar content */}
        </div>
      )}

      <div style={styles.mainContent}>
        <div style={styles.contentContainer}>
          {/* Welcome Header */}
          <div style={styles.header}>
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
                      backgroundColor: "#0c83c8",
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
                      e.currentTarget.style.backgroundColor = "#0a6eaa"
                      e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#0c83c8"
                      e.currentTarget.style.transform = "translateY(0)"
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
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                      e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    <BookOpen size={18} />
                    View Resources
                  </button>
                </div>
              </div>

              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
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
              )}
            </div>
          </div>

          {/* Course Information Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : window.innerWidth < 1024 ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(12, 131, 200, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                height: "100%",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(12, 131, 200, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0c83c8",
                }}
              >
                <Building size={24} />
              </div>
              <div>
                <div style={styles.statTitle}>ORGANIZATION</div>
                <div style={styles.statValue}>{orgName}</div>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(252, 122, 70, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                height: "100%",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(252, 122, 70, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fc7a46",
                }}
              >
                <GraduationCap size={24} />
              </div>
              <div>
                <div style={styles.statTitle}>MODULE</div>
                <div style={styles.statValue}>{moduleName}</div>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(103, 58, 183, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                height: "100%",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(103, 58, 183, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#673ab7",
                }}
              >
                <User size={24} />
              </div>
              <div>
                <div style={styles.statTitle}>EXPERT</div>
                <div style={styles.statValue}>{expertName}</div>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                height: "100%",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(76, 175, 80, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4caf50",
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <div style={styles.statTitle}>COORDINATOR</div>
                <div style={styles.statValue}>{coordinatorName}</div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : window.innerWidth < 1024 ? "1fr" : "8fr 4fr",
              gap: "24px",
            }}
          >
            {/* Left Column */}
            <div>
              {/* Assessment Scores Chart */}
              <div
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  height: "100%",
                  backgroundColor: "white",
                  marginBottom: "24px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.05)"
                }}
              >
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Assessment Scores</h2>
                  <p style={styles.cardSubtitle}>Your performance in recent assessments</p>
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={assessmentData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#0c83c8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column */}
            <div>
              {/* Upcoming Deadlines */}
              <div
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  height: "100%",
                  backgroundColor: "white",
                  padding: "24px",
                  marginBottom: "24px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.05)"
                }}
              >
                <div style={styles.deadlinesHeader}>
                  <Calendar size={20} color="#0c83c8" />
                  <h2 style={styles.deadlinesTitle}>Upcoming Deadlines</h2>
                </div>

                {upcomingDeadlines.map((deadline, index) => (
                  <React.Fragment key={deadline.id}>
                    <div style={styles.deadlineItem}>
                      <div style={styles.deadlineHeader}>
                        <div style={styles.deadlineTitle}>{deadline.title}</div>
                        <div
                          style={{
                            ...styles.deadlineType,
                            backgroundColor:
                              deadline.type === "exam"
                                ? "rgba(244, 67, 54, 0.1)"
                                : deadline.type === "project"
                                  ? "rgba(33, 150, 243, 0.1)"
                                  : "rgba(76, 175, 80, 0.1)",
                            color:
                              deadline.type === "exam"
                                ? "#f44336"
                                : deadline.type === "project"
                                  ? "#2196f3"
                                  : "#4caf50",
                          }}
                        >
                          {deadline.type}
                        </div>
                      </div>
                      <div style={styles.deadlineTime}>
                        <Clock size={14} />
                        <span>Due: {deadline.due}</span>
                      </div>
                    </div>
                    {index < upcomingDeadlines.length - 1 && <div style={styles.divider}></div>}
                  </React.Fragment>
                ))}

                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <button
                    style={{
                      backgroundColor: "transparent",
                      color: "#0c83c8",
                      border: "1px solid #0c83c8",
                      borderRadius: "8px",
                      fontWeight: "600",
                      padding: "8px 16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(12, 131, 200, 0.05)"
                      e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    View Calendar
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

