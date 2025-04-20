import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Grid,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Select,
  FormControl,
  TextField,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import { Editor } from "@monaco-editor/react";
import { useTheme, useMediaQuery } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CodeIcon from "@mui/icons-material/Code";
import JavaIcon from "@mui/icons-material/DeveloperMode";
import PythonIcon from "@mui/icons-material/Memory";
import CppIcon from "@mui/icons-material/IntegrationInstructions";
import CIcon from "@mui/icons-material/SettingsEthernet";
import DoneIcon from "@mui/icons-material/Done";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import DescriptionIcon from "@mui/icons-material/Description";
import OutputIcon from "@mui/icons-material/Output";
import { fetchCodeById, fetchTestCaseById, compileCode, submitTestResult } from "../axios";

// Language mapping for RapidAPI and backend
const languageApiMap = {
  python: "python3",
  java: "java",
  cpp: "cpp",
  c: "c",
};

const OnlineCompiler = () => {
  const { codeId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Test context from McqTest with fallback
  const {
    testId = "",
    testMcqIds = [],
    testCodingIds = [],
    testTotalScore = 0,
    mcqScore = 0,
    testName = "CodeLeet Test",
    testLanguage = "Unknown",
    userId = "",
    pocId = "",
    currentCodingIndex = 0,
    codingResults = [],
  } = state || {};

  // Component state
  const [input, setInput] = useState(localStorage.getItem("input") || "");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "python");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [manualCodeId, setManualCodeId] = useState(codeId || "");
  const [activeTab, setActiveTab] = useState("description");
  const [showOutput, setShowOutput] = useState(false);

  // Language templates
  const templates = {
    python: `print("Hello World")`,
    java: `import java.util.*;\npublic class Progman {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}`,
    c: `#include <stdio.h>\nint main() {\n\tprintf("Hello World");\n\treturn 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello World";\n\treturn 0;\n}`,
  };

  // Language color mapping for badges
  const languageColors = {
    python: "#3572A5",
    java: "#b07219",
    cpp: "#f34b7d",
    c: "#555555",
  };

  // Language display names
  const languageNames = {
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
  };

  // Handle editor input changes
  const handleEditorChange = (value) => {
    setInput(value || "");
    localStorage.setItem("input", value || "");
  };

  // Handle language selection
  const handleLanguageChange = (event) => {
    const value = event.target.value;
    setLanguage(value);
    localStorage.setItem("language", value);
    setInput(templates[value] || "");
  };

  // Reset editor to template
  const resetEditor = () => {
    setInput(templates[language] || "");
    localStorage.setItem("input", templates[language] || "");
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
  };

  // Fetch code and test cases
  const fetchCodeAndTestCases = async (id) => {
    try {
      setLoading(true);
      console.log(`Fetching code for ID: ${id}`);
      const code = await fetchCodeById(id);
      console.log("Fetched code:", code);
      setSelectedCode(code);

      if (!code.code_test_cases || code.code_test_cases.length === 0) {
        setTestCases([]);
        return;
      }

      console.log("Fetching test cases:", code.code_test_cases);
      const testCasePromises = code.code_test_cases.map((testcase_id) =>
        fetchTestCaseById(testcase_id)
      );
      const responses = await Promise.all(testCasePromises);
      console.log("Fetched test cases:", responses);
      setTestCases(responses);
    } catch (err) {
      console.error("Fetch error:", err);
      setOutput(`Error fetching problem: ${err.message}`);
      setShowOutput(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual code ID input
  const handleFetchManualCode = () => {
    if (manualCodeId.trim()) {
      fetchCodeAndTestCases(manualCodeId.trim());
    }
  };

  // Fetch code on component mount
  useEffect(() => {
    if (codeId) {
      fetchCodeAndTestCases(codeId);
      setManualCodeId(codeId);
    }
  }, [codeId]);

  // Handle code run
  const handleRun = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("Running code against test cases...\n");
    setShowOutput(true);

    try {
      // Format test cases for submission
      const formattedTestCases = testCases.map((testCase) => ({
        input: Array.isArray(testCase.testcase_input)
          ? testCase.testcase_input.join("\n")
          : testCase.testcase_input || "",
        expectedOutput: Array.isArray(testCase.testcase_output)
          ? testCase.testcase_output.join("\n")
          : testCase.testcase_output || "",
      }));

      // Prepare payload for backend compiler
      const submissionPayload = {
        language: languageApiMap[language],
        code: input,
        testCases: formattedTestCases,
      };

      console.log("Submitting payload to compiler:", submissionPayload);
      const { results } = await compileCode(submissionPayload);
      console.log("Compiler response:", results);

      // Format output for display
      const formattedOutput = results
        .map(
          (res, index) =>
            `Test Case #${index + 1}:\nInput:\n${res.input}\nExpected Output:\n${res.expectedOutput}\nActual Output:\n${res.actualOutput}\nPassed: ${
              res.passed ? "✅" : "❌"
            }\n`
        )
        .join("\n");
      setOutput(formattedOutput);
    } catch (error) {
      console.error("Run error:", error);
      setOutput(`Error running code: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to run code with a given input using RapidAPI
  const runCodeWithInput = async (code, inputData) => {
    const data = new URLSearchParams();
    data.append("LanguageChoice", languageApiMap[language]);
    data.append("Program", code);
    data.append("Input", inputData || "");

    try {
      const response = await fetch("https://code-compiler.p.rapidapi.com/v2", {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY || "1bd042778fmshd4b16d97e812af0p1395bejsn19af4753d4d1",
          "x-rapidapi-host": "code-compiler.p.rapidapi.com",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      if (jsonResponse.Errors) {
        throw new Error(jsonResponse.Errors);
      }

      return jsonResponse.Result || "No output received from the compiler.";
    } catch (error) {
      throw new Error(`RapidAPI error: ${error.message}`);
    }
  };

  // Handle code submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("Submitting code for evaluation...\n");
    setShowOutput(true);

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

      console.log("Submitting payload for evaluation:", submissionPayload);
      const { results } = await compileCode(submissionPayload);
      console.log("Evaluation response:", results);

      const formattedOutput = results
        .map(
          (res, index) =>
            `Test Case #${index + 1}:\nInput:\n${res.input}\nExpected Output:\n${res.expectedOutput}\nActual Output:\n${res.actualOutput}\nPassed: ${
              res.passed ? "✅" : "❌"
            }\n`
        )
        .join("\n");
      setOutput(formattedOutput);

      // Check if all test cases passed
      const allPassed = results.length > 0 && results.every((res) => res.passed);
      const codingScore = allPassed ? 10 : 0;
      const newCodingResult = { codeId, score: codingScore, total: 10 };
      const updatedCodingResults = [...codingResults, newCodingResult];

      // Submit the test result
      const finalScore = mcqScore + updatedCodingResults.reduce((sum, result) => sum + result.score, 0);
      const resultData = {
        result_user_id: userId,
        result_test_id: testId,
        result_score: finalScore,
        result_total_score: testTotalScore,
        result_poc_id: pocId,
        testName,
        testLanguage,
      };

      console.log("Submitting test result:", resultData);
      await submitTestResult(resultData);
      navigate("/test-result", { state: { resultData } });
    } catch (error) {
      console.error("Submit error:", error);
      setOutput(`Error evaluating code: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change (description/test cases)
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        backgroundColor: "#1a1a2e",
        color: "#ffffff",
        p: { xs: 2, md: 4 },
        borderRadius: 2,
        minHeight: "95vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          borderBottom: "1px solid #333",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CodeIcon sx={{ fontSize: 28, mr: 1, color: "#ffa116" }} />
          <Typography variant="h5" fontWeight="bold">
            {testName} - Coding Problem {currentCodingIndex + 1}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            label="Enter Code ID"
            value={manualCodeId}
            onChange={(e) => setManualCodeId(e.target.value)}
            sx={{
              width: { xs: 120, sm: 200 },
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#666" },
              },
              "& .MuiInputLabel-root": { color: "#aaa" },
            }}
          />
          <Button
            variant="contained"
            onClick={handleFetchManualCode}
            sx={{
              bgcolor: "#ffa116",
              "&:hover": { bgcolor: "#ff8c00" },
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Load Problem
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Left panel - Problem description */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            sx={{
              bgcolor: "#282828",
              borderRadius: 2,
              height: "85vh",
              overflow: "hidden",
              border: "1px solid #444",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#1e1e2f",
                "& .MuiTab-root": { color: "#bbb", textTransform: "none" },
                "& .Mui-selected": { color: "#ffa116 !important" },
                "& .MuiTabs-indicator": { bgcolor: "#ffa116" },
              }}
            >
              <Tab value="description" icon={<DescriptionIcon />} iconPosition="start" label="Description" />
              <Tab value="testcases" icon={<FormatListNumberedIcon />} iconPosition="start" label="Test Cases" />
            </Tabs>
            <Box sx={{ p: 3, height: "calc(85vh - 48px)", overflowY: "auto" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <CircularProgress />
                </Box>
              ) : activeTab === "description" && selectedCode ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5" fontWeight="600">
                      {selectedCode.code_title || "Problem"}
                    </Typography>
                    <Chip
                      label={selectedCode.code_difficulty || "Medium"}
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
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "'Roboto', sans-serif",
                      color: "#ccc",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedCode.code_problem_statement}
                  </Typography>
                  {testCases.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Examples:
                      </Typography>
                      {testCases.slice(0, 2).map((tc, i) => (
                        <Box
                          key={i}
                          sx={{ mb: 3, p: 2, bgcolor: "#1e1e2f", borderRadius: 1, border: "1px solid #444" }}
                        >
                          <Typography variant="subtitle1" fontWeight="600">
                            Example {i + 1}:
                          </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                            <Box>
                              <Typography component="span" sx={{ fontWeight: "bold", color: "#888" }}>
                                Input:{" "}
                              </Typography>
                              <Typography component="span" sx={{ fontFamily: "'Roboto Mono', monospace" }}>
                                {Array.isArray(tc.testcase_input)
                                  ? tc.testcase_input.join(", ")
                                  : tc.testcase_input || "N/A"}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography component="span" sx={{ fontWeight: "bold", color: "#888" }}>
                                Output:{" "}
                              </Typography>
                              <Typography component="span" sx={{ fontFamily: "'Roboto Mono', monospace" }}>
                                {Array.isArray(tc.testcase_output)
                                  ? tc.testcase_output.join(", ")
                                  : tc.testcase_output || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              ) : activeTab === "testcases" ? (
                <>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                    All Test Cases:
                  </Typography>
                  {testCases.length > 0 ? (
                    testCases.map((tc, i) => (
                      <Box
                        key={i}
                        sx={{ mb: 2, p: 2, bgcolor: "#1e1e2f", borderRadius: 1, border: "1px solid #444" }}
                      >
                        <Typography>
                          <strong>Test Case #{i + 1}</strong>
                        </Typography>
                        <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 14 }}>
                          <strong>Input:</strong>{" "}
                          {Array.isArray(tc.testcase_input)
                            ? tc.testcase_input.join(", ")
                            : tc.testcase_input || "N/A"}
                        </Typography>
                        <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 14 }}>
                          <strong>Expected Output:</strong>{" "}
                          {Array.isArray(tc.testcase_output)
                            ? tc.testcase_output.join(", ")
                            : tc.testcase_output || "N/A"}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" color="#888">
                      No test cases available. Load a problem to see test cases.
                    </Typography>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "50vh",
                  }}
                >
                  <CodeIcon sx={{ fontSize: 60, color: "#444", mb: 2 }} />
                  <Typography variant="h6" color="#666">
                    Enter a Problem ID or navigate to a problem to start coding
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right panel - Code editor */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper
            sx={{
              bgcolor: "#282828",
              borderRadius: 2,
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #444",
            }}
          >
            {/* Editor toolbar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                borderBottom: "1px solid #444",
                bgcolor: "#1e1e2f",
              }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  sx={{
                    bgcolor: "#282828",
                    color: "#fff",
                    height: 36,
                    "& .MuiSelect-select": { display: "flex", alignItems: "center" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
                  }}
                >
                  <MenuItem value="python">
                    <PythonIcon sx={{ mr: 1, color: languageColors.python }} /> Python
                  </MenuItem>
                  <MenuItem value="java">
                    <JavaIcon sx={{ mr: 1, color: languageColors.java }} /> Java
                  </MenuItem>
                  <MenuItem value="cpp">
                    <CppIcon sx={{ mr: 1, color: languageColors.cpp }} /> C++
                  </MenuItem>
                  <MenuItem value="c">
                    <CIcon sx={{ mr: 1, color: languageColors.c }} /> C
                  </MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Reset Code">
                  <IconButton onClick={resetEditor} size="small" sx={{ color: "#bbb" }}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy Code">
                  <IconButton onClick={copyToClipboard} size="small" sx={{ color: "#bbb" }}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Code editor */}
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Editor
                height="100%"
                language={language}
                value={input}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: isMobile ? false : true },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: "on",
                  fontFamily: "'Roboto Mono', monospace",
                  automaticLayout: true,
                }}
              />
            </Box>

            {/* Console output */}
            <Box
              sx={{
                height: showOutput ? "30%" : "auto",
                transition: "height 0.3s ease",
                borderTop: "1px solid #444",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#1e1e2f",
                  p: 1,
                  borderBottom: showOutput ? "1px solid #444" : "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <OutputIcon sx={{ mr: 1, fontSize: 20, color: "#bbb" }} />
                  <Typography variant="subtitle2" sx={{ color: "#bbb", fontWeight: "bold" }}>
                    Output
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setShowOutput(!showOutput)} sx={{ color: "#bbb" }}>
                  <Typography variant="caption" sx={{ px: 1 }}>
                    {showOutput ? "Hide" : "Show"}
                  </Typography>
                </IconButton>
              </Box>
              {showOutput && (
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    overflowY: "auto",
                    bgcolor: "#1e1e2e",
                    fontFamily: "'Roboto Mono', monospace",
                    color: output.includes("Error") || output.includes("❌") ? "#ff5252" : "#00ff00",
                    fontSize: 14,
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      m: 0,
                      fontFamily: "inherit",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {output || "Run your code to see the output here..."}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                p: 2,
                borderTop: "1px solid #444",
                bgcolor: "#1e1e2f",
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Custom input..."
                multiline
                rows={1}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                sx={{
                  flex: 1,
                  display: { xs: "none", sm: "block" },
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "#666" },
                    bgcolor: "#282828",
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleRun}
                disabled={loading}
                sx={{
                  bgcolor: "#2cbb5d",
                  "&:hover": { bgcolor: "#25a350" },
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : (
                  <>
                    <PlayArrowIcon /> Run
                  </>
                )}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  bgcolor: "#ffa116",
                  "&:hover": { bgcolor: "#ff8c00" },
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                <DoneIcon sx={{ mr: 0.5 }} />
                Submit
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OnlineCompiler;