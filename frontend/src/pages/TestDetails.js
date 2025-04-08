import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
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
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import {
  Language as LanguageIcon,
  EmojiEvents as ScoreIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as ArrowBackIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
  CheckCircleOutline as CheckIcon,
} from "@mui/icons-material";
import { getTestById } from "../axios"; // Import from apiService

// Create a custom theme with improved typography
const theme = createTheme({
  typography: {
    fontFamily: ["Inter", "Roboto", '"Segoe UI"', "Arial", "sans-serif"].join(","),
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "none",
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  palette: {
    primary: {
      main: "#0c83c8",
      light: "#3a9bd7",
      dark: "#096ba3",
    },
    secondary: {
      main: "#fc7a46",
      light: "#fd9469",
      dark: "#e56a3a",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
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
    "& .MuiButton-endIcon": {
      transform: "translateX(4px)",
    },
    "& .MuiButton-startIcon": {
      transform: "translateX(-4px)",
    },
  },
  "& .MuiButton-endIcon, & .MuiButton-startIcon": {
    transition: "transform 0.2s ease",
  },
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

const SecondaryIconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.main,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  gap: theme.spacing(2),
}));

const TestDetails = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        const data = await getTestById(testId);
        setTestData(data);
      } catch (err) {
        console.error("Failed to fetch test data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  const handleProceed = () => {
    navigate(`/mcq/${testId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderLoading = () => (
    <LoadingContainer>
      <CircularProgress
        size={48}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          animationDuration: "1.2s",
        }}
      />
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{
          opacity: 0.8,
          animation: "pulse 1.5s infinite ease-in-out",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.8 },
            "50%": { opacity: 0.5 },
          },
        }}
      >
        Loading test details...
      </Typography>
    </LoadingContainer>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderLoading()}
      </ThemeProvider>
    );
  }

  if (!testData) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
            <Typography variant="h6" gutterBottom>
              Unable to load test details
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              We couldn't retrieve the test details. Please check your connection and try again.
            </Typography>
            <AnimatedButton variant="outlined" color="primary" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Retry
            </AnimatedButton>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

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
            <Box sx={{ mb: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <Box>
                <Chip
                  label="Test Details"
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
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {testData.test_name}
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 0 }}>
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
                        {testData.test_language}
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
                        {testData.test_total_score} points
                      </Typography>
                    </Box>
                  </InfoCard>
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mt: 2,
                  mb: 2,
                }}
              >
                Test Components
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0}>
                    <IconWrapper>
                      <QuizIcon />
                    </IconWrapper>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        MCQ Questions
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {testData.test_mcq_id?.length || 0} questions
                        </Typography>
                        {(testData.test_mcq_id?.length || 0) > 0 && (
                          <Chip
                            size="small"
                            label="Included"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              ml: 1,
                            }}
                            icon={<CheckIcon style={{ fontSize: 16 }} />}
                          />
                        )}
                      </Box>
                    </Box>
                  </InfoCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoCard elevation={0}>
                    <SecondaryIconWrapper>
                      <CodeIcon />
                    </SecondaryIconWrapper>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                        Coding Tasks
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {testData.test_coding_id?.length || 0} tasks
                        </Typography>
                        {(testData.test_coding_id?.length || 0) > 0 && (
                          <Chip
                            size="small"
                            label="Included"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              ml: 1,
                            }}
                            icon={<CheckIcon style={{ fontSize: 16 }} />}
                          />
                        )}
                      </Box>
                    </Box>
                  </InfoCard>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    mb: 2,
                  }}
                >
                  Test Overview
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  This assessment consists of multiple-choice questions and coding challenges designed to evaluate your
                  proficiency in {testData.test_language}. The test is timed, and your performance will be scored based
                  on accuracy and completion time.
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                  Click "Proceed to MCQ" to begin the multiple-choice section of the assessment.
                </Typography>
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
            <AnimatedButton
              variant="outlined"
              color="primary"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
              }}
            >
              Back
            </AnimatedButton>
            <AnimatedButton
              variant="contained"
              color="secondary"
              onClick={handleProceed}
              endIcon={<ArrowIcon />}
              disableElevation
              sx={{
                px: isSmallScreen ? 3 : 4,
                py: isSmallScreen ? 1 : 1.5,
                color: "#ffffff",
              }}
            >
              Proceed to MCQ
            </AnimatedButton>
          </CardActions>
        </AnimatedCard>
      </Box>
    </ThemeProvider>
  );
};

export default TestDetails;