import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button, Paper, CircularProgress } from "@mui/material";
import Dash from "../components/dash";
import axios from "axios";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [certificateStatus, setCertificateStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const resultData = location.state?.resultData;

  // Fetch mod_id from sessionStorage
  const mod_id = sessionStorage.getItem("mod_id");

  useEffect(() => {
    if (mod_id) {
      // Fetch poc_certificate from backend using mod_id
      axios
        .get(`http://localhost:4000/poc_gateway/poc/get_poc_certificate_by_mod_id/${mod_id}`)
        .then((response) => {
          // Set certificate status to true if poc_certificate is true
          setCertificateStatus(response.data.poc_certificate);
        })
        .catch((error) => {
          console.error("Error fetching poc_certificate:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mod_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!resultData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h6">No result data found</Typography>
      </Box>
    );
  }

  const { result_score, result_total_score } = resultData;
  const percentage = ((result_score / result_total_score) * 100).toFixed(2);

  let message = "Keep practicing!";
  if (percentage >= 90) message = "Excellent job!";
  else if (percentage >= 75) message = "Great effort!";
  else if (percentage >= 50) message = "Good work!";
  else message = "You can do better!";

  return (
    <>
      <Dash />
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Paper
          elevation={6}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(135deg, #74ebd5, #acb6e5)",
            color: "#fff",
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Test Completed!
          </Typography>

          <Typography variant="h5" sx={{ mt: 2 }}>
            Correct Answers: <strong>{result_score}</strong> / {result_total_score}
          </Typography>

          <Typography variant="h5" sx={{ mt: 1 }}>
            Score Percentage: <strong>{percentage}%</strong>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, fontStyle: "italic", fontWeight: "bold" }}>
            {message}
          </Typography>

          <Box display="flex" justifyContent="center" gap={2} mt={4}>
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: "#3498DB", "&:hover": { backgroundColor: "#2980B9" } }}
              onClick={() => navigate("/")}
            >
              Go to Dashboard
            </Button>
          </Box>

          {/* Show Download Certificate button if poc_certificate is true */}
          {certificateStatus && (
            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: "#3498DB", "&:hover": { backgroundColor: "#2980B9" } }}
                onClick={() => navigate("/certificate")}
              >
                Download Certificate
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default TestResult;
