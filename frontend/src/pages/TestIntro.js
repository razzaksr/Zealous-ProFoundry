import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Paper,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tooltip,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import {
  Language as LanguageIcon,
  EmojiEvents as ScoreIcon,
  ArrowForward as ArrowIcon,
  Info as InfoIcon,
  CheckCircleOutline as CheckIcon,
  ArrowBack as PreviousIcon,
  ArrowForward as NextIcon,
} from "@mui/icons-material";
import { getTestById, fetchTestsToday, checkIfTestTaken } from "../axios";

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: ["Inter", "Roboto", '"Segoe UI"', "Arial", "sans-serif"].join(","),
    h1: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    button: { fontWeight: 600, letterSpacing: "0.02em", textTransform: "none" },
    subtitle1: { fontWeight: 500 },
    body1: { lineHeight: 1.6 },
  },
  palette: {
    primary: { main: "#0c83c8", light: "#3a9bd7", dark: "#096ba3" },
    secondary: { main: "#fc7a46", light: "#fd9469", dark: "#e56a3a" },
    background: { default: "#f5f7fa" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, padding: "10px 24px", boxShadow: "none" } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } } },
  },
});

// Custom styled components
const AnimatedCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 16px 70px rgba(0, 0, 0, 0.12)",
  },
}));

const ColorBar = styled(Box)(({ theme }) => ({
  height: 6,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    "& .MuiButton-endIcon": { transform: "translateX(4px)" },
  },
  "& .MuiButton-endIcon": { transition: "transform 0.2s ease" },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%)",
    transform: "translateX(-100%)",
  },
  "&:hover::after": {
    transition: "transform 1s ease",
    transform: "translateX(100%)",
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  borderRadius: 12,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const InstructionItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  transition: "transform 0.2s ease",
  "&:hover": { transform: "translateX(4px)" },
}));

const InstructionNumber = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.main,
  fontWeight: "bold",
  fontSize: 14,
  marginRight: theme.spacing(2),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  gap: theme.spacing(2),
}));

const TestIntro = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testsData, setTestsData] = useState([]); // Array of test details
  const [selectedTestId, setSelectedTestId] = useState(testId || "");
  const [selectedTestData, setSelectedTestData] = useState(null);
  const [hasTakenTest, setHasTakenTest] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [error, setError] = useState(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Timeout wrapper for API calls
  const withTimeout = (promise, ms = 10000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms))
    ]);
  };

  // Cache management
  const CACHE_KEY = "tests_today_cache";
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const getCachedData = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL && Array.isArray(data)) {
          console.log("Using cached test data:", data);
          return data;
        }
      } catch (error) {
        console.error("Invalid cache data, clearing cache:", error);
        localStorage.removeItem(CACHE_KEY);
      }
    }
    return null;
  };

  const setCachedData = (data) => {
    if (Array.isArray(data)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      console.log("Cached test data:", data);
    }
  };

  useEffect(() => {
    const fetchUserData = () => {
      const storedUser = localStorage.getItem("true");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const pocId = userData?.user?.mod_poc_id?.mod_poc_id || null;
          const userId = userData?.user?.user_id || null;
          if (!pocId || !userId) {
            console.error("No valid POC ID or User ID found in user data:", userData);
            setError("Invalid user session: Missing POC ID or User ID");
            setLoading(false);
            return null;
          }
          console.log("Fetched POC ID:", pocId, "User ID:", userId);
          setUserId(userId);
          return pocId;
        } catch (error) {
          console.error("Error parsing user data:", error);
          setError("Failed to parse user data");
          setLoading(false);
          return null;
        }
      }
      console.error("No user session found in localStorage");
      setError("No user session found");
      setLoading(false);
      return null;
    };

    const fetchTests = async () => {
      const pocId = fetchUserData();
      if (!pocId) return;

      try {
        let activeTests = getCachedData();
        if (!activeTests) {
          console.log("Fetching tests for POC ID:", pocId);
          const testsData = await withTimeout(fetchTestsToday(pocId));
          console.log("Today's tests data:", testsData);

          if (testsData && typeof testsData === "object" && Array.isArray(testsData.test_ids)) {
            // Map test_ids to fetch details
            activeTests = [];
            const testDetailsPromises = testsData.test_ids.map(async (testId) => {
              try {
                const testDetails = await withTimeout(getTestById(testId));
                console.log(`Test details for ${testId}:`, testDetails);
                if (testDetails?.status === "active") {
                  return testDetails;
                }
                console.warn(`Test ${testId} is not active or invalid:`, testDetails);
                return null;
              } catch (err) {
                console.error(`Failed to fetch details for test ${testId}:`, err.message);
                return null;
              }
            });

            const testDetails = await Promise.all(testDetailsPromises);
            activeTests = testDetails.filter(test => test !== null);

            // Check URL testId if not in test_ids
            if (testId && !testsData.test_ids.includes(testId)) {
              try {
                const testDetails = await withTimeout(getTestById(testId));
                console.log(`Fallback test data for ${testId}:`, testDetails);
                if (testDetails?.status === "active") {
                  activeTests.push(testDetails);
                } else {
                  console.warn(`Fallback test ${testId} is not active or invalid:`, testDetails);
                }
              } catch (err) {
                console.error(`Failed to fetch fallback test ${testId}:`, err.message);
              }
            }

            setCachedData(activeTests);
          } else {
            console.error("Expected test_ids array in response:", testsData);
            setError("Invalid server response: Expected test_ids array");
            activeTests = [];
          }
        }

        setTestsData(activeTests);

        // Set selected test
        if (activeTests.length > 0) {
          const selected = activeTests.find(test => test.test_id === testId) || activeTests[0];
          setSelectedTestId(selected.test_id);
          setSelectedTestData(selected);
          navigate(`/test-intro/${selected.test_id}`, { replace: true });
        } else {
          setError("No active tests available for today");
        }
      } catch (error) {
        console.error("Error fetching tests:", error.message);
        setError("Failed to fetch tests: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();

    // Timeout for loading state
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [testId, navigate]);

  useEffect(() => {
    const checkTestStatus = async () => {
      if (userId && selectedTestId) {
        try {
          const result = await withTimeout(checkIfTestTaken(userId, selectedTestId));
          console.log(`Check Test Response for ${selectedTestId}:`, result);
          setHasTakenTest(result.length > 0);
        } catch (error) {
          console.error(`Error checking test status for ${selectedTestId}:`, error);
          setHasTakenTest(false); // Assume not taken on error
        }
      }
    };

    checkTestStatus();
  }, [userId, selectedTestId]);

  const handleTestNavigation = (direction) => {
    const currentIndex = testsData.findIndex(test => test.test_id === selectedTestId);
    let newIndex;

    if (direction === "next") {
      newIndex = currentIndex + 1;
    } else {
      newIndex = currentIndex - 1;
    }

    if (newIndex >= 0 && newIndex < testsData.length) {
      const newTest = testsData[newIndex];
      setSelectedTestId(newTest.test_id);
      setSelectedTestData(newTest);
      navigate(`/test-intro/${newTest.test_id}`);
    }
  };

  const handleStart = () => {
    if (!hasTakenTest) {
      navigate(`/test-details/${selectedTestId}`);
    }
  };

  const handleBack = () => {
    navigate("/student-dashboard");
  };

  const renderLoading = () => (
    <LoadingContainer>
      <CircularProgress
        size={48}
        thickness={4}
        sx={{ color: theme.palette.primary.main, animationDuration: "1.2s" }}
      />
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{
          opacity: 0.8,
          animation: "pulse 1.5s infinite ease-in-out",
          "@keyframes pulse": { "0%, 100%": { opacity: 0.8 }, "50%": { opacity: 0.5 } },
        }}
      >
        Loading test information...
      </Typography>
      {loadingTimeout && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.warning.main, mt: 1, textAlign: "center", maxWidth: 300 }}
        >
          Taking longer than expected? Contact support at support@example.com.
        </Typography>
      )}
    </LoadingContainer>
  );

  const renderError = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={isSmallScreen ? 2 : 4}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: 500,
          borderRadius: 3,
          textAlign: "center",
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        }}
      >
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <InfoIcon color="error" sx={{ fontSize: 32 }} />
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom>
          Unable to load test information
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {error || "We couldn't retrieve the test details. Please check your connection and try again."}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <AnimatedButton variant="outlined" color="primary" onClick={() => window.location.reload()}>
            Retry
          </AnimatedButton>
          <AnimatedButton
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/student-dashboard")}
          >
            Back to Dashboard
          </AnimatedButton>
        </Box>
      </Paper>
    </Box>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderLoading()}
      </ThemeProvider>
    );
  }

  if (error || !testsData.length || !selectedTestData) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderError()}
      </ThemeProvider>
    );
  }

  const currentIndex = testsData.findIndex(test => test.test_id === selectedTestId);
  const isFirstTest = currentIndex === 0;
  const isLastTest = currentIndex === testsData.length - 1;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: isSmallScreen ? 2 : 4,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <AnimatedCard sx={{ width: "100%", maxWidth: 800 }}>
          <ColorBar />
          <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Chip
                  label={`Assessment ${currentIndex + 1} of ${testsData.length}`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 1.5,
                  }}
                />
                <Typography
                  variant={isSmallScreen ? "h5" : "h4"}
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {selectedTestData.test_name}
                </Typography>
              </Box>
              {testsData.length > 1 && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleTestNavigation("previous")}
                    disabled={isFirstTest}
                    startIcon={<PreviousIcon />}
                    sx={{ borderRadius: 8 }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleTestNavigation("next")}
                    disabled={isLastTest}
                    endIcon={<NextIcon />}
                    sx={{ borderRadius: 8 }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </Box>

            <CardContent sx={{ p: 0, mb: 3 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0}>
                    <IconWrapper>
                      <LanguageIcon />
                    </IconWrapper>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        Language
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {selectedTestData.test_language || "Unknown"}
                      </Typography>
                    </Box>
                  </InfoCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0}>
                    <IconWrapper>
                      <ScoreIcon />
                    </IconWrapper>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        Total Score
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {selectedTestData.test_total_score || 0} points
                      </Typography>
                    </Box>
                  </InfoCard>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  Instructions
                </Typography>
                <List disablePadding>
                  {[
                    "Ensure a stable internet connection during the test.",
                    "Do not refresh or close the browser once the test begins.",
                    "MCQ and coding questions are timed together as one test.",
                    "Click 'Start Test' to begin.",
                  ].map((instruction, index) => (
                    <InstructionItem key={index} disableGutters>
                      <InstructionNumber>{index + 1}</InstructionNumber>
                      <ListItemText
                        primary={instruction}
                        primaryTypographyProps={{ variant: "body1", sx: { fontWeight: 400 } }}
                      />
                    </InstructionItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Box>
          <Divider />
          <CardActions
            sx={{
              p: isSmallScreen ? 2 : 3,
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AnimatedButton
                variant="outlined"
                color="primary"
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back to Dashboard
              </AnimatedButton>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CheckIcon
                fontSize="small"
                sx={{ color: theme.palette.success.main, mr: 1, opacity: 0.8 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                {hasTakenTest ? "Test completed" : "Ready to begin"}
              </Typography>
              <Tooltip title={hasTakenTest ? "You have already taken this test" : ""}>
                <span>
                  <AnimatedButton
                    variant="contained"
                    color="primary"
                    onClick={handleStart}
                    endIcon={<ArrowIcon />}
                    disableElevation
                    disabled={hasTakenTest}
                    sx={{ ml: 2, px: isSmallScreen ? 3 : 4, py: isSmallScreen ? 1 : 1.5 }}
                  >
                    Start Test
                  </AnimatedButton>
                </span>
              </Tooltip>
            </Box>
          </CardActions>
        </AnimatedCard>
      </Box>
    </ThemeProvider>
  );
};

export default TestIntro;