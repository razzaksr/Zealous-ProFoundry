import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  IconButton,
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
  Info as InfoIcon,
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
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
          "&:hover": {
            backgroundColor: alpha("#0c83c8", 0.1),
          },
        },
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
  const { state } = useLocation();
  const [testData, setTestData] = useState(null);
  const [mcqData, setMcqData] = useState([]);
  const [codingIds, setCodingIds] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState([]);
  const [testResult, setTestResult] = useState({});
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: "", message: "", onConfirm: null });
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState("");
  const [pocId, setPocId] = useState("");
  const timerRef = useRef(null);
  const isSubmitting = useRef(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Default instructions if testData.test_instructions is not available
  const defaultInstructions = [
    "Read each question carefully before answering.",
    "Select one option for each multiple-choice question.",
    "Use the 'Mark for Review' button to revisit questions later.",
    "Click 'Next' to move to the next question or 'Previous' to go back.",
    "Do not refresh the page or navigate away, as this will submit the test.",
    "Ensure you remain in fullscreen mode throughout the test.",
    "Any attempt to copy, paste, open developer tools, or switch tabs will result in immediate test submission.",
    "Submit the test when you are ready, or proceed to the coding section if applicable.",
  ];

  // Shuffle array utility
  const shuffleArray = (array) => {
    if (!array || !Array.isArray(array)) return [];
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
        let userData = {};
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
            setStudentName(userData.user?.full_name || "");
            setUserId(userData.user?.user_id || "");
            setPocId(userData.user?.mod_poc_id?.mod_poc_id || "");
          } catch (error) {
            console.error("Failed to parse user data:", error);
          }
        }

        // Fetch test data
        const test = await getTestById(testId);
        if (!test) throw new Error("Test data not found");
        setTestData(test);

        // Load coding IDs
        let codingIds = test.test_coding_id?.length ? test.test_coding_id : [];
        const savedCodingIds = JSON.parse(localStorage.getItem("coding_ids") || "[]");
        if (savedCodingIds.length > 0) {
          codingIds = savedCodingIds;
        } else {
          localStorage.setItem("coding_ids", JSON.stringify(codingIds));
        }
        setCodingIds(codingIds);

        // Fetch and shuffle MCQ data
        const mcqPromises = (test.test_mcq_id || []).map((id) => getMcqById(id));
        const mcqResults = await Promise.all(mcqPromises);
        const shuffledMcq = shuffleArray(
          mcqResults.map((mcq) => ({
            ...mcq,
            mcq_options: shuffleArray(mcq.mcq_options || []),
          }))
        );
        setMcqData(shuffledMcq);

        // Load or initialize progress
        const savedProgress = JSON.parse(localStorage.getItem("test_progress") || "[]");
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
        const totalTime = (test.test_mcq_id?.length || 0) * 60 + (test.test_coding_id?.length || 0) * 600;
        setTimer(savedTimer ? parseInt(savedTimer, 10) : totalTime);

        // Load or initialize test result
        const savedResult = JSON.parse(localStorage.getItem("test_result") || "{}");
        const navigationResult = state || {};
        const updatedResult = {
          result_user_id: userData.user?.user_id || savedResult.result_user_id || navigationResult.result_user_id || "",
          result_test_id: testId,
          result_score: savedResult.result_score || navigationResult.result_score || 0,
          result_total_score:
            savedResult.result_total_score ||
            navigationResult.result_total_score ||
            (test.test_mcq_id?.length || 0) + (test.test_coding_id?.length || 0) * 10,
          result_poc_id: userData.user?.mod_poc_id?.mod_poc_id || savedResult.result_poc_id || navigationResult.result_poc_id || "",
          studentName: userData.user?.full_name || savedResult.studentName || navigationResult.studentName || "",
          testName: test.test_name || savedResult.testName || navigationResult.testName || "",
          testLanguage: test.test_language || savedResult.testLanguage || navigationResult.testLanguage || "",
          codingIds: savedResult.codingIds || navigationResult.codingIds || codingIds,
          codingAnswered: savedResult.codingAnswered || navigationResult.codingAnswered || 0,
          codingNotAnswered:
            savedResult.codingNotAnswered || navigationResult.codingNotAnswered || test.test_coding_id?.length || 0,
          codingNotVisited:
            savedResult.codingNotVisited || navigationResult.codingNotVisited || test.test_coding_id?.length || 0,
          codingCorrect: savedResult.codingCorrect || navigationResult.codingCorrect || 0,
          codingWrong: savedResult.codingWrong || navigationResult.codingWrong || 0,
          codingResults: savedResult.codingResults || navigationResult.codingResults || [],
          mcqAnswered: savedResult.mcqAnswered || navigationResult.mcqAnswered || 0,
          mcqCorrect: savedResult.mcqCorrect || navigationResult.mcqCorrect || 0,
          mcqWrong: savedResult.mcqWrong || navigationResult.mcqWrong || 0,
          mcqNotAnswered: savedResult.mcqNotAnswered || navigationResult.mcqNotAnswered || 0,
          mcqNotVisited: savedResult.mcqNotVisited || navigationResult.mcqNotVisited || test.test_mcq_id?.length || 0,
          marked: savedResult.marked || navigationResult.marked || 0,
          currentCodingIndex: savedResult.currentCodingIndex || navigationResult.currentCodingIndex || 0,
        };
        setTestResult(updatedResult);
        localStorage.setItem("test_result", JSON.stringify(updatedResult));

        // Clear browser history to prevent back navigation
        window.history.replaceState(null, null, `/mcq/${testId}`);
        window.history.pushState(null, null, `/mcq/${testId}`);
        window.history.pushState(null, null, `/mcq/${testId}`);

        setIsInitialized(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setDialog({
          open: true,
          type: "error",
          message: "Failed to load test data",
          onConfirm: () => {
            window.history.replaceState(null, null, "/test-result");
            navigate("/test-result");
          },
        });
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [testId, navigate, state]);

  // Timer countdown
  useEffect(() => {
    if (!isInitialized || timer <= 0) {
      if (timer <= 0 && isInitialized && !isSubmitting.current) {
        handleSubmitTest();
      }
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

  // Malpractice prevention and navigation blocking
  useEffect(() => {
    if (!isInitialized) return;

    // Prevent browser back navigation
    const handlePopState = () => {
      window.history.pushState(null, null, `/mcq/${testId}`);
      handleMalpractice("Attempted to navigate back using browser controls");
    };

    // Warn before leaving page
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Leaving the test will submit it automatically. Are you sure?";
      handleMalpractice("Attempted to close or refresh the page");
    };

    // Request and maintain fullscreen
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
        handleMalpractice("Failed to maintain fullscreen mode");
      }
    };

    // Handle fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isInitialized) {
        handleMalpractice("Exited fullscreen mode");
      }
    };

    // Handle visibility change (tab/window switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Malpractice: Tab/window switched");
        setTimeout(() => {
          if (document.hidden) {
            handleMalpractice("Tab/window switching detected");
          }
        }, 1000);
      }
    };

    // Prevent copy-paste
    const preventCopyPaste = (e) => {
      e.preventDefault();
      handleMalpractice("Copy/paste attempted");
    };

    // Prevent right-click
    const preventRightClick = (e) => {
      e.preventDefault();
      handleMalpractice("Right-click attempted");
    };

    // Prevent developer tools
    const preventDevTools = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        handleMalpractice("Attempted to open developer tools");
      }
    };

    // Detect mouse leaving window
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        handleMalpractice("Mouse moved outside test window");
      }
    };

    // Detect new tab/window opening
    const detectNewWindow = () => {
      handleMalpractice("Attempted to open a new tab or window");
    };

    // Handle malpractice by submitting test immediately
    const handleMalpractice = (message) => {
      setDialog({
        open: true,
        type: "malpractice",
        message: `Malpractice detected: ${message}. Test will be submitted.`,
        onConfirm: handleSubmitTest,
      });
    };

    // Add event listeners
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventDevTools);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", detectNewWindow);

    // Initial fullscreen request
    requestFullscreen();

    // Periodic fullscreen check
    const fullscreenCheckInterval = setInterval(() => {
      if (!document.fullscreenElement && isInitialized) {
        requestFullscreen();
      }
    }, 5000);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventDevTools);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("blur", detectNewWindow);
      clearInterval(fullscreenCheckInterval);
    };
  }, [isInitialized, testId]);

  // Save progress and test result on change
  useEffect(() => {
    if (!isInitialized || !testData || !mcqData) return;

    localStorage.setItem("test_progress", JSON.stringify(progress));

    const answeredCount = progress.filter((p) => p.selected_option).length;
    const markedCount = progress.filter((p) => p.marked).length;
    const notAnsweredCount = progress.filter((p) => !p.selected_option && p.visited).length;
    const notVisitedCount = progress.filter((p) => !p.visited).length;
    let mcqScore = 0;
    let wrongAnswersCount = 0;

    progress.forEach((p) => {
      const question = mcqData.find((q) => q.mcq_id === p.mcq_id);
      if (question && p.selected_option && p.selected_option === question.mcq_answer) {
        mcqScore += 1;
      } else if (p.selected_option) {
        wrongAnswersCount += 1;
      }
    });

    setTestResult((prev) => {
      const updatedResult = {
        ...prev,
        result_user_id: userId || prev.result_user_id || "",
        result_test_id: testId,
        result_score: mcqScore + (prev.codingResults?.reduce((sum, res) => sum + res.score, 0) || 0),
        result_total_score: (testData.test_mcq_id?.length || 0) + (testData.test_coding_id?.length || 0) * 10,
        result_poc_id: pocId || prev.result_poc_id || "",
        studentName: studentName || prev.studentName || "",
        testName: testData.test_name || prev.testName || "",
        testLanguage: testData.test_language || prev.testLanguage || "",
        codingIds: prev.codingIds || codingIds,
        codingAnswered: prev.codingAnswered || 0,
        codingNotAnswered: prev.codingNotAnswered || testData.test_coding_id?.length || 0,
        codingNotVisited: prev.codingNotVisited || testData.test_coding_id?.length || 0,
        codingCorrect: prev.codingCorrect || 0,
        codingWrong: prev.codingWrong || 0,
        codingResults: prev.codingResults || [],
        mcqAnswered: answeredCount,
        mcqCorrect: mcqScore,
        mcqWrong: wrongAnswersCount,
        mcqNotAnswered: notAnsweredCount,
        mcqNotVisited: notVisitedCount,
        marked: markedCount,
        currentCodingIndex: prev.currentCodingIndex || 0,
      };
      localStorage.setItem("test_result", JSON.stringify(updatedResult));
      return updatedResult;
    });
  }, [progress, testData, userId, pocId, studentName, testId, mcqData, isInitialized, codingIds]);

  // Handle option selection
  const handleOptionChange = (option) => {
    setProgress((prev) =>
      prev.map((item, index) =>
        index === currentQuestion ? { ...item, selected_option: option, visited: true } : item
      )
    );
  };

  // Handle marking question
  const handleMarkQuestion = () => {
    setProgress((prev) =>
      prev.map((item, index) =>
        index === currentQuestion ? { ...item, marked: !item.marked, visited: true } : item
      )
    );
  };

  // Navigate to question
  const handleQuestionNavigation = (index) => {
    if (index >= 0 && index < mcqData.length) {
      setProgress((prev) =>
        prev.map((item, idx) => (idx === index ? { ...item, visited: true } : item))
      );
      setCurrentQuestion(index);
    }
  };

  // Submit test
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      console.log("Submitting test...");
      const resultData = JSON.parse(localStorage.getItem("test_result") || "{}") || testResult;
      await submitTestResult(resultData);
      console.log("Test submitted successfully");

      if (document.exitFullscreen) {
        await document.exitFullscreen().catch((err) => console.error("Failed to exit fullscreen:", err));
      }

      window.history.replaceState(null, null, "/test-result");
      navigate("/test-result");
    } catch (error) {
      console.error("Submission error:", error);
      setDialog({
        open: true,
        type: "error",
        message: "Failed to submit test. You will be redirected to the results page.",
        onConfirm: () => {
          window.history.replaceState(null, null, "/test-result");
          navigate("/test-result");
        },
      });
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
        navigate(`/coding/${codingIds[0]}`, {
          state: {
            ...testResult,
            currentCodingIndex: 0,
            codingIds,
          },
        });
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

  // Handle instructions dialog open/close
  const handleOpenInstructions = () => {
    setInstructionsDialogOpen(true);
  };

  const handleCloseInstructions = () => {
    setInstructionsDialogOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render error if test data or MCQ data is missing
  if (!testData || mcqData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Test
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Unable to load test data. Please try again later.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.history.replaceState(null, null, "/test-result");
              navigate("/test-result");
            }}
          >
            Go to Results
          </Button>
        </Paper>
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

  // Prepare instructions content
  const instructions = testData.test_instructions
    ? Array.isArray(testData.test_instructions)
      ? testData.test_instructions
      : testData.test_instructions.split("\n").filter((line) => line.trim())
    : defaultInstructions;

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
          <DialogContentText id="alert-dialog-description">{dialog.message}</DialogContentText>
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

      <Dialog
        open={instructionsDialogOpen}
        onClose={handleCloseInstructions}
        aria-labelledby="instructions-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="instructions-dialog-title">Test Instructions</DialogTitle>
        <DialogContent>
          <Box component="ol" sx={{ pl: 3, mb: 0 }}>
            {instructions.map((instruction, index) => (
              <Typography key={index} component="li" variant="body1" sx={{ mb: 1 }}>
                {instruction}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstructions} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AppBar position="fixed" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {testData.test_name || "Test"}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleOpenInstructions}
            aria-label="View test instructions"
            sx={{ mr: 1 }}
          >
            <InfoIcon />
          </IconButton>
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
                {mcqData[currentQuestion]?.mcq_question || "Loading question..."}
              </Typography>

              <RadioGroup
                value={progress[currentQuestion]?.selected_option || ""}
                onChange={(e) => handleOptionChange(e.target.value)}
                sx={{ mb: 3 }}
              >
                {(mcqData[currentQuestion]?.mcq_options || []).map((option, index) => (
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
                  <Typography variant="body2">Answered: {answeredCount}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <FlagIcon color="warning" />
                  <Typography variant="body2">Marked: {markedCount}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <TimerIcon color="primary" />
                  <Typography variant="body2">Not Answered: {notAnsweredCount}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ExitIcon color="disabled" />
                  <Typography variant="body2">Not Visited: {notVisitedCount}</Typography>
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