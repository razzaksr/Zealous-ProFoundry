import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";

// Create a custom theme (matching McqPage.jsx)
const theme = createTheme({
  typography: {
    fontFamily: ["Inter", "Roboto", '"Segoe UI"', "Arial", "sans-serif"].join(","),
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  palette: {
    primary: { main: "#0c83c8" },
    secondary: { main: "#fc7a46" },
    success: { main: "#2e7d32" },
    warning: { main: "#f57c00" },
    background: { default: "#f5f7fa" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: "8px 16px" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

// Styled components
const ResultPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const TestResultPage = () => {
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, message: "", onConfirm: null });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch test result from localStorage
  useEffect(() => {
    const fetchResult = () => {
      try {
        setLoading(true);
        const savedResult = localStorage.getItem("test_result");
        if (!savedResult) {
          setDialog({
            open: true,
            message: "No test result found. Please take a test first.",
            onConfirm: () => navigate("/dashboard"),
          });
          return;
        }
        const parsedResult = JSON.parse(savedResult);
        if (!parsedResult.testName || !parsedResult.studentName) {
          setDialog({
            open: true,
            message: "Invalid test result data.",
            onConfirm: () => navigate("/dashboard"),
          });
          return;
        }
        setResultData(parsedResult);
      } catch (error) {
        console.error("Error fetching test result:", error);
        setDialog({
          open: true,
          message: "Failed to load test result.",
          onConfirm: () => navigate("/dashboard"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [navigate]);

  // Handle navigation to dashboard
  const handleBackToDashboard = () => {
    // Optionally clear localStorage to prevent stale data
    localStorage.removeItem("test_result");
    localStorage.removeItem("test_progress");
    localStorage.removeItem("test_timer");
    navigate("/dashboard");
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render result page
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialog.onConfirm} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <AppBar position="fixed" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Test Results
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 8, p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default }}>
        <ResultPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            {resultData?.testName} - Result
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Student: {resultData?.studentName}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Score
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {resultData?.result_score} / {resultData?.result_total_score} (
            {((resultData?.result_score / resultData?.result_total_score) * 100).toFixed(2)}%)
          </Typography>

          <Typography variant="h6" gutterBottom>
            MCQ Statistics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4}>
              <StatBox>
                <Typography variant="body2" color="success.main">
                  Correct
                </Typography>
                <Typography variant="h6">{resultData?.mcqCorrect}</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatBox>
                <Typography variant="body2" color="error.main">
                  Wrong
                </Typography>
                <Typography variant="h6">{resultData?.mcqWrong}</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatBox>
                <Typography variant="body2" color="primary.main">
                  Answered
                </Typography>
                <Typography variant="h6">{resultData?.mcqAnswered}</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatBox>
                <Typography variant="body2" color="warning.main">
                  Marked
                </Typography>
                <Typography variant="h6">{resultData?.marked}</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatBox>
                <Typography variant="body2" color="textSecondary">
                  Not Answered
                </Typography>
                <Typography variant="h6">{resultData?.mcqNotAnswered}</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatBox>
                <Typography variant="body2" color="textSecondary">
                  Not Visited
                </Typography>
                <Typography variant="h6">{resultData?.mcqNotVisited}</Typography>
              </StatBox>
            </Grid>
          </Grid>

          {resultData?.codingIds?.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Coding Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                  <StatBox>
                    <Typography variant="body2" color="success.main">
                      Correct
                    </Typography>
                    <Typography variant="h6">{resultData?.codingCorrect}</Typography>
                  </StatBox>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <StatBox>
                    <Typography variant="body2" color="error.main">
                      Wrong
                    </Typography>
                    <Typography variant="h6">{resultData?.codingWrong}</Typography>
                  </StatBox>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <StatBox>
                    <Typography variant="body2" color="primary.main">
                      Answered
                    </Typography>
                    <Typography variant="h6">{resultData?.codingAnswered}</Typography>
                  </StatBox>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">
                      Not Answered
                    </Typography>
                    <Typography variant="h6">{resultData?.codingNotAnswered}</Typography>
                  </StatBox>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">
                      Not Visited
                    </Typography>
                    <Typography variant="h6">{resultData?.codingNotVisited}</Typography>
                  </StatBox>
                </Grid>
              </Grid>
            </>
          )}

          <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
            <AnimatedButton
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </AnimatedButton>
          </Box>
        </ResultPaper>
      </Box>
    </ThemeProvider>
  );
};

export default TestResultPage;