import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogContent,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Typography,
  Tooltip,
  Stack,
  createTheme,
  ThemeProvider,
  useMediaQuery,
  alpha,
  styled,
  Switch,
} from "@mui/material";
import { Editor } from "@monaco-editor/react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CodeIcon from "@mui/icons-material/Code";
import JavaIcon from "@mui/icons-material/DeveloperMode";
import PythonIcon from "@mui/icons-material/Memory";
import CppIcon from "@mui/icons-material/IntegrationInstructions";
import CIcon from "@mui/icons-material/SettingsEthernet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import OutputIcon from "@mui/icons-material/Output";
import DoneIcon from "@mui/icons-material/Done";
import TerminalIcon from "@mui/icons-material/Terminal";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchCodeById, fetchTestCaseById, compileCode, submitTestResult, getTestById } from "../axios";

// Language mapping for backend
const languageApiMap = {
  python: "python3",
  java: "java",
  cpp: "cpp",
  c: "c",
};

// Material UI Switch for theme toggle
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

// Create themes with updated color palette
const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#0c83c8" },
      secondary: { main: "#fc7a46" },
      background: {
        default: mode === "dark" ? "#111827" : "#f9fafb",
        paper: mode === "dark" ? "#1f2937" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f3f4f6" : "#1f2937",
        secondary: mode === "dark" ? "#9ca3af" : "#6b7280",
      },
      success: { main: "#0c83c8" },
      error: { main: "#ef4444" },
      warning: { main: "#f59e0b" },
      info: { main: "#3b82f6" },
      divider: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: "none" },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: ${mode === "dark" ? "#1f2937" : "#f1f5f9"};
          }
          ::-webkit-scrollbar-thumb {
            background: ${mode === "dark" ? "#4b5563" : "#cbd5e1"};
            borderRadius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${mode === "dark" ? "#6b7280" : "#94a3b8"};
          }
          
          .resize-active * {
            user-select: none !important;
          }
          
          @media (max-width: 600px) {
            .monaco-editor .inputarea {
              font-size: 16px !important;
              line-height: normal !important;
            }
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "dark" ? "0 4px 12px rgba(12, 131, 200, 0.25)" : "0 4px 12px rgba(12, 131, 200, 0.15)",
            },
          },
          containedPrimary: {
            background: "#0c83c8",
            "&:hover": { background: "#095e8f" },
          },
          containedSecondary: {
            background: "#fc7a46",
            "&:hover": { background: "#e55e2c" },
          },
          outlined: { borderWidth: 1.5 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: mode === "dark" ? "0 4px 6px -1px rgba(0, 0, 0, 0.2)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "& fieldset": { borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)" },
              "&:hover fieldset": { borderColor: "#0c83c8" },
              "&.Mui-focused fieldset": { borderColor: "#0c83c8" },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease-in-out",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)" },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: mode === "dark" ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            borderRadius: 8,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            "& .MuiAlert-root": {
              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            },
          },
        },
      },
    },
  });
};

const CodingPage = () => {
  const { codeId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "dark");
  const theme = createAppTheme(mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Initialize from localStorage
  const [testId, setTestId] = useState(localStorage.getItem("test_id") || "");
  const [userId, setUserId] = useState("");
  const [pocId, setPocId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [timer, setTimer] = useState(parseInt(localStorage.getItem("test_timer")) || 0);
  const timerRef = useRef(null);

  // Test context from localStorage or state
  const savedTestResult = JSON.parse(localStorage.getItem("test_result")) || {};
  const [testResult, setTestResult] = useState({
    testMcqIds: savedTestResult.testMcqIds || state?.testMcqIds || [],
    testCodingIds: savedTestResult.testCodingIds || state?.testCodingIds || [],
    testTotalScore: savedTestResult.testTotalScore || state?.testTotalScore || 0,
    mcqScore: savedTestResult.mcqScore || state?.mcqScore || 0,
    testName: savedTestResult.testName || state?.testName || "",
    testLanguage: savedTestResult.testLanguage || state?.testLanguage || "",
    currentCodingIndex: savedTestResult.currentCodingIndex || state?.currentCodingIndex || 0,
    codingResults: savedTestResult.codingResults || state?.codingResults || [],
    codingAnswered: savedTestResult.codingAnswered || state?.codingAnswered || 0,
    codingNotAnswered: savedTestResult.codingNotAnswered || state?.codingNotAnswered || 0,
    codingNotVisited: savedTestResult.codingNotVisited || state?.codingNotVisited || 0,
    codingCorrect: savedTestResult.codingCorrect || state?.codingCorrect || 0,
    codingWrong: savedTestResult.codingWrong || state?.codingWrong || 0,
    studentName: savedTestResult.studentName || state?.studentName || "",
    mcqAnswered: savedTestResult.mcqAnswered || state?.mcqAnswered || 0,
    mcqCorrect: savedTestResult.mcqCorrect || state?.mcqCorrect || 0,
    mcqWrong: savedTestResult.mcqWrong || state?.mcqWrong || 0,
    mcqNotAnswered: savedTestResult.mcqNotAnswered || state?.mcqNotAnswered || 0,
    mcqNotVisited: savedTestResult.mcqNotVisited || state?.mcqNotVisited || 0,
    marked: savedTestResult.marked || state?.marked || 0,
    warningCount: savedTestResult.warningCount || state?.warningCount || 0,
    result_user_id: savedTestResult.result_user_id || state?.result_user_id || userId,
    result_test_id: savedTestResult.result_test_id || state?.result_test_id || testId,
    result_poc_id: savedTestResult.result_poc_id || state?.result_poc_id || pocId,

    
  });

  // Component state
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [showOutput, setShowOutput] = useState(true);
  const [outputMinimized, setOutputMinimized] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showTestCases, setShowTestCases] = useState(!isMobile);
  const [testCasesCollapsed, setTestCasesCollapsed] = useState(false);
  const [editorWidth, setEditorWidth] = useState(60);
  const [outputHeight, setOutputHeight] = useState(30);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [fetchedTestCodingIds, setFetchedTestCodingIds] = useState([]);
  const [malpracticeCount, setMalpracticeCount] = useState(testResult.warningCount);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isDraggingRef = useRef(false);
  const dividerRef = useRef(null);
  const outputDividerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Language templates
  const templates = {
    python: `print("Hello World")`,
    java: `import java.util.*;\npublic class Progman {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}`,
    c: `#include <stdio.h>\nint main() {\n\tprintf("Hello World");\n\treturn 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello World";\n\treturn 0;\n}`,
  };

  // Language icon mapping
  const languageIcons = {
    python: <PythonIcon fontSize="small" />,
    java: <JavaIcon fontSize="small" />,
    cpp: <CppIcon fontSize="small" />,
    c: <CIcon fontSize="small" />,
  };

  // Language display names
  const languageNames = {
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
  };

  // Fetch user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("true");
    if (storedUser){
      try {
        const user = JSON.parse(storedUser);
        setStudentName(user.user.full_name || "");
        setUserId(user.user.user_id || "");
        setPocId(user.user.mod_poc_id?.mod_poc_id || "");
        setTestResult(prev => ({
          ...prev,
          studentName: user.user.full_name || prev.studentName,
        }));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        setSnackbarMessage("Invalid user data in localStorage.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("No user data found in localStorage.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  // Load saved submission payload from localStorage on mount
  useEffect(() => {
    if (codeId) {
      const savedPayload = localStorage.getItem(`code_${codeId}`);
      if (savedPayload) {
        try {
          const parsedPayload = JSON.parse(savedPayload);
          setLanguage(parsedPayload.language ? Object.keys(languageApiMap).find(
            key => languageApiMap[key] === parsedPayload.language
          ) : "python");
          setInput(parsedPayload.code || templates[language]);
        } catch (error) {
          console.error("Error parsing saved payload:", error);
          setInput(templates[language]);
        }
      } else {
        setInput(templates[language]);
      }
    }
  }, [codeId, language]);

  // Fetch test data from testId
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setSnackbarMessage("No test ID found in localStorage.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      try {
        const res = await getTestById(testId);
        setFetchedTestCodingIds(res.test_coding_id || []);
        setTestResult(prev => {
          const updatedTestResult = {
            ...prev,
            testCodingIds: res.test_coding_id || prev.testCodingIds,
            testName: res.test_name || prev.testName,
            testLanguage: res.test_language || prev.testLanguage,
            testTotalScore: (res.test_mcq_id?.length || 0) + (res.test_coding_id?.length || 0) * 10,
          };
          localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
          return updatedTestResult;
        });
        setTestCases([]);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch test:", err);
        setSnackbarMessage("Failed to fetch test data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    fetchTestData();
  }, [testId]);

  // Timer countdown and auto-submit
  useEffect(() => {
    if (!timer || timer <= 0 || hasSubmitted) {
      if (timer <= 0 && !hasSubmitted) handleFinalSubmit();
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
  }, [timer, hasSubmitted]);

  // Malpractice detection
  useEffect(() => {
    const handleMalpractice = () => {
      setMalpracticeCount((prev) => {
        const newCount = prev + 1;
        setTestResult(prevResult => {
          const updatedTestResult = {
            ...prevResult,
            warningCount: newCount,
          };
          localStorage.setItem("test_result", JSON.stringify(updatedTestResult));
          return updatedTestResult;
        });
        if (newCount >= 3 && !hasSubmitted) {
          handleFinalSubmit(true);
        }
        return newCount;
      });
      setSnackbarMessage("Malpractice detected! Please stay on the test page.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleMalpractice();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleMalpractice();
    };

    const handleCopy = (e) => {
      e.preventDefault();
      handleMalpractice();
    };

    const handlePaste = (e) => {
      e.preventDefault();
      handleMalpractice();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [hasSubmitted]);

  // Auto-save function
  const saveSubmissionPayload = useCallback(() => {
    const formattedTestCases = testCases.map((testCase) => ({
      input: Array.isArray(testCase.testcase_input)
        ? testCase.testcase_input.join("\n")
        : testCase.testcase_input || "",
      expectedOutput: Array.isArray(testCase.testcase_output)
        ? testCase.testcase_output.join("\n")
        : testCase.testcase_output || "",
    }));

    const submissionPayload = {
      language: languageApiMap[language],
      code: input,
      testCases: formattedTestCases,
    };

    localStorage.setItem(`code_${codeId}`, JSON.stringify(submissionPayload));
  }, [codeId, language, input, testCases]);

  // Debounce function for auto-save
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounced auto-save
  const debouncedSave = useCallback(debounce(saveSubmissionPayload, 1000), [saveSubmissionPayload]);

  // Auto-save on input or language change
  useEffect(() => {
    if (codeId && input) {
      debouncedSave();
    }
  }, [input, language, codeId, debouncedSave]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(autoSaveTimeoutRef.current);
    };
  }, []);

  // Effect to handle responsive layout and cleanup
  useEffect(() => {
    if (isMobile) {
      setShowTestCases(true);
      setTestCasesCollapsed(false);
    } else {
      setEditorWidth(60);
      setTestCasesCollapsed(false);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleOutputMouseMove);
      document.removeEventListener("mouseup", handleOutputMouseUp);
      document.body.classList.remove("resize-active");
      clearTimeout(resizeTimeoutRef.current);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isMobile]);

  // Fix for ResizeObserver loop error
  useEffect(() => {
    if (typeof ResizeObserver !== "undefined") {
      const resizeCallback = (entries) => {
        window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) {
            return;
          }
          if (editorRef.current) {
            editorRef.current.layout();
          }
        });
      };
      resizeObserverRef.current = new ResizeObserver(resizeCallback);
      const container = document.querySelector(".monaco-editor");
      if (container) {
        resizeObserverRef.current.observe(container);
      }
    }
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Handle horizontal divider drag (editor vs test cases)
  const handleMouseDown = (e) => {
    if (!isMobile) {
      e.preventDefault();
      isDraggingRef.current = true;
      document.body.classList.add("resize-active");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current && dividerRef.current) {
      const container = dividerRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setEditorWidth(Math.max(30, Math.min(80, newWidth)));
    }
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.body.classList.remove("resize-active");
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 10);
    }
  };

  // Handle vertical divider drag (output height)
  const handleOutputMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.classList.add("resize-active");
    document.addEventListener("mousemove", handleOutputMouseMove);
    document.addEventListener("mouseup", handleOutputMouseUp);
  };

  const handleOutputMouseMove = useCallback((e) => {
    if (isDraggingRef.current && outputDividerRef.current) {
      const container = outputDividerRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;
      setOutputHeight(Math.max(20, Math.min(50, newHeight)));
    }
  }, []);

  const handleOutputMouseUp = () => {
    isDraggingRef.current = false;
    document.body.classList.remove("resize-active");
    document.removeEventListener("mousemove", handleOutputMouseMove);
    document.removeEventListener("mouseup", handleOutputMouseUp);
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 10);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    if (isMobile) {
      const textarea = document.querySelector(".monaco-editor .inputarea");
      if (textarea) {
        textarea.style.fontSize = "16px";
        textarea.style.lineHeight = "normal";
      }
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.updateOptions({ theme: newMode === "dark" ? "vs-dark" : "vs" });
      }
    }, 10);
  };

  // Toggle output console
  const toggleOutput = () => {
    if (outputMinimized) {
      setOutputMinimized(false);
      setShowOutput(true);
    } else {
      setOutputMinimized(!outputMinimized);
    }
  };

  // Toggle test cases panel
  const toggleTestCases = () => {
    setTestCasesCollapsed(!testCasesCollapsed);
  };

  // Handle editor input changes
  const handleEditorChange = (value) => {
    setInput(value || "");
  };

  // Handle language selection
  const handleLanguageChange = (event) => {
    const value = event.target.value;
    setLanguage(value);
    const savedPayload = localStorage.getItem(`code_${codeId}`);
    if (!savedPayload) {
      setInput(templates[value] || "");
    }
  };

  // Reset editor to template
  const resetEditor = () => {
    setResetDialogOpen(true);
  };

  // Confirm editor reset
  const confirmResetEditor = () => {
    setInput(templates[language] || "");
    localStorage.removeItem(`code_${codeId}`);
    setSnackbarMessage("Editor reset to template");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    setResetDialogOpen(false);
  };

  // Cancel editor reset
  const cancelResetEditor = () => {
    setResetDialogOpen(false);
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setSnackbarMessage("Code copied to clipboard");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Manual save
  const handleSave = () => {
    const formattedTestCases = testCases.map((testCase) => ({
      input: Array.isArray(testCase.testcase_input)
        ? testCase.testcase_input.join("\n")
        : testCase.testcase_input || "",
      expectedOutput: Array.isArray(testCase.testcase_output)
        ? testCase.testcase_output.join("\n")
        : testCase.testcase_output || "",
    }));

    const submissionPayload = {
      language: languageApiMap[language],
      code: input,
      testCases: formattedTestCases,
    };

    localStorage.setItem(`code_${codeId}`, JSON.stringify(submissionPayload));
    setSnackbarMessage("Progress saved manually");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Fetch code and test cases
  const fetchCodeAndTestCases = async (id) => {
    try {
      setLoading(true);
      console.log(`Fetching code for ID: ${id}`);
      const code = await fetchCodeById(id);
      console.log("Fetched code:", code);
      setSelectedCode(code);

      if (!code.code_test_cases_id || code.code_test_cases_id.length === 0) {
        setTestCases([]);
        setSnackbarMessage("No test cases found for this problem.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      console.log("Fetching test cases:", code.code_test_cases_id);
      const testCasePromises = code.code_test_cases_id.map((testcase_id) =>
        fetchTestCaseById(testcase_id)
      );
      const responses = await Promise.all(testCasePromises);
      console.log("Fetched test cases:", responses);

      const validTestCases = responses.filter((tc) => tc && tc.testcase_input && tc.testcase_output);
      setTestCases(validTestCases);

      if (validTestCases.length === 0) {
        setSnackbarMessage("No valid test cases retrieved.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setOutput(`Error fetching problem: ${err.message}`);
      setShowOutput(true);
      setSnackbarMessage(`Error fetching problem: ${err.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch code on component mount or codeId change
  useEffect(() => {
    if (codeId) {
      fetchCodeAndTestCases(codeId);
      setOutput("");
    } else {
      setOutput("Error: No code ID provided in URL");
      setShowOutput(true);
      setSnackbarMessage("No code ID provided in URL. Please navigate to a valid problem.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [codeId]);

  // Compile and evaluate code
  const compileAndEvaluate = async () => {
    setShowOutput(true);
    setOutputMinimized(false);
    setLoading(true);
    setOpenProgressDialog(true);
    setOutput("Running code against test cases...\n");

    try {
      const formattedTestCases = testCases.map((testCase) => ({
        input: Array.isArray(testCase.testcase_input)
          ? testCase.testcase_input.join("\n")
          : testCase.testcase_input || "",
        expectedOutput: Array.isArray(testCase.testcase_output)
          ? testCase.testcase_output.join("\n")
          : testCase.testcase_output || "",
      }));

      const submissionPayload = {
        language: languageApiMap[language],
        code: input,
        testCases: formattedTestCases,
      };

      localStorage.setItem(`code_${codeId}`, JSON.stringify(submissionPayload));

      console.log("Submitting payload to compiler:", submissionPayload);
      const { results } = await compileCode(submissionPayload);
      console.log("Compiler response:", results);

      const formattedOutput = results
        .map(
          (res, index) =>
            `Test Case #${index + 1}:\nInput:\n${res.input}\nExpected Output:\n${res.expectedOutput}\nActual Output:\n${res.actualOutput}\nPassed: ${
              res.passed ? "✅" : "❌"
            }\n`
        )
        .join("\n");
      setOutput(formattedOutput);

      // Evaluate results
      const allPassed = results.length > 0 && results.every((res) => res.passed);
      const codingScore = allPassed ? 10 : 0;

      const newCodingResult = { codeId, score: codingScore, total: 10 };
      const existingIndex = testResult.codingResults.findIndex((result) => result.codeId === codeId);
      let updatedCodingResults;
      if (existingIndex !== -1) {
        updatedCodingResults = [...testResult.codingResults];
        updatedCodingResults[existingIndex] = newCodingResult;
      } else {
        updatedCodingResults = [...testResult.codingResults, newCodingResult];
      }

      const updatedCodingAnswered = updatedCodingResults.length;
      const updatedCodingCorrect = updatedCodingResults.filter(r => r.score > 0).length;
      const updatedCodingWrong = updatedCodingResults.filter(r => r.score === 0).length;
      const updatedCodingNotAnswered = effectiveCodingIds.length - updatedCodingAnswered;
      const updatedCodingNotVisited = effectiveCodingIds.length - updatedCodingAnswered;
      const res = await getTestById(testId);


      const updatedTestResult = {
        ...testResult,
        
        codingResults: updatedCodingResults,
        result_user_id: userId || "",
        result_test_id: testId,
        result_score: testResult.mcqScore + updatedCodingResults.reduce((sum, result) => sum + result.score, 0),
        result_total_score: (res.test_mcq_id?.length || 0) + (res.test_coding_id?.length || 0) * 10,
        result_poc_id: pocId || "",
        codingAnswered: updatedCodingAnswered,
        codingNotAnswered: updatedCodingNotAnswered,
        codingNotVisited: updatedCodingNotVisited,
        codingCorrect: updatedCodingCorrect,
        codingWrong: updatedCodingWrong,
        warningCount: malpracticeCount,
        studentName: studentName,
      };

      setTestResult(updatedTestResult);
      localStorage.setItem("test_result", JSON.stringify(updatedTestResult));

      setSnackbarMessage("Code compiled and evaluated successfully!");
      setSnackbarSeverity("success");
      return true;
    } catch (error) {
      console.error("Compile error:", error);
      setOutput(`Error running code: ${error.message}`);
      setSnackbarMessage("Error during code compilation.");
      setSnackbarSeverity("error");
      return false;
    } finally {
      setLoading(false);
      setOpenProgressDialog(false);
      setSnackbarOpen(true);
    }
  };

  // Handle code run
  const handleRun = async (e) => {
    e.preventDefault();
    await compileAndEvaluate();
  };

  // Handle final test submission
  const handleFinalSubmit = async (isMalpractice = false) => {
    if (hasSubmitted) return;

    setLoading(true);
    setOpenProgressDialog(true);
    setOutput("Submitting test for final evaluation...\n");
    setShowOutput(true);

    try {
      const resultData = {
        ...testResult,
        result_user_id: userId || "",
        result_test_id: testId,
        result_score: testResult.mcqCorrect + testResult.codingResults.reduce((sum, result) => sum + result.score, 0),
        result_poc_id: pocId || "",
        warningCount: isMalpractice ? malpracticeCount : testResult.warningCount,
        studentName: studentName,
      };

      console.log("Submitting final test result:", resultData);
      await submitTestResult(resultData);

      effectiveCodingIds.forEach(id => localStorage.removeItem(`code_${id}`));


      setHasSubmitted(true);
      navigate("/test-result", { state: { resultData } });
      setSnackbarMessage("Test submitted successfully!");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Final submit error:", error);
      setOutput(`Error submitting test: ${error.message}`);
      setSnackbarMessage(`Error during test submission: ${error.message}`);
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenProgressDialog(false);
      setSnackbarOpen(true);
    }
  };

  // Handle navigation to the next program
  const handleNextProgram = async () => {
    saveSubmissionPayload();
    const success = await compileAndEvaluate();
    if (!success) return;

    const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.testCodingIds;
    if (testResult.currentCodingIndex < effectiveCodingIds.length - 1) {
      const nextCodeId = effectiveCodingIds[testResult.currentCodingIndex + 1];
      navigate(`/coding/${nextCodeId}`, {
        state: {
          ...testResult,
          currentCodingIndex: testResult.currentCodingIndex + 1,
        },
      });
      setSnackbarMessage("Compiled and moved to next program.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("This is the last program.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  // Handle navigation to the next problem
  const handleNext = async () => {
    saveSubmissionPayload();
    const success = await compileAndEvaluate();
    if (!success) return;

    const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.testCodingIds;
    if (testResult.currentCodingIndex < effectiveCodingIds.length - 1) {
      const nextCodeId = effectiveCodingIds[testResult.currentCodingIndex + 1];
      navigate(`/coding/${nextCodeId}`, {
        state: {
          ...testResult,
          currentCodingIndex: testResult.currentCodingIndex + 1,
        },
      });
      setSnackbarMessage("Compiled and moved to next program.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  // Handle navigation to the previous problem
  const handlePrevious = async () => {
    saveSubmissionPayload();
    const success = await compileAndEvaluate();
    if (!success) return;

    const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.testCodingIds;
    if (testResult.currentCodingIndex > 0) {
      const prevCodeId = effectiveCodingIds[testResult.currentCodingIndex - 1];
      navigate(`/coding/${prevCodeId}`, {
        state: {
          ...testResult,
          currentCodingIndex: testResult.currentCodingIndex - 1,
        },
      });
      setSnackbarMessage("Compiled and moved to previous program.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    saveSubmissionPayload();
    navigate(-1, { state: testResult });
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine effective coding IDs
  const effectiveCodingIds = fetchedTestCodingIds.length > 0 ? fetchedTestCodingIds : testResult.testCodingIds;
  const hasCodingProblems = effectiveCodingIds.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog
        open={openProgressDialog}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper" } }}
      >
        <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 4 }}>
          <CircularProgress sx={{ color: "#0c83c8" }} />
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
          >
            Processing your code...
          </Typography>
        </DialogContent>
      </Dialog>
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
      <Snackbar
        open={resetDialogOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={confirmResetEditor}
                sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
              >
                Reset
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={cancelResetEditor}
                sx={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important" }}
              >
                Cancel
              </Button>
            </Box>
          }
        >
          Reset editor to template? This will clear your current code.
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 1.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <CodeIcon sx={{ color: "#0c83c8", mr: 1, fontSize: { xs: 20, sm: 28 } }} />
            <Typography
              variant="h5"
              color="text.primary"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.5rem" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
              }}
            >
              {testResult.testName} - Coding Program {testResult.currentCodingIndex + 1} of {effectiveCodingIds.length || 1}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Time Left: {formatTime(timer)}
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 140 }, mr: { xs: 0.5, sm: 1 } }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
                sx={{
                  height: { xs: 32, sm: 40 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 0.5 },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {languageIcons[selected]}
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                      }}
                    >
                      {languageNames[selected]}
                    </Typography>
                  </Box>
                )}
              >
                <MenuItem value="python">
                  <PythonIcon sx={{ mr: 1, fontSize: "small" }} /> Python
                </MenuItem>
                <MenuItem value="java">
                  <JavaIcon sx={{ mr: 1, fontSize: "small" }} /> Java
                </MenuItem>
                <MenuItem value="cpp">
                  <CppIcon sx={{ mr: 1, fontSize: "small" }} /> C++
                </MenuItem>
                <MenuItem value="c">
                  <CIcon sx={{ mr: 1, fontSize: "small" }} /> C
                </MenuItem>
              </Select>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={
                  <MaterialUISwitch sx={{ m: { xs: 0.5, sm: 1 } }} checked={mode === "dark"} onChange={toggleTheme} />
                }
                label=""
              />
            </FormGroup>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: isMobile ? "100%" : testCasesCollapsed ? "90%" : `${editorWidth}%`,
              height: isMobile ? "50%" : "auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "width 0.2s ease-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                }}
              >
                Code Editor
              </Typography>
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, alignItems: "center", flexShrink: 0 }}>
                <Tooltip title="Reset Code">
                  <IconButton size="small" onClick={resetEditor}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save Code">
                  <IconButton size="small" onClick={handleSave}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy Code">
                  <IconButton size="small" onClick={copyToClipboard}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRun}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={12} color="inherit" /> : <PlayArrowIcon />}
                  size="small"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    px: { xs: 1, sm: 2 },
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  Run
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleNextProgram}
                  disabled={loading}
                  startIcon={<NavigateNextIcon />}
                  size="small"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    px: { xs: 1, sm: 2 },
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  Next Program
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleFinalSubmit()}
                  disabled={loading || hasSubmitted}
                  startIcon={<DoneIcon />}
                  size="small"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    px: { xs: 1, sm: 2 },
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  Submit Test
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Editor
                className="monaco-editor"
                height="100%"
                language={language}
                value={input}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={mode === "dark" ? "vs-dark" : "vs"}
                options={{
                  fontSize: 18,
                  minimap: { enabled: !isMobile },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  padding: { top: 8 },
                  smoothScrolling: true,
                  automaticLayout: true,
                  tabIndex: 0,
                  wordWrap: "on",
                  fixedOverflowWidgets: true,
                  ...(isMobile && {
                    fontSize: 16,
                    lineHeight: 24,
                    quickSuggestions: false,
                  }),
                }}
              />
            </Box>
          </Box>
          {!isMobile && !testCasesCollapsed && (
            <Box
              ref={dividerRef}
              sx={{
                width: 8,
                backgroundColor: theme.palette.divider,
                cursor: "col-resize",
                "&:hover": { backgroundColor: "#0c83c8" },
              }}
              onMouseDown={handleMouseDown}
            />
          )}
          <Box
            sx={{
              width: isMobile
                ? "100%"
                : testCasesCollapsed
                ? "10%"
                : `${100 - editorWidth - (testCasesCollapsed ? 0 : 1)}%`,
              height: isMobile ? "50%" : "auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderLeft: isMobile ? 0 : 1,
              borderTop: isMobile ? 1 : 0,
              borderColor: "divider",
              transition: "width 0.2s ease-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormatListNumberedIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 20 }, color: "#fc7a46" }} />
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "1rem" },
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  Problem & Test Cases
                </Typography>
                {!testCasesCollapsed && (
                  <Chip
                    label={testCases.length}
                    size="small"
                    color="secondary"
                    sx={{ ml: 1, height: { xs: 18, sm: 20 }, fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
                {isMobile ? (
                  <IconButton
                    size="small"
                    onClick={() => setShowTestCases(!showTestCases)}
                    aria-label={showTestCases ? "Collapse test cases" : "Expand test cases"}
                  >
                    {showTestCases ? (
                      <KeyboardArrowUpIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </IconButton>
                ) : (
                  <Tooltip title={testCasesCollapsed ? "Expand" : "Collapse"}>
                    <IconButton
                      size="small"
                      onClick={toggleTestCases}
                      aria-label={testCasesCollapsed ? "Expand test cases" : "Collapse test cases"}
                    >
                      {testCasesCollapsed ? (
                        <KeyboardArrowLeftIcon fontSize="small" />
                      ) : (
                        <KeyboardArrowRightIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            {isMobile && !showTestCases && (
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                  }}
                >
                  {testCases.length} test case{testCases.length !== 1 ? "s" : ""} available
                </Typography>
              </Box>
            )}
            {!testCasesCollapsed && showTestCases && (
              <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress sx={{ color: "#0c83c8" }} />
                  </Box>
                ) : selectedCode ? (
                  <>
                    <Card sx={{ mb: 1 }}>
                      <CardContent sx={{ p: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="medium"
                            sx={{
                              fontSize: { xs: "0.85rem", sm: "1rem" },
                              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                            }}
                          >
                            {selectedCode.code_title || "Problem"}
                          </Typography>
                          <Chip
                            label={"10 Mark"}
                            size="small"
                            sx={{
                              bgcolor:
                                selectedCode.code_difficulty === "Easy"
                                  ? "#00af9b"
                                  : selectedCode.code_difficulty === "Hard"
                                  ? "#ff375f"
                                  : "#ffa116",
                              color: "white",
                              fontWeight: "bold",
                              height: { xs: 18, sm: 20 },
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            }}
                          />
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                            color: "text.secondary",
                            whiteSpace: "pre-wrap",
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          }}
                        >
                          {selectedCode.code_problem_statement}
                        </Typography>
                      </CardContent>
                    </Card>
                    {testCases.length > 0 ? (
                      <Stack spacing={1}>
                        {testCases.map((tc, i) => (
                          <Card key={i} sx={{ position: "relative" }}>
                            <CardContent sx={{ p: 1 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="medium"
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                                  }}
                                >
                                  Test Case #{i + 1}
                                </Typography>
                              </Box>
                              <Divider sx={{ mb: 1 }} />
                              {tc.testcase_input && (
                                <Typography
                                  sx={{
                                    fontFamily: "'Fira Code', monospace",
                                    color: "text.secondary",
                                    mb: 0.5,
                                    p: 1,
                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                    borderRadius: 1,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                  }}
                                >
                                  <strong>Input:</strong>{" "}
                                  {Array.isArray(tc.testcase_input)
                                    ? tc.testcase_input.join(", ")
                                    : tc.testcase_input || "N/A"}
                                </Typography>
                              )}
                              <Typography
                                sx={{
                                  fontFamily: "'Fira Code', monospace",
                                  color: "text.secondary",
                                  p: 1,
                                  bgcolor: alpha(theme.palette.background.default, 0.7),
                                  borderRadius: 1,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                }}
                              >
                                <strong>Expected Output:</strong>{" "}
                                {Array.isArray(tc.testcase_output)
                                  ? tc.testcase_output.join(", ")
                                  : tc.testcase_output || "N/A"}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          opacity: 0.7,
                        }}
                      >
                        <FormatListNumberedIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: "text.secondary", mb: 1 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                          }}
                        >
                          No test cases available
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      opacity: 0.7,
                    }}
                  >
                    <CodeIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: "text.secondary", mb: 1 }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                      }}
                    >
                      No program loaded. Please navigate from a valid test.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            {!isMobile && testCasesCollapsed && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 1, height: "100%" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    mt: 2,
                  }}
                >
                  Problem & Test Cases ({testCases.length})
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            height: outputMinimized ? "auto" : `${outputHeight}%`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderTop: 1,
            borderColor: "divider",
            transition: "height 0.2s ease-out",
          }}
        >
          {!outputMinimized && (
            <Box
              ref={outputDividerRef}
              sx={{
                height: 8,
                backgroundColor: theme.palette.divider,
                cursor: "row-resize",
                "&:hover": { backgroundColor: "#0c83c8" },
              }}
              onMouseDown={handleOutputMouseDown}
            />
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
              borderBottom: showOutput && !outputMinimized ? 1 : 0,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TerminalIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 20 }, color: "#0c83c8" }} />
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                }}
              >
                Output Console
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title={outputMinimized ? "Expand" : "Collapse"}>
                <IconButton size="small" onClick={toggleOutput}>
                  {outputMinimized ? (
                    <KeyboardArrowDownIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowUpIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {showOutput && !outputMinimized && (
            <Box sx={{ flex: 1, overflow: "auto", p: 1, bgcolor: alpha(theme.palette.background.default, 0.7) }}>
              {output ? (
                <Typography
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: "'Fira Code', monospace",
                    fontSize: { xs: 12, sm: 14 },
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {output.split("\n").map((line, index) => {
                    let color = "text.primary";
                    if (line.includes("Error") || line.includes("❌") || line.includes("failed")) {
                      color = "error.main";
                    } else if (line.includes("✅") || line.includes("passed")) {
                      color = "success.main";
                    }
                    return (
                      <Box component="span" key={index} sx={{ color, display: "block" }}>
                        {line}
                      </Box>
                    );
                  })}
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    opacity: 0.7,
                  }}
                >
                  <OutputIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: "text.secondary", mb: 1 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
                    }}
                  >
                    Run your code to see output here
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={loading}
              startIcon={<ArrowBackIcon />}
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
              }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={testResult.currentCodingIndex === 0 || loading || !hasCodingProblems}
              startIcon={<NavigateBeforeIcon />}
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
              }}
            >
              Previous
            </Button>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            }}
          >
            Program {hasCodingProblems ? testResult.currentCodingIndex + 1 : 1} of {effectiveCodingIds.length || 1}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={testResult.currentCodingIndex >= effectiveCodingIds.length - 1 || loading || !hasCodingProblems}
            endIcon={<NavigateNextIcon />}
            sx={{
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif !important",
            }}
          >
            Next
          </Button>
        </Box>
        {isMobile && (
          <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000, display: "flex", gap: 1 }}>
            <Fab
              color="primary"
              aria-label="run"
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            </Fab>
            <Fab
              color="secondary"
              aria-label="next-program"
              onClick={handleNextProgram}
              disabled={loading}
            >
              <NavigateNextIcon />
            </Fab>
            <Fab
              color="error"
              aria-label="submit-test"
              onClick={() => handleFinalSubmit()}
              disabled={loading || hasSubmitted}
            >
              <DoneIcon />
            </Fab>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CodingPage;