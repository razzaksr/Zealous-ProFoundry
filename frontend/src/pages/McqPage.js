import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
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
import {
  Timer as TimerIcon,
  CheckCircle as CheckIcon,
  Flag as FlagIcon,
  ArrowForward as ArrowIcon,
  ExitToApp as ExitIcon,
} from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";
import { getTestById, getMcqById, submitTestResult } from "../axios";

// Create a custom theme
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
const QuestionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
}));

const SidebarPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
}));

const QuestionNumberChip = styled(Chip)(({ theme, status }) => ({
  margin: theme.spacing(0.5),
  width: 40,
  height: 40,
  borderRadius: "50%",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  ...(status === "answered" && {
    backgroundColor: alpha(theme.palette.success.main, 0.2),
    color: theme.palette.success.main,
    "&:hover": { backgroundColor: alpha(theme.palette.success.main, 0.3) },
  }),
  ...(status === "marked" && {
    backgroundColor: alpha(theme.palette.warning.main, 0.2),
    color: theme.palette.warning.main,
    "&:hover": { backgroundColor: alpha(theme.palette.warning.main, 0.3) },
  }),
  ...(status === "notAnswered" && {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    color: theme.palette.primary.main,
    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.3) },
  }),
  ...(status === "notVisited" && {
    backgroundColor: alpha(theme.palette.grey[500], 0.2),
    color: theme.palette.grey[500],
    "&:hover": { backgroundColor: alpha(theme.palette.grey[500], 0.3) },
  }),
}));

const TimerBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const McqPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [mcqData, setMcqData] = useState([]);
  const [codingIds, setCodingIds] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState([]);
  const [testResult, setTestResult] = useState({});
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: "", onConfirm: null });
  const [isInitialized, setIsInitialized] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState("");
  const [pocId, setPocId] = useState("");
  const timerRef = useRef(null);
  const isSubmitting = useRef(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Shuffle array utility
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize test data and progress
  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);

        // Load user data
        const storedUser = localStorage.getItem("true");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setStudentName(user.user.full_name);
          setUserId(user.user.user_id);
          setPocId(user.user.mod_poc_id?.mod_poc_id);
        }

        // Fetch test data
        const test = await getTestById(testId);
        setTestData(test);

        // Shuffle and store coding IDs
        let shuffledCodingIds = test.test_coding_id?.length ? shuffleArray(test.test_coding_id) : [];
        localStorage.setItem("shuffled_coding_ids", JSON.stringify(shuffledCodingIds));
        setCodingIds(shuffledCodingIds);

        // Fetch and shuffle MCQ data
        const mcqPromises = test.test_mcq_id.map((id) => getMcqById(id));
        const mcqResults = await Promise.all(mcqPromises);
        const shuffledMcq = shuffleArray(mcqResults.map((mcq) => ({
          ...mcq,
          mcq_options: shuffleArray(mcq.mcq_options),
        })));
        setMcqData(shuffledMcq);

        // Load or initialize progress
        const savedProgress = JSON.parse(localStorage.getItem("test_progress")) || [];
        const initialProgress = shuffledMcq.map((mcq) => ({
          mcq_id: mcq.mcq_id,
          selected_option: null,
          marked: false,
          visited: false,
        }));
        const mergedProgress = initialProgress.map((init) => {
          const saved = savedProgress.find((p) => p.mcq_id === init.mcq_id);
          return saved || init;
        });
        setProgress(mergedProgress);

        // Load or initialize timer
        const savedTimer = localStorage.getItem("test_timer");
        const totalTime = (test.test_mcq_id.length * 60) + ((test.test_coding_id?.length || 0) * 600);
        setTimer(savedTimer ? parseInt(savedTimer) : totalTime);

        // Load or initialize test result
        const savedResult = JSON.parse(localStorage.getItem("test_result")) || {};
        setTestResult(savedResult);

        setIsInitialized(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setDialog({ open: true, type: "error", message: "Failed to load test data", onConfirm: () => navigate("/test-result") });
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [testId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!isInitialized || timer <= 0) {
      if (timer <= 0 && isInitialized) handleSubmitTest();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1;
        localStorage.setItem("test_timer", newTime);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timer, isInitialized]);

  // Enhanced malpractice prevention
  useEffect(() => {
    if (!isInitialized) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        console.log("Malpractice: Exited fullscreen");
        setDialog({ open: true, type: "malpractice", message: "Fullscreen mode required. Test will be submitted.", onConfirm: handleSubmitTest });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Malpractice: Tab switched");
        setTimeout(() => {
          if (document.hidden) {
            setDialog({ open: true, type: "malpractice", message: "Tab switching detected. Test will be submitted.", onConfirm: handleSubmitTest });
          }
        }, 1000);
      }
    };

    const preventCopyPaste = (e) => {
      e.preventDefault();
      console.log("Malpractice: Copy/paste attempted");
      setDialog({ open: true, type: "malpractice", message: "Copy-paste is disabled. Test will be submitted.", onConfirm: handleSubmitTest });
    };

    const preventRightClick = (e) => {
      e.preventDefault();
      console.log("Malpractice: Right-click attempted");
      setDialog({ open: true, type: "malpractice", message: "Right-click is disabled. Test will be submitted.", onConfirm: handleSubmitTest });
    };

    const preventDevTools = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        console.log("Malpractice: Dev tools attempted");
        setDialog({ open: true, type: "malpractice", message: "Developer tools are disabled. Test will be submitted.", onConfirm: handleSubmitTest });
      }
    };

    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          await document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen request failed:", error);
        setDialog({ open: true, type: "malpractice", message: "Please enable fullscreen to continue. Test will be submitted.", onConfirm: handleSubmitTest });
      }
    };

    setTimeout(requestFullscreen, 5000);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventDevTools);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventDevTools);
    };
  }, [isInitialized]);

  // Save progress and test result on change
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem("test_progress", JSON.stringify(progress));

    const answeredCount = progress.filter((p) => p.selected_option).length;
    const markedCount = progress.filter((p) => p.marked).length;
    const notAnsweredCount = progress.filter((p) => !p.selected_option && p.visited).length;
    const notVisitedCount = progress.filter((p) => !p.visited).length;
    let mcqScore = 0;
    let wrongAnswersCount = 0;

    progress.forEach((p) => {
      const question = mcqData.find((q) => q.mcq_id === p.mcq_id);
      if (p.selected_option && p.selected_option === question?.mcq_answer) {
        mcqScore += 1;
      } else if (p.selected_option) {
        wrongAnswersCount += 1;
      }
    });

    const updatedResult = {
      result_user_id: userId || "",
      result_test_id: testId,
      result_score: mcqScore,
      result_total_score: testData?.test_mcq_id.length + (testData?.test_coding_id?.length || 0) * 10,
      result_poc_id: pocId || "",
      studentName,
      testName: testData?.test_name || "",
      testLanguage: testData?.test_language || "",
      codingIds,
      codingAnswered: 0,
      codingNotAnswered: testData?.test_coding_id?.length || 0,
      codingNotVisited: testData?.test_coding_id?.length || 0,
      codingCorrect: 0,
      codingWrong: 0,
      mcqAnswered: answeredCount,
      mcqCorrect: mcqScore,
      mcqWrong: wrongAnswersCount,
      mcqNotAnswered: notAnsweredCount,
      mcqNotVisited: notVisitedCount,
      marked: markedCount,
    };

    setTestResult(updatedResult);
    localStorage.setItem("test_result", JSON.stringify(updatedResult));
  }, [progress, testData, userId, pocId, studentName, testId, mcqData, isInitialized, codingIds]);

  // Handle option selection
  const handleOptionChange = (option) => {
    setProgress((prev) =>
      prev.map((item, index) =>
        index === currentQuestion
          ? { ...item, selected_option: option, visited: true }
          : item
      )
    );
  };

  // Handle marking question
  const handleMarkQuestion = () => {
    setProgress((prev) =>
      prev.map((item, index) =>
        index === currentQuestion
          ? { ...item, marked: !item.marked, visited: true }
          : item
      )
    );
  };

  // Navigate to question
  const handleQuestionNavigation = (index) => {
    setProgress((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, visited: true } : item
      )
    );
    setCurrentQuestion(index);
  };

  // Submit test
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      console.log("Submitting test...");
      const resultData = JSON.parse(localStorage.getItem("test_result")) || testResult;
      await submitTestResult(resultData);
      console.log("Test submitted successfully");

      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      navigate("/test-result");
    } catch (error) {
      console.error("Submission error:", error);
      setDialog({ open: true, type: "error", message: "Failed to submit test. Please try again.", onConfirm: () => setDialog({ open: false }) });
    } finally {
      isSubmitting.current = false;
    }
  }, [testResult, navigate]);

  // Handle proceed to coding with warning
  const handleProceedToCoding = () => {
    if (codingIds.length === 0) {
      setDialog({
        open: true,
        type: "error",
        message: "No coding problems available for this test.",
        onConfirm: () => setDialog({ open: false }),
      });
      return;
    }
    setDialog({
      open: true,
      type: "proceed",
      message: "Once you proceed to the coding section, you cannot return to the MCQ section. Do you want to continue?",
      onConfirm: () => {
        navigate(`/coding/${codingIds[0]}`);
        setDialog({ open: false });
      },
    });
  };

  // Handle submit test with warning
  const handleSubmitTestWithWarning = () => {
    setDialog({
      open: true,
      type: "submit",
      message: "Submitting the test is final. You cannot make further changes. Do you want to submit?",
      onConfirm: handleSubmitTest,
    });
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Calculate question status counts
  const answeredCount = progress.filter((p) => p.selected_option).length;
  const markedCount = progress.filter((p) => p.marked).length;
  const notAnsweredCount = progress.filter((p) => !p.selected_option && p.visited).length;
  const notVisitedCount = progress.filter((p) => !p.visited).length;

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if last question is answered
  const isLastQuestionAnswered = currentQuestion === mcqData.length - 1 && progress[currentQuestion]?.selected_option;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialog.type === "malpractice" ? "Malpractice Detected" : dialog.type === "error" ? "Error" : "Warning"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {dialog.type === "proceed" || dialog.type === "submit" ? (
            <>
              <Button onClick={() => setDialog({ open: false })} color="primary">
                Stay in MCQ
              </Button>
              <Button onClick={dialog.onConfirm} color="secondary" autoFocus>
                {dialog.type === "proceed" ? "Proceed to Coding" : "Submit Test"}
              </Button>
            </>
          ) : (
            <Button onClick={dialog.onConfirm} color="primary" autoFocus>
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <AppBar position="fixed" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {testData.test_name}
          </Typography>
          <TimerBox>
            <TimerIcon />
            <Typography variant="subtitle1">{formatTime(timer)}</Typography>
          </TimerBox>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 8, p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <QuestionPaper elevation={3}>
              <Typography variant="h6" gutterBottom>
                Question {currentQuestion + 1}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
                {mcqData[currentQuestion]?.mcq_question}
              </Typography>
              
              <RadioGroup
                value={progress[currentQuestion]?.selected_option || ""}
                onChange={(e) => handleOptionChange(e.target.value)}
                sx={{ mb: 3 }}
              >
                {mcqData[currentQuestion]?.mcq_options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    sx={{ mb: 1, "& .MuiFormControlLabel-label": { fontSize: "1rem" } }}
                  />
                ))}
              </RadioGroup>

              <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <AnimatedButton
                  variant="outlined"
                  color="primary"
                  onClick={handleMarkQuestion}
                  startIcon={<FlagIcon />}
                >
                  {progress[currentQuestion]?.marked ? "Unmark" : "Mark for Review"}
                </AnimatedButton>
                
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {currentQuestion > 0 && !isLastQuestionAnswered && (
                    <AnimatedButton
                      variant="outlined"
                      color="primary"
                      onClick={() => handleQuestionNavigation(currentQuestion - 1)}
                    >
                      Previous
                    </AnimatedButton>
                  )}
                  {currentQuestion < mcqData.length - 1 ? (
                    <AnimatedButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleQuestionNavigation(currentQuestion + 1)}
                      endIcon={<ArrowIcon />}
                    >
                      Next
                    </AnimatedButton>
                  ) : (
                    isLastQuestionAnswered && (
                      <AnimatedButton
                        variant="contained"
                        color="primary"
                        onClick={testData.test_coding_id?.length > 0 ? handleProceedToCoding : handleSubmitTestWithWarning}
                        endIcon={<ArrowIcon />}
                      >
                        Proceed
                      </AnimatedButton>
                    )
                  )}
                </Box>
              </Box>
            </QuestionPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <SidebarPaper elevation={3}>
              <Typography variant="h6" gutterBottom>
                Question Palette
              </Typography>
              
              <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap" }}>
                {progress.map((item, index) => (
                  <QuestionNumberChip
                    key={index}
                    label={index + 1}
                    status={
                      item.selected_option
                        ? "answered"
                        : item.marked
                        ? "marked"
                        : item.visited
                        ? "notAnswered"
                        : "notVisited"
                    }
                    onClick={() => handleQuestionNavigation(index)}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Status Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CheckIcon color="success" />
                  <Typography variant="body2">
                    Answered: {answeredCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <FlagIcon color="warning" />
                  <Typography variant="body2">
                    Marked: {markedCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <TimerIcon color="primary" />
                  <Typography variant="body2">
                    Not Answered: {notAnsweredCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ExitIcon color="disabled" />
                  <Typography variant="body2">
                    Not Visited: {notVisitedCount}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
                <AnimatedButton
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmitTestWithWarning}
                  fullWidth
                >
                  Submit Test
                </AnimatedButton>
                {testData.test_coding_id?.length > 0 && (
                  <AnimatedButton
                    variant="contained"
                    color="primary"
                    onClick={handleProceedToCoding}
                    endIcon={<ArrowIcon />}
                    fullWidth
                  >
                    Proceed to Coding
                  </AnimatedButton>
                )}
              </Box>
            </SidebarPaper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default McqPage;