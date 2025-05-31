import React, { useState, useEffect } from "react"
import { CalendarIcon, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { getTestById, checkIfTestTaken, fetchModuleAndPoc, getModuleById } from "../../axios"
import { CircularProgress } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { parse } from "date-fns"
import ModuleCalendar from './ModuleCalendar'

const UpcomingDeadlines = ({ testIds: propTestIds }) => {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [modId, setModId] = useState(null)
  const [testIds, setTestIds] = useState([])
  const [moduleDuration, setModuleDuration] = useState({ startDate: null, endDate: null })
  const [testDates, setTestDates] = useState([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const deadlinesPerPage = 3 // Number of deadlines per page
  const [isNavigating, setIsNavigating] = useState(false) // For debouncing navigation

  const styles = {
    card: {
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      backgroundColor: "#ffffff",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid rgba(0, 0, 0, 0.05)",
    },
    deadlinesHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
      borderBottom: "2px solid #f5f7fa",
      paddingBottom: "12px",
    },
    deadlinesTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginLeft: "12px",
      color: "#1a3353",
      letterSpacing: "-0.02em",
    },
    deadlineItem: {
      padding: "12px 0",
      transition: "all 0.2s ease",
      borderRadius: "12px",
      margin: "4px 0",
    },
    deadlineHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      flexWrap: "wrap",
      gap: "8px",
      alignItems: "center",
    },
    deadlineTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#2c3e50",
      letterSpacing: "-0.01em",
    },
    deadlineType: {
      fontSize: "11px",
      padding: "2px 6px",
      borderRadius: "20px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    deadlineTime: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#64748b",
      flexWrap: "wrap",
    },
    divider: {
      height: "1px",
      backgroundColor: "#f1f5f9",
      margin: "8px 0",
    },
    outlinedButtonSmall: {
      backgroundColor: "transparent",
      color: "#0369a1",
      border: "1.5px solid #0369a1",
      borderRadius: "12px",
      fontWeight: "600",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "13px",
      boxShadow: "0 2px 4px rgba(3, 105, 161, 0.1)",
    },
    contentWrapper: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      minHeight: "350px",
      flexDirection: "column",
      gap: "16px",
    },
    loadingText: {
      color: "#64748b",
      fontSize: "14px",
      fontWeight: "500",
    },
    errorText: {
      textAlign: "center",
      color: "#ef4444",
      padding: "24px",
      fontSize: "15px",
      fontWeight: "500",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      borderRadius: "12px",
      margin: "16px 0",
    },
    completedBadge: {
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      color: "#16a34a",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.02em",
      boxShadow: "0 2px 4px rgba(22, 163, 74, 0.1)",
    },
    notCompletedBadge: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.02em",
      boxShadow: "0 2px 4px rgba(239, 68, 68, 0.1)",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      color: "#64748b",
      fontSize: "15px",
      fontWeight: "500",
      textAlign: "center",
      gap: "12px",
    },
    infoIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      backgroundColor: "#e2e8f0",
      color: "#64748b",
      fontSize: "10px",
      fontWeight: "700",
      marginLeft: "4px",
      cursor: "help",
    },
    metadataItem: {
      backgroundColor: "rgba(100, 116, 139, 0.05)",
      borderRadius: "8px",
      padding: "4px 8px",
      fontSize: "11px",
      color: "#64748b",
      fontWeight: "500",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "20px",
      gap: "8px",
    },
    paginationButton: {
      backgroundColor: "transparent",
      color: "#0369a1",
      border: "1.5px solid #0369a1",
      borderRadius: "50%",
      padding: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(3, 105, 161, 0.1)",
      width: "36px",
      height: "36px",
    },
    paginationButtonDisabled: {
      backgroundColor: "transparent",
      color: "#94a3b8",
      border: "1.5px solid #94a3b8",
      borderRadius: "50%",
      padding: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "not-allowed",
      transition: "all 0.3s ease",
      boxShadow: "none",
      width: "36px",
      height: "36px",
    },
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("true")

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        console.log("User from session:", user)
        setUserId(user?.user?.user_id || null)
        setModId(user?.user?.mod_poc_id?.mod_id || null)

        if (propTestIds && Array.isArray(propTestIds) && propTestIds.length > 0) {
          console.log("Using prop testIds:", propTestIds)
          setTestIds(propTestIds)
        } else {
          fetchTestIdsFromApi(user?.user?.user_id)
        }

        if (user?.user?.mod_poc_id?.mod_id) {
          fetchModuleDetails(user.user.mod_poc_id.mod_id)
        } else {
          console.warn("No modId found in session storage")
          setError("Module ID not available")
          setLoading(false)
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error)
        setError("Failed to load user data")
        setLoading(false)
      }
    } else {
      console.warn("No user found in session storage")
      setError("No user session found")
      setLoading(false)
    }
  }, [propTestIds])

  const fetchModuleDetails = async (modId) => {
    try {
      const moduleData = await getModuleById(modId)
      console.log("Module data:", moduleData)
      if (moduleData?.mod_duration) {
        const [start, end] = moduleData.mod_duration
          .split(" - ")
          .map((dateStr) => parse(dateStr, "dd/MM/yyyy", new Date()))
        setModuleDuration({ startDate: start, endDate: end })
      }
    } catch (error) {
      console.error("Error fetching module details:", error)
      setError("Failed to fetch module details")
      setLoading(false)
    }
  }

  const fetchTestIdsFromApi = async (userId) => {
    if (!userId) {
      console.warn("No userId provided for fetching test IDs")
      setError("User ID not available")
      setLoading(false)
      return
    }

    try {
      const response = await fetchModuleAndPoc(userId)
      console.log("Raw fetchModuleAndPoc response:", response)

      const tests = Array.isArray(response?.tests) ? response.tests : []
      console.log("Fetched tests:", tests)

      setTestIds(tests)
    } catch (error) {
      console.error("Error fetching test IDs from API:", error)
      setError("Failed to fetch test IDs")
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!testIds || !Array.isArray(testIds) || testIds.length === 0 || !userId) {
        console.log("No testIds or userId available:", { testIds, userId })
        setUpcomingDeadlines([])
        setTestDates([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const testPromises = testIds.map((test) => getTestById(test.test_id))
        console.log("Fetching test details for IDs:", testIds.map((test) => test.test_id))
        const testResults = await Promise.all(testPromises.map((p) => p.catch((e) => ({ error: e }))))

        const completionPromises = testIds.map((test) => checkIfTestTaken(userId, test.test_id))
        const completionResults = await Promise.all(completionPromises.map((p) => p.catch(() => [])))

        const transformedDeadlines = testResults
          .map((test, index) => {
            if (test.error) {
              console.warn(`Error fetching test ${testIds[index].test_id}:`, test.error)
              return null
            }
            const assignedDate = testIds[index]?.assigned_date || "Unknown"
            return {
              id: test._id || test.test_id || `test-${index}`,
              title: test.test_name || "Unnamed Test",
              language: test.test_language || "Unknown",
              score: test.test_total_score || 0,
              assignedDate: assignedDate,
              hasTaken: completionResults[index]?.length > 0,
            }
          })
          .filter((deadline) => deadline !== null)

        const parsedTestDates = transformedDeadlines
          .filter((deadline) => deadline.assignedDate && deadline.assignedDate !== "Unknown")
          .map((deadline) => ({
            date: parse(deadline.assignedDate, "dd/MM/yyyy", new Date()),
            hasTaken: deadline.hasTaken,
            title: deadline.title,
          }))

        setUpcomingDeadlines(transformedDeadlines)
        setTestDates(parsedTestDates)
        setCurrentPage(1) // Reset to first page when deadlines change
      } catch (err) {
        console.error("Error fetching test details:", err)
        setError("Failed to load test deadlines")
      } finally {
        setLoading(false)
      }
    }

    if (userId && testIds.length > 0) {
      fetchTestDetails()
    }
  }, [testIds, userId])

  // Pagination logic
  const totalPages = Math.ceil(upcomingDeadlines.length / deadlinesPerPage)
  const startIndex = (currentPage - 1) * deadlinesPerPage
  const endIndex = Math.min(startIndex + deadlinesPerPage, upcomingDeadlines.length)
  // Strictly limit currentDeadlines to deadlinesPerPage
  const currentDeadlines = upcomingDeadlines.slice(startIndex, endIndex).slice(0, deadlinesPerPage)

  // Monitor state changes for debugging
  useEffect(() => {

    // Reset currentPage if it exceeds totalPages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, upcomingDeadlines, currentDeadlines, totalPages])

  const handlePreviousPage = () => {
    if (isNavigating || currentPage <= 1) return
    setIsNavigating(true)
    setCurrentPage(currentPage - 1)
    setTimeout(() => setIsNavigating(false), 300) // Debounce navigation
  }

  const handleNextPage = () => {
    if (isNavigating || currentPage >= totalPages) return
    setIsNavigating(true)
    setCurrentPage(currentPage + 1)
    setTimeout(() => setIsNavigating(false), 300) // Debounce navigation
  }

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingContainer}>
          <CircularProgress style={{ color: "#0ea5e9" }} size={40} thickness={4} />
          <div style={styles.loadingText}>Loading your deadlines...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.deadlinesHeader}>
          <CalendarIcon size={22} color="#0ea5e9" />
          <h2 style={styles.deadlinesTitle}>Upcoming Deadlines</h2>
        </div>
        <div style={styles.errorText}>{error}</div>
        <div style={styles.emptyState}>Please refresh the page or contact support if the issue persists.</div>
      </div>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div
        style={styles.card}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)"
          e.currentTarget.style.transform = "translateY(-6px)"
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.08)"
          e.currentTarget.style.transform = "translateY(0)"
        }}
      >
        <div style={styles.contentWrapper}>
          <div>
            <div style={styles.deadlinesHeader}>
              <CalendarIcon size={22} color="#0ea5e9" />
              <h2 style={styles.deadlinesTitle}>Upcoming Deadlines</h2>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div style={styles.emptyState}>
                <CalendarIcon size={32} color="#94a3b8" />
                <div>No upcoming deadlines found</div>
                <div style={{ fontSize: "13px", opacity: 0.8 }}>Check back later for new assignments</div>
              </div>
            ) : (
              currentDeadlines.map((deadline, index) => (
                <React.Fragment key={`${deadline.id}-${currentPage}-${index}`}>
                  <div
                    style={styles.deadlineItem}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(241, 245, 249, 0.5)"
                      e.currentTarget.style.padding = "12px 8px"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.padding = "12px 0"
                    }}
                  >
                    <div style={styles.deadlineHeader}>
                      <div style={styles.deadlineTitle}>{deadline.title}</div>
                      <div style={styles.deadlineType}>
                        <span style={deadline.hasTaken ? styles.completedBadge : styles.notCompletedBadge}>
                          {deadline.hasTaken ? "Completed" : "Not Completed"}
                        </span>
                      </div>
                    </div>
                    <div style={styles.deadlineTime}>
                      <Clock size={14} color="#64748b" />
                      <span style={{ fontWeight: "500" }}>{deadline.assignedDate}</span>
                      <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                        <span style={styles.metadataItem}>Language: {deadline.language}</span>
                        <span style={styles.metadataItem}>Max Score: {deadline.score}</span>
                      </div>
                    </div>
                  </div>
                  {index < currentDeadlines.length - 1 && <div style={styles.divider}></div>}
                </React.Fragment>
              ))
            )}
          </div>

          <div style={styles.buttonContainer}>
            <button
              style={styles.outlinedButtonSmall}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(3, 105, 161, 0.05)"
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(3, 105, 161, 0.15)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(3, 105, 161, 0.1)"
              }}
              onClick={() => setIsCalendarOpen(true)}
            >
              View Calendar
              <ArrowRight size={16} />
            </button>
            {upcomingDeadlines.length > deadlinesPerPage && (
              <>
                <div title="Previous Page">
                  <button
                    style={currentPage === 1 ? styles.paginationButtonDisabled : styles.paginationButton}
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isNavigating}
                    onMouseOver={(e) => {
                      if (currentPage !== 1 && !isNavigating) {
                        e.currentTarget.style.backgroundColor = "rgba(3, 105, 161, 0.05)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(3, 105, 161, 0.15)"
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== 1 && !isNavigating) {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(3, 105, 161, 0.1)"
                      }
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
                <div title="Next Page">
                  <button
                    style={currentPage === totalPages ? styles.paginationButtonDisabled : styles.paginationButton}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isNavigating}
                    onMouseOver={(e) => {
                      if (currentPage !== totalPages && !isNavigating) {
                        e.currentTarget.style.backgroundColor = "rgba(3, 105, 161, 0.05)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(3, 105, 161, 0.15)"
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== totalPages && !isNavigating) {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(3, 105, 161, 0.1)"
                      }
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          <ModuleCalendar
            testDates={testDates}
            moduleDuration={moduleDuration}
            open={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
          />
        </div>
      </div>
    </LocalizationProvider>
  )
}

export default UpcomingDeadlines