import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AssessmentScores = ({ assessmentData }) => {
  const styles = {
    card: {
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      minHeight: "400px", // Set a minimum height to match UpcomingDeadlines
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
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
      marginBottom: "0", // Fixed typo from marginBottomA
    },
    cardContent: {
      padding: "24px",
      flexGrow: 1, // Allow content to expand within the card
      display: "flex",
      flexDirection: "column",
    },
    chartContainer: {
      height: "300px", // Fixed chart height
      width: "100%",
      marginTop: "16px",
      flexGrow: 1, // Ensure it takes available space
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
  );
};

export default AssessmentScores;