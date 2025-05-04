import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Fade,
  Zoom,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Pulse animation for CircularProgress
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Fade-in animation for text
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const FullScreenCard = styled(Card)(({ theme }) => ({
  width: "100%",
  minHeight: "100vh",
  margin: 0,
  borderRadius: 0,
  padding: theme.spacing(4),
  backgroundColor: "#f8f9fa",
  overflowY: "auto",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ResultContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  backgroundColor: "#fff",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ScoreCircle = styled(CircularProgress)(({ theme, value }) => ({
  color: value >= 80 ? "#4caf50" : value >= 50 ? "#fc7a46" : "#f44336",
  "& .MuiCircularProgress-circle": {
    strokeLinecap: "round",
  },
  animation: `${pulse} 1.5s infinite ease-in-out`,
  position: "relative",
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontWeight: "bold",
  color: "#0c83c8",
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 15,
  background: "linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)",
  color: "white",
  padding: theme.spacing(1.5, 4),
  fontWeight: "bold",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: "linear-gradient(135deg, #0a6eaa 0%, #085d96 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 15px rgba(12, 131, 200, 0.3)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 3),
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 15,
  textAlign: "center",
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

const TestResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  // Fetch result data from location.state or localStorage
  useEffect(() => {
    const fetchResultData = () => {
      try {
        // First, try to get result from location.state (passed from McqTest.jsx)
        const stateResult = location.state?.resultData;
        let parsedResult = null;

        if (stateResult) {
          parsedResult = stateResult;
          // Save to localStorage to ensure persistence
          localStorage.setItem("testResult", JSON.stringify(parsedResult));
          console.log("Loaded test result from location.state:", parsedResult);
        } else {
          // Fallback to localStorage
          const storedResult = localStorage.getItem("testResult");
          if (!storedResult) {
            throw new Error("No test result found");
          }
          parsedResult = JSON.parse(storedResult);
          console.log("Loaded test result from localStorage:", parsedResult);
        }

        // Validate essential fields
        if (
          !parsedResult ||
          !parsedResult.testName ||
          !parsedResult.result_test_id ||
          typeof parsedResult.result_score !== "number" ||
          typeof parsedResult.result_total_score !== "number"
        ) {
          throw new Error("Invalid or incomplete test result data");
        }

        setResultData(parsedResult);
      } catch (error) {
        console.error("Error loading test result:", error);
        setSnackbarMessage(error.message || "Failed to load test results");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        // Redirect to dashboard after showing error
        setTimeout(() => {
          navigate("/landing", { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
  }, [navigate, location.state]);

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    console.log("Navigating back to dashboard");
    // Clear test result from localStorage to prevent stale data
    localStorage.removeItem("testResult");
    navigate("/landing", { replace: true });
  };

  if (loading) {
    return (
      <FullScreenCard>
        <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={60} thickness={5} sx={{ color: "#0c83c8" }} />
              <Typography variant="h5" sx={{ mt: 2, color: "#0c83c8", fontWeight: "bold" }}>
                Loading Results...
              </Typography>
            </Box>
          </Fade>
        </Box>
      </FullScreenCard>
    );
  }

  if (!resultData) {
    return null; // Snackbar will handle error and redirect
  }

  const scorePercentage = resultData.result_total_score
    ? ((resultData.result_score / resultData.result_total_score) * 100).toFixed(2)
    : 0;

  // Determine if test was auto-submitted due to malpractice
  const wasAutoSubmitted = resultData.malpracticeCount > 0;

  return (
    <FullScreenCard>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
        <Zoom in={true} timeout={500}>
          <ResultContainer elevation={3}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#0c83c8",
                mb: 2,
                textAlign: "center",
                background: "linear-gradient(90deg, #0c83c8 0%, #0a6eaa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {resultData.testName} - Test Results
            </Typography>

            {wasAutoSubmitted && (
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#f44336", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <WarningIcon sx={{ mr: 1 }} />
                  Test Auto-Submitted Due to Malpractice
                </Typography>
              </Box>
            )}

            <Typography
              variant="subtitle1"
              sx={{ textAlign: "center", color: "#0c83c8", mb: 4 }}
            >
              Completed by {resultData.studentName || "Unknown"}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4, position: "relative" }}>
              <ScoreCircle variant="determinate" value={scorePercentage} size={150} thickness={5} />
              <ScoreText variant="h5">{scorePercentage}%</ScoreText>
            </Box>

            <Typography
              variant="h6"
              sx={{ textAlign: "center", color: "#0c83c8", mb: 3, fontWeight: "bold" }}
            >
              Score: {resultData.result_score} / {resultData.result_total_score}
            </Typography>

            <Grid container spacing={3}>
              {/* User and Test Info */}
              <Grid item xs={12} sm={6}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    User ID
                  </Typography>
                  <Typography variant="body1">{resultData.result_user_id || "N/A"}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Test ID
                  </Typography>
                  <Typography variant="body1">{resultData.result_test_id || "N/A"}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Test Language
                  </Typography>
                  <Typography variant="body1">{resultData.testLanguage || "N/A"}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    POC ID
                  </Typography>
                  <Typography variant="body1">{resultData.result_poc_id || "N/A"}</Typography>
                </StatCard>
              </Grid>

              {/* MCQ Statistics */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#0c83c8", mt: 3, mb: 2 }}
                >
                  MCQ Performance
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Answered
                  </Typography>
                  <Typography variant="body1">{resultData.mcqAnswered || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Not Answered
                  </Typography>
                  <Typography variant="body1">{resultData.mcqNotAnswered || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Not Visited
                  </Typography>
                  <Typography variant="body1">{resultData.mcqNotVisited || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Correct
                  </Typography>
                  <Typography variant="body1">{resultData.mcqCorrect || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Wrong
                  </Typography>
                  <Typography variant="body1">{resultData.mcqWrong || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Marked for Review
                  </Typography>
                  <Typography variant="body1">{resultData.marked || 0}</Typography>
                </StatCard>
              </Grid>

              {/* Coding Statistics */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#0c83c8", mt: 3, mb: 2 }}
                >
                  Coding Performance
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Answered
                  </Typography>
                  <Typography variant="body1">{resultData.codingAnswered || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Not Answered
                  </Typography>
                  <Typography variant="body1">{resultData.codingNotAnswered || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Not Visited
                  </Typography>
                  <Typography variant="body1">{resultData.codingNotVisited || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Correct
                  </Typography>
                  <Typography variant="body1">{resultData.codingCorrect || 0}</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                    Wrong
                  </Typography>
                  <Typography variant="body1">{resultData.codingWrong || 0}</Typography>
                </StatCard>
              </Grid>

              {/* Malpractice */}
              <Grid item xs={12}>
                <StatCard sx={{ mt: 3, background: resultData.malpracticeCount > 0 ? "rgba(244, 67, 54, 0.1)" : "inherit" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0c83c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <WarningIcon sx={{ mr: 1, color: resultData.malpracticeCount > 0 ? "#f44336" : "#0c83c8" }} />
                    Malpractice Count
                  </Typography>
                  <Typography variant="body1" sx={{ color: resultData.malpracticeCount > 0 ? "#f44336" : "inherit" }}>
                    {resultData.malpracticeCount || 0}
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <PrimaryButton
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </PrimaryButton>
            </Box>
          </ResultContainer>
        </Zoom>
      </Box>
    </FullScreenCard>
  );
};

export default TestResult;