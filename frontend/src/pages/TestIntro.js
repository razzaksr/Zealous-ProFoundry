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
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import {
  Language as LanguageIcon,
  EmojiEvents as ScoreIcon,
  ArrowForward as ArrowIcon,
  Info as InfoIcon,
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

// Custom styled components (unchanged)
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
  },
  "& .MuiButton-endIcon": {
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

const InstructionItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "translateX(4px)",
  },
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
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const data = await getTestById(testId);
        console.log("Test data:", testId);
        setTestData(data);
      } catch (err) {
        console.error("Error fetching test data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  const handleStart = () => {
    navigate(`/test-details/${testId}`);
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
        Loading test information...
      </Typography>
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
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
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
          We couldn't retrieve the test details. Please check your connection and try again.
        </Typography>
        <AnimatedButton variant="outlined" color="primary" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </AnimatedButton>
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

  if (!testData) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderError()}
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
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Assessment"
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

              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
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
                        primaryTypographyProps={{
                          variant: "body1",
                          sx: { fontWeight: 400 },
                        }}
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
              <CheckIcon
                fontSize="small"
                sx={{
                  color: theme.palette.success.main,
                  mr: 1,
                  opacity: 0.8,
                }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                Ready to begin
              </Typography>
            </Box>
            <AnimatedButton
              variant="contained"
              color="primary"
              onClick={handleStart}
              endIcon={<ArrowIcon />}
              disableElevation
              sx={{
                px: isSmallScreen ? 3 : 4,
                py: isSmallScreen ? 1 : 1.5,
              }}
            >
              Start Test
            </AnimatedButton>
          </CardActions>
        </AnimatedCard>
      </Box>
    </ThemeProvider>
  );
};

export default TestIntro;