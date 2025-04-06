import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Timer as TimerIcon,
  Flag as FlagIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PieChart as PieChartIcon,
} from "@mui/icons-material";

// Enhanced styling with the requested color scheme
const FullScreenCard = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "100vh",
  margin: 0,
  borderRadius: 0,
  overflowY: "auto",
  userSelect: "none",
  backgroundColor: "#f8f9fa",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const TimerBox = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "#0c83c8",
  color: "white",
  padding: theme.spacing(1),
  zIndex: 1000,
  userSelect: "none",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
}));

// Different shapes for question navigation
const QuestionShape = styled(Box)(({ theme, status, shape }) => {
  const baseStyles = {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: theme.spacing(0.5),
    cursor: "pointer",
    backgroundColor:
      status === "answered"
        ? "#4caf50"
        : status === "marked"
        ? "#fc7a46"
        : status === "notAnswered"
        ? "#f44336"
        : "#e0e0e0",
    color: status === "notVisited" ? "#000" : "#fff",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    },
    userSelect: "none",
  };

  // Different shapes based on the shape prop
  if (shape === "circle") {
    return {
      ...baseStyles,
      borderRadius: "50%",
    };
  } else if (shape === "square") {
    return {
      ...baseStyles,
      borderRadius: theme.spacing(1),
    };
  } else if (shape === "diamond") {
    return {
      ...baseStyles,
      transform: "rotate(45deg)",
      "& > *": {
        transform: "rotate(-45deg)",
      },
      "&:hover": {
        transform: "rotate(45deg) scale(1.1)",
      },
    };
  } else if (shape === "hexagon") {
    return {
      ...baseStyles,
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    };
  } else {
    return {
      ...baseStyles,
      borderRadius: theme.spacing(1),
    };
  }
});

const StyledButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
}));

const PrimaryButton = styled(StyledButton)({
  backgroundColor: "#0c83c8",
  "&:hover": {
    backgroundColor: "#0a6eaa",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
});

const SecondaryButton = styled(StyledButton)({
  color: "#0c83c8",
  borderColor: "#0c83c8",
  "&:hover": {
    borderColor: "#0a6eaa",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
});

const OptionCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  cursor: "pointer",
  transition: "all 0.2s ease",
  border: selected ? "2px solid #0c83c8" : "1px solid #e0e0e0",
  backgroundColor: selected ? "rgba(12, 131, 200, 0.05)" : "#fff",
  "&:hover": {
    backgroundColor: selected ? "rgba(12, 131, 200, 0.1)" : "rgba(252, 122, 70, 0.05)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  marginBottom: theme.spacing(2),
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#0c83c8",
  },
}));

const MarkReviewButton = styled(Button)(({ theme, marked }) => ({
  backgroundColor: marked ? "#fc7a46" : "transparent",
  color: marked ? "white" : "#fc7a46",
  border: `1px solid ${marked ? "#fc7a46" : "#fc7a46"}`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: marked ? "#e56a3d" : "rgba(252, 122, 70, 0.1)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
  },
}));

const QuestionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: "#fff",
  height: "100%",
}));

const SidebarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  height: "100%",
}));

// Analog Clock Component
const AnalogClock = ({ timeLeft }) => {
  const canvasRef = useRef(null);
  const totalSeconds = 3600; // 1 hour in seconds
  const secondsRemaining = timeLeft;
  const percentageRemaining = (secondsRemaining / totalSeconds) * 100;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;
    ctx.translate(radius, radius);
    
    // Clear canvas
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
    
    // Draw clock face
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = "#f5f5f5";
    ctx.fill();
    
    // Draw time progress arc
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, -Math.PI / 2, (percentageRemaining / 100) * 2 * Math.PI - Math.PI / 2, false);
    ctx.lineWidth = radius * 0.1;
    ctx.strokeStyle = percentageRemaining > 50 ? "#4caf50" : percentageRemaining > 25 ? "#fc7a46" : "#f44336";
    ctx.stroke();
    
    // Draw clock center
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = "#0c83c8";
    ctx.fill();
    
    // Draw hour hand
    const hours = Math.floor(secondsRemaining / 3600);
    drawHand(ctx, (hours % 12) / 12 * 2 * Math.PI - Math.PI / 2, radius * 0.5, radius * 0.07, "#333");
    
    // Draw minute hand
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    drawHand(ctx, minutes / 60 * 2 * Math.PI - Math.PI / 2, radius * 0.7, radius * 0.05, "#555");
    
    // Draw second hand
    const seconds = secondsRemaining % 60;
    drawHand(ctx, seconds / 60 * 2 * Math.PI - Math.PI / 2, radius * 0.8, radius * 0.02, "#fc7a46");
    
    // Draw hour marks
    for (let i = 0; i < 12; i++) {
      const angle = i / 12 * 2 * Math.PI - Math.PI / 2;
      const x1 = Math.cos(angle) * (radius * 0.8);
      const y1 = Math.sin(angle) * (radius * 0.8);
      const x2 = Math.cos(angle) * (radius * 0.9);
      const y2 = Math.sin(angle) * (radius * 0.9);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = radius * 0.03;
      ctx.strokeStyle = "#333";
      ctx.stroke();
    }
  }, [timeLeft, percentageRemaining]);
  
  const drawHand = (ctx, angle, length, width, color) => {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  };
  
  return (
    <Box sx={{ textAlign: "center" }}>
      <canvas ref={canvasRef} width="120" height="120" style={{ margin: "0 auto" }}></canvas>
    </Box>
  );
};

// Pie Chart Component for Summary
const SummaryPieChart = ({ data }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;
    ctx.translate(radius, radius);
    
    // Clear canvas
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
    
    // Data for pie chart
    const total = Object.values(data).reduce((acc, val) => acc + val, 0);
    let startAngle = -Math.PI / 2;
    
    const colors = {
      answered: "#4caf50",
      marked: "#fc7a46",
      notAnswered: "#f44336",
      notVisited: "#e0e0e0"
    };
    
    // Draw pie slices
    Object.entries(data).forEach(([key, value]) => {
      if (value === 0) return;
      
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.8, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[key];
      ctx.fill();
      
      // Draw slice label
      const labelAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.5;
      const labelX = Math.cos(labelAngle) * labelRadius;
      const labelY = Math.sin(labelAngle) * labelRadius;
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (value > total * 0.1) { // Only show label if slice is big enough
        ctx.fillText(value.toString(), labelX, labelY);
      }
      
      startAngle += sliceAngle;
    });
  }, [data]);
  
  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <canvas ref={canvasRef} width="180" height="180" style={{ margin: "0 auto" }}></canvas>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", mt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mx: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: "#4caf50", borderRadius: "50%", mr: 0.5 }}></Box>
          <Typography variant="caption">Answered</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mx: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: "#fc7a46", borderRadius: "50%", mr: 0.5 }}></Box>
          <Typography variant="caption">Marked</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mx: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: "#f44336", borderRadius: "50%", mr: 0.5 }}></Box>
          <Typography variant="caption">Not Answered</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mx: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: "#e0e0e0", borderRadius: "50%", mr: 0.5 }}></Box>
          <Typography variant="caption">Not Visited</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const McqTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [mcqIds, setMcqIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMcq, setCurrentMcq] = useState(null);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [testName, setTestName] = useState("");
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [warningOpen, setWarningOpen] = useState(false);
  const [refreshWarningOpen, setRefreshWarningOpen] = useState(false);
  const [studentName, setStudentName] = useState("Loading...");
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const timerRef = useRef(null);
  const API_BASE_URL = "http://localhost:4000";

  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("Full Name:", user.user.full_name);
        setStudentName(user.user.full_name);
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
      }
    } else {
      console.warn("No user found in session storage");
    }
  }, []);

  useEffect(() => {
    const enterFullScreen = () => {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
    };
    enterFullScreen();

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setWarningOpen(true);
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.metaKey && e.key === "r")
      ) {
        e.preventDefault();
        setRefreshWarningOpen(true);
      }
    };

    const handleBackButton = () => {
      setRefreshWarningOpen(true);
      window.history.pushState(null, null, window.location.href);
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSubmit();
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();

    const preventSwipe = (e) => {
      e.preventDefault();
      setRefreshWarningOpen(true);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handleBackButton);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("touchstart", preventSwipe, { passive: false });
    window.addEventListener("touchmove", preventSwipe, { passive: false });

    window.history.pushState(null, null, window.location.href);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handleBackButton);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("touchstart", preventSwipe);
      window.removeEventListener("touchmove", preventSwipe);
      document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/test_gateway/test/get_by_test_id/${testId}`);
        setMcqIds(res.data.test_mcq_id || []);
        setTestName(res.data.test_name);
        setLoading(false);
        
        // Initialize visited questions
        const initialVisited = {};
        initialVisited[0] = true; // Mark first question as visited
        setVisitedQuestions(initialVisited);
      } catch (err) {
        console.error("Failed to fetch test:", err);
        setLoading(false);
      }
    };
    fetchTestData();
  }, [testId]);

  useEffect(() => {
    const fetchCurrentMcq = async () => {
      if (mcqIds.length && currentIndex < mcqIds.length) {
        try {
          const res = await axios.get(`${API_BASE_URL}/mcq_gateway/mcq/get_mcq/${mcqIds[currentIndex]}`);
          setCurrentMcq(res.data);
          
          // Mark current question as visited
          setVisitedQuestions(prev => ({
            ...prev,
            [currentIndex]: true
          }));
        } catch (err) {
          console.error("Failed to fetch MCQ:", err);
        }
      }
    };
    fetchCurrentMcq();
  }, [mcqIds, currentIndex]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionSelect = (option) => {
    setAnswers((prev) => {
      if (prev[currentMcq.mcq_id] === option) {
        const newAnswers = { ...prev };
        delete newAnswers[currentMcq.mcq_id];
        return newAnswers;
      }
      return {
        ...prev,
        [currentMcq.mcq_id]: option,
      };
    });
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentMcq.mcq_id]: !prev[currentMcq.mcq_id],
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < mcqIds.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const resultData = {
        result_user_id: "user123",
        result_test_id: testId,
        result_score: Object.values(answers).filter((ans, idx) => ans === mcqIds[idx]).length,
        result_total_score: mcqIds.length,
        result_poc_id: "poc123",
      };
      await axios.post(`${API_BASE_URL}/mcq_gateway/mcq/submit_result`, resultData);
      navigate("/test-result", { state: { resultData } });
    } catch (err) {
      console.error("Error submitting test:", err);
    }
  };

  const handleStay = () => {
    setRefreshWarningOpen(false);
    setWarningOpen(false);
    document.documentElement.requestFullscreen().catch((err) => {
      console.error("Failed to re-enter fullscreen:", err);
      handleSubmit();
    });
  };

  const handleQuestionNavigation = (index) => {
    setCurrentIndex(index);
  };

  const getQuestionStatus = (index) => {
    const mcqId = mcqIds[index];
    if (answers[mcqId]) return "answered";
    if (markedForReview[mcqId]) return "marked";
    if (visitedQuestions[index] && !answers[mcqId]) return "notAnswered";
    return "notVisited";
  };

  const getStatusCounts = () => {
    let answered = 0;
    let marked = 0;
    let notAnswered = 0;
    let notVisited = 0;

    mcqIds.forEach((mcqId, index) => {
      if (answers[mcqId]) answered++;
      else if (markedForReview[mcqId]) marked++;
      else if (visitedQuestions[index]) notAnswered++;
      else notVisited++;
    });

    return { 
      answered, 
      marked, 
      notAnswered, 
      notVisited 
    };
  };

  // Get shape for question navigation based on index
  const getQuestionShape = (index) => {
    const shapes = ["circle", "square", "diamond", "hexagon"];
    const status = getQuestionStatus(index);
    
    if (status === "answered") return "circle";
    if (status === "marked") return "diamond";
    if (status === "notAnswered") return "square";
    return "hexagon";
  };

  if (loading || !currentMcq) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#f8f9fa" 
      }}>
        <CircularProgress sx={{ color: "#0c83c8" }} />
      </Box>
    );
  }

  const statusCounts = getStatusCounts();
  const progress = ((currentIndex + 1) / mcqIds.length) * 100;

  return (
    <FullScreenCard>
      <TimerBox>
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>{testName}</Typography>
          <Box display="flex" alignItems="center">
            <TimerIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>{formatTime(timeLeft)}</Typography>
          </Box>
        </Box>
      </TimerBox>

      <Grid container sx={{ height: "calc(100% - 56px)", mt: 7, p: 2 }} spacing={2}>
        <Grid item xs={12}>
          <ProgressBar variant="determinate" value={progress} />
        </Grid>
        
        <Grid item xs={12} md={9} sx={{ display: "flex", flexDirection: "column" }}>
          <QuestionContainer>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                Question {currentIndex + 1} of {mcqIds.length}
              </Typography>
              <MarkReviewButton
                variant="outlined"
                startIcon={<FlagIcon />}
                onClick={handleMarkForReview}
                marked={markedForReview[currentMcq.mcq_id]}
                size="small"
              >
                {markedForReview[currentMcq.mcq_id] ? "Marked" : "Mark for Review"}
              </MarkReviewButton>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              borderRadius: 2, 
              backgroundColor: "rgba(12, 131, 200, 0.05)",
              mb: 3
            }}>
              <Typography variant="body1" gutterBottom sx={{ fontSize: "1.1rem" }}>
                {currentMcq.mcq_question}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                Mark: 1
              </Typography>
            </Box>

            <Box mt={2}>
              <RadioGroup value={answers[currentMcq.mcq_id] || ""}>
                {currentMcq.mcq_options.map((option, idx) => (
                  <OptionCard 
                    key={idx} 
                    selected={answers[currentMcq.mcq_id] === option}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <FormControlLabel
                      value={option}
                      control={
                        <Radio
                          sx={{
                            color: "#0c83c8",
                            '&.Mui-checked': {
                              color: "#0c83c8",
                            },
                          }}
                          checked={answers[currentMcq.mcq_id] === option}
                        />
                      }
                      label={option}
                      sx={{ width: "100%" }}
                    />
                  </OptionCard>
                ))}
              </RadioGroup>
            </Box>

            <Box mt={4} display="flex" justifyContent="space-between">
              <SecondaryButton
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                size="large"
              >
                Previous
              </SecondaryButton>
              <PrimaryButton
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                size="large"
              >
                {currentIndex + 1 < mcqIds.length ? "Next" : "Submit"}
              </PrimaryButton>
            </Box>
          </QuestionContainer>
        </Grid>

        <Grid item xs={12} md={3} sx={{ display: "flex", flexDirection: "column" }}>
          <SidebarContainer>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0c83c8", mb: 2 }}>
              {studentName}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <AnalogClock timeLeft={timeLeft} />
            </Box>
            
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0c83c8" }}>
                {formatTime(timeLeft)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Time Remaining
              </Typography>
            </Box>

            <Box mt={2} mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
                <PieChartIcon sx={{ mr: 1, color: "#0c83c8" }} />
                Summary
              </Typography>
              
              <SummaryPieChart data={{
                answered: statusCounts.answered,
                marked: statusCounts.marked,
                notAnswered: statusCounts.notAnswered,
                notVisited: statusCounts.notVisited
              }} />
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                Question Navigator
              </Typography>
              <Box display="flex" flexWrap="wrap" justifyContent="center">
                {mcqIds.map((_, index) => (
                  <Tooltip 
                    key={index} 
                    title={
                      getQuestionStatus(index) === "answered" ? "Answered" :
                      getQuestionStatus(index) === "marked" ? "Marked for Review" :
                      getQuestionStatus(index) === "notAnswered" ? "Not Answered" : "Not Visited"
                    }
                  >
                    <QuestionShape
                      shape={getQuestionShape(index)}
                      status={getQuestionStatus(index)}
                      onClick={() => handleQuestionNavigation(index)}
                    >
                      {index + 1}
                    </QuestionShape>
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </SidebarContainer>
        </Grid>
      </Grid>

      <Dialog 
        open={warningOpen} 
        onClose={() => {}}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }
        }}
      >
        <DialogContent>
          <Typography>Exiting full screen will submit your test. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleStay}>Stay</SecondaryButton>
          <Button 
            onClick={handleSubmit} 
            sx={{ 
              backgroundColor: "#fc7a46",
              color: "white",
              "&:hover": {
                backgroundColor: "#e56a3d",
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={refreshWarningOpen} 
        onClose={() => {}}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }
        }}
      >
        <DialogContent>
          <Typography>Navigating away will submit your test. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleStay}>Stay</SecondaryButton>
          <Button 
            onClick={handleSubmit} 
            sx={{ 
              backgroundColor: "#fc7a46",
              color: "white",
              "&:hover": {
                backgroundColor: "#e56a3d",
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </FullScreenCard>
  );
};

export default McqTest;
