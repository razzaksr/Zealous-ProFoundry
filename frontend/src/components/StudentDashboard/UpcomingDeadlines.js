import React, { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getTestById, checkIfTestTaken, fetchModuleAndPoc } from "../../axios";
import { CircularProgress } from "@mui/material";

const UpcomingDeadlines = ({ testIds: propTestIds }) => {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [testIds, setTestIds] = useState([]);

  const styles = {
    card: {
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      minHeight: "400px",
      backgroundColor: "white",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "400px",
      margin: "0 auto",
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
      flexWrap: "wrap",
      gap: "8px",
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
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    deadlineTime: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: "#6b7280",
      flexWrap: "wrap",
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
      transition: "all 0.3s ease",
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
      minHeight: "400px",
    },
    errorText: {
      textAlign: "center",
      color: "#f44336",
      padding: "20px",
    },
    completedBadge: {
      backgroundColor: "rgba(76, 175, 80, 0.1)",
      color: "#4caf50",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
    },
    notCompletedBadge: {
      backgroundColor: "rgba(244, 67, 54, 0.1)",
      color: "#f44336",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
    },
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("true");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("User from session:", user);
        setUserId(user.user.user_id);

        if (propTestIds && propTestIds.length > 0) {
          console.log("Using prop testIds:", propTestIds);
          setTestIds(propTestIds);
        } else {
          fetchTestIdsFromApi(user.user.user_id);
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
        setError("Failed to load user data");
        setLoading(false);
      }
    } else {
      console.warn("No user found in session storage");
      setError("No user session found");
      setLoading(false);
    }
  }, [propTestIds]);

  const fetchTestIdsFromApi = async (userId) => {
    try {
      const response = await fetchModuleAndPoc(userId);
      console.log("Raw fetchModuleAndPoc response:", response);
      
      // Extract test IDs and full test objects from response.tests
      const tests = response.tests || [];
      console.log("Fetched tests:", tests);
      
      // Map to just test_ids if needed, but we'll keep full objects
      setTestIds(tests);
    } catch (error) {
      console.error("Error fetching test IDs from API:", error);
      setError("Failed to fetch test IDs");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!testIds || testIds.length === 0 || !userId) {
        console.log("No testIds or userId available:", { testIds, userId });
        setUpcomingDeadlines([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch test details using test_id from each test object
        const testPromises = testIds.map((test) => getTestById(test.test_id));
        const testResults = await Promise.all(testPromises);

        const completionPromises = testIds.map((test) =>
          checkIfTestTaken(userId, test.test_id)
        );
        const completionResults = await Promise.all(completionPromises);

        const transformedDeadlines = testResults.map((test, index) => {
          const assignedDate = testIds[index].assigned_date;

          return {
            id: test._id || test.test_id,
            title: test.test_name || "Unnamed Test",
            language: test.test_language || "Unknown",
            score: test.test_total_score || 0,
            assignedDate: assignedDate,
            hasTaken: completionResults[index].length > 0,
          };
        });

        setUpcomingDeadlines(transformedDeadlines);
      } catch (err) {
        console.error("Error fetching test details:", err);
        setError("Failed to load test deadlines");
      } finally {
        setLoading(false);
      }
    };

    if (userId && testIds.length > 0) {
      fetchTestDetails();
    }
  }, [testIds, userId]);

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingContainer}>
          <CircularProgress color="primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div
      style={styles.card}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";
      }}
    >
      <div style={styles.contentWrapper}>
        <div>
          <div style={styles.deadlinesHeader}>
            <Calendar size={20} color="#0c83c8" />
            <h2 style={styles.deadlinesTitle}>Upcoming Deadlines</h2>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div style={styles.loadingText}>No upcoming deadlines</div>
          ) : (
            upcomingDeadlines.map((deadline, index) => (
              <React.Fragment key={deadline.id}>
                <div style={styles.deadlineItem}>
                  <div style={styles.deadlineHeader}>
                    <div style={styles.deadlineTitle}>{deadline.title}</div>
                    <div style={styles.deadlineType}>
                      <span
                        style={
                          deadline.hasTaken
                            ? styles.completedBadge
                            : styles.notCompletedBadge
                        }
                      >
                        {deadline.hasTaken ? "Completed" : "Not Completed"}
                      </span>
                    </div>
                  </div>
                  <div style={styles.deadlineTime}>
                    <Clock size={14} />
                    <span>{deadline.assignedDate}</span>
                    <span style={{ marginLeft: "8px" }}>
                      Language: {deadline.language}
                    </span>
                    <span style={{ marginLeft: "8px" }}>
                      Max Score: {deadline.score}
                    </span>
                  </div>
                </div>
                {index < upcomingDeadlines.length - 1 && (
                  <div style={styles.divider}></div>
                )}
              </React.Fragment>
            ))
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            style={styles.outlinedButtonSmall}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(12, 131, 200, 0.05)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            View Calendar
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;