import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchResultsByUserId } from "../../axios";

const AssessmentScores = () => {
  const [assessmentData, setAssessmentData] = useState([]);

  const styles = {
    card: {
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      minHeight: "400px",
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
    },
    cardHeader: {
      padding: "24px",
      background: "linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)",
      color: "white",
    },
    cardTitle: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" },
    cardSubtitle: { fontSize: "14px", opacity: "0.9", marginBottom: "0" },
    cardContent: {
      padding: "24px",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    chartContainer: {
      height: "300px",
      width: "100%",
      marginTop: "16px",
      flexGrow: 1,
    },
  };

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Get the data for the hovered bar
      return (
        <div style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          <p style={{ margin: "0", fontWeight: "bold" }}>{label}</p>
          <p style={{ margin: "5px 0", color: "#0c83c8" }}>Obtained Score: {data.scored}</p>
          <p style={{ margin: "5px 0", color: "#82ca9d" }}>Total Score: {data.total}</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("true");
        if (!storedUser) {
          console.warn("No user found in session storage");
          return;
        }
        
        const user = JSON.parse(storedUser);
        const currentUserId = user?.user?.user_id;

        if (!currentUserId) {
          console.warn("No user ID available");
          return;
        }

        const resultData = await fetchResultsByUserId(currentUserId);
        if (resultData.success && resultData.data.length > 0) {
          const transformedData = resultData.data.map((result, index) => ({
            name: `Assessment ${index + 1}`,
            scored: result.result_score,
            total: result.result_total_score,
          }));
          setAssessmentData(transformedData);
        } else {
          setAssessmentData([]);
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        setAssessmentData([]);
      }
    };

    fetchData();
  }, []);

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
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, Math.max(...assessmentData.map(d => d.total), 50)]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="scored" fill="#0c83c8" radius={[4, 4, 0, 0]} name="Obtained Score" />
              {/* Removed the total score bar */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssessmentScores;