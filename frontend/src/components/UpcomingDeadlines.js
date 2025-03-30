import React from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const UpcomingDeadlines = ({ upcomingDeadlines }) => {
  const styles = {
    card: {
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      minHeight: "400px", // Match AssessmentScores minHeight
      backgroundColor: "white",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
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
      transition: "all 0.3s ease",
    },
    contentWrapper: {
      flexGrow: 1, // Allow content to expand
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between", // Distribute content evenly
    },
  };

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