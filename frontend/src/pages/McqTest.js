"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Tooltip,
  useMediaQuery,
  useTheme,
  Zoom,
  Fade,
} from "@mui/material"
import { styled, keyframes } from "@mui/material/styles"
import {
  Flag as FlagIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpOutlineIcon,
  AccessTime as AccessTimeIcon,
  QuestionMark as QuestionMarkIcon,
} from "@mui/icons-material"
import { getTestById, getMcqById, submitTestResult } from "../axios"

// Pulse animation for the CircularProgress
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

// Fade-in animation for the text
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

// Shimmer animation for progress bar
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

// Wave animation for progress bar
const wave = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`

// Custom Circular Progress Component
const CustomCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: "#0c83c8",
  "& .MuiCircularProgress-circle": {
    strokeLinecap: "round",
  },
  animation: `${pulse} 1.5s infinite ease-in-out`,
}))

// Styled Components
const FullScreenCard = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "100vh",
  margin: 0,
  borderRadius: 0,
  overflowY: "auto",
  overflowX: "hidden",
  userSelect: "none",
  backgroundColor: "#f8f9fa",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}))

const TimerBox = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  background: `linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)`,
  color: "white",
  padding: theme.spacing(1),
  zIndex: 1000,
  userSelect: "none",
  boxShadow: "0 4px 20px rgba(12, 131, 200, 0.25)",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
}))

const QuestionIndicator = styled(Box)(({ theme, status }) => {
  const baseStyles = {
    width: 36,
    height: 36,
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
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    "&:hover": {
      transform: "scale(1.1) translateY(-3px)",
      boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
    },
    userSelect: "none",
    [theme.breakpoints.down("sm")]: {
      width: 28,
      height: 28,
      fontSize: "0.8rem",
      margin: theme.spacing(0.4),
    },
  }

  const statusStyles = {
    answered: {
      borderRadius: "50%",
      background: "linear-gradient(145deg, #43a047 0%, #388e3c 100%)",
    },
    marked: {
      borderRadius: "8px",
      transform: "rotate(45deg)",
      background: "linear-gradient(145deg, #ff8f65 0%, #fc7a46 100%)",
      "& > *": { transform: "rotate(-45deg)" },
      "&:hover": { transform: "rotate(45deg) scale(1.1) translateY(-3px)" },
    },
    notAnswered: {
      borderRadius: "8px",
      background: "linear-gradient(145deg, #f55a4e 0%, #e53935 100%)",
    },
    notVisited: {
      borderRadius: "12px",
      background: "linear-gradient(145deg, #f5f5f5 0%, #e0e0e0 100%)",
    },
  }

  return {
    ...baseStyles,
    ...(statusStyles[status] || statusStyles.notVisited),
  }
})

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 15,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
  },
}))

const PrimaryButton = styled(StyledButton)({
  background: "linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)",
  "&:hover": {
    background: "linear-gradient(135deg, #0a6eaa 0%, #085d96 100%)",
  },
})

const SecondaryButton = styled(StyledButton)({
  color: "#0c83c8",
  borderColor: "#0c83c8",
  "&:hover": {
    borderColor: "#0a6eaa",
    backgroundColor: "rgba(12, 131, 200, 0.05)",
  },
})

const OptionCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: 15,
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  border: selected ? "2px solid #0c83c8" : "1px solid #e0e0e0",
  backgroundColor: selected ? "rgba(12, 131, 200, 0.05)" : "#fff",
  boxShadow: selected ? "0 4px 15px rgba(12, 131, 200, 0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
  "&:hover": {
    backgroundColor: selected ? "rgba(12, 131, 200, 0.1)" : "rgba(0, 0, 0, 0.02)",
    transform: "translateY(-2px)",
    boxShadow: selected ? "0 6px 18px rgba(12, 131, 200, 0.2)" : "0 4px 12px rgba(0,0,0,0.1)",
  },
  "& .MuiFormControlLabel-root": { width: "100%", margin: 0, pointerEvents: "none" },
  "& .MuiRadio-root": { pointerEvents: "none" },
}))

// Custom Progress Bar Component with hover animation
const ProgressBarContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 12,
  borderRadius: 15,
  backgroundColor: "rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
  marginBottom: theme.spacing(2),
  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
}))

const ProgressBarFill = styled(Box)(({ theme, value }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${value}%`,
  background: `linear-gradient(90deg, #0c83c8 0%, #0a6eaa 100%)`,
  borderRadius: 15,
  transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%)`,
    backgroundSize: "200% 100%",
    animation: `${shimmer} 2s infinite linear`,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.1)",
    width: "100%",
    height: "100%",
    transform: "translateX(-100%)",
    animation: `${wave} 2s infinite ease-in-out`,
  },
}))

const ProgressBarLabel = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: "0.7rem",
  fontWeight: "bold",
  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  zIndex: 1,
}))

// Add a new hover animation keyframe
const hoverAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  50% { transform: translateY(-20px); opacity: 1; }
  100% { transform: translateY(-40px); opacity: 0; }
`

const ProgressHoverIndicator = styled(Box)(({ theme, value }) => ({
  position: "absolute",
  top: -30,
  left: `${value}%`,
  transform: "translateX(-50%)",
  background: "#0c83c8",
  color: "white",
  padding: "2px 6px",
  borderRadius: 10,
  fontSize: "0.7rem",
  fontWeight: "bold",
  opacity: 0,
  pointerEvents: "none",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    border: "5px solid transparent",
    borderTopColor: "#0c83c8",
  },
  ".progress-container:hover &": {
    animation: `${hoverAnimation} 2s infinite`,
  },
}))

const MarkReviewButton = styled(Button)(({ theme, marked }) => ({
  borderRadius: 15,
  backgroundColor: marked ? "#fc7a46" : "transparent",
  color: marked ? "white" : "#fc7a46",
  border: "1px solid #fc7a46",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: marked ? "#e56a3d" : "rgba(252, 122, 70, 0.1)",
    transform: marked ? "translateY(-2px)" : "translateY(-2px)",
    boxShadow: marked ? "0 4px 12px rgba(252, 122, 70, 0.3)" : "0 2px 8px rgba(252, 122, 70, 0.1)",
  },
}))

const QuestionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  backgroundColor: "#fff",
  height: "100%",
  overflowY: "auto",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}))

const SidebarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 20,
  backgroundColor: "#fff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  height: "100%",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },
}))

const NavigatorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  maxHeight: "calc(100vh - 400px)",
  overflowY: "auto",
  padding: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(0.4),
    maxHeight: "auto",
  },
}))

const VisualsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: { flexDirection: "column" },
}))

const WarningDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 20,
    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    border: "1px solid rgba(12, 131, 200, 0.1)",
    padding: theme.spacing(2),
    overflow: "hidden",
  },
}))

const WarningTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  color: "#f44336",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}))

const WarningButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 15,
  padding: theme.spacing(1, 3),
  fontWeight: "bold",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  ...(variant === "stay" && {
    background: "linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)",
    color: "white",
    "&:hover": {
      background: "linear-gradient(135deg, #0a6eaa 0%, #085d96 100%)",
      transform: "translateY(-3px)",
      boxShadow: "0 6px 15px rgba(12, 131, 200, 0.3)",
    },
  }),
  ...(variant === "submit" && {
    background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
    color: "white",
    "&:hover": {
      background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
      transform: "translateY(-3px)",
      boxShadow: "0 6px 15px rgba(244, 67, 54, 0.3)",
    },
  }),
}))

const SubmittingOverlay = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
}))

// New Loading Container
const LoadingContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
}))

const LoadingBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 25,
  backgroundColor: "#fff",
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  border: "1px solid rgba(12, 131, 200, 0.1)",
}))

const LoadingText = styled(Typography)(({ theme }) => ({
  color: "#0c83c8",
  fontWeight: "bold",
  animation: `${fadeIn} 1s ease-in`,
}))

// Completely redesigned Timer Component without numerical values
const EnhancedTimer = ({ timeLeft }) => {
  const canvasRef = useRef(null)
  const totalSeconds = 3600
  const percentageRemaining = (timeLeft / totalSeconds) * 100
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Animation function
    const animate = () => {
      const now = Date.now()
      const deltaTime = now - lastTimeRef.current
      lastTimeRef.current = now

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      ctx.fillStyle = "#f5f5f5"
      ctx.fillRect(0, 0, width, height)

      // Calculate time segments
      const totalSegments = 60
      const segmentsRemaining = Math.ceil((percentageRemaining / 100) * totalSegments)
      const segmentWidth = width / totalSegments

      // Draw time segments
      for (let i = 0; i < totalSegments; i++) {
        const x = i * segmentWidth

        if (i < segmentsRemaining) {
          // Active segment
          const gradient = ctx.createLinearGradient(x, 0, x + segmentWidth, 0)
          gradient.addColorStop(0, "#0c83c8")
          gradient.addColorStop(1, "#0a6eaa")

          ctx.fillStyle = gradient

          // Animate the current segment
          const isCurrentSegment = i === segmentsRemaining - 1
          const segmentHeight = isCurrentSegment ? height * (0.7 + 0.3 * Math.sin(now / 500)) : height

          ctx.fillRect(x, (height - segmentHeight) / 2, segmentWidth - 2, segmentHeight)

          // Add glow to active segments
          ctx.shadowColor = "rgba(12, 131, 200, 0.3)"
          ctx.shadowBlur = 5
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        } else {
          // Inactive segment
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
          ctx.fillRect(x, height * 0.4, segmentWidth - 2, height * 0.2)
        }
      }

      // Draw animated particles for visual interest
      const particleCount = 5
      for (let i = 0; i < particleCount; i++) {
        const particleX = (segmentsRemaining / totalSegments) * width * (0.9 + 0.1 * Math.sin(now / 1000 + i))
        const particleY = height / 2 + 10 * Math.sin(now / 500 + (i * Math.PI) / particleCount)
        const particleSize = 2 + Math.sin(now / 300 + i) * 1

        ctx.fillStyle = "#fc7a46"
        ctx.beginPath()
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [timeLeft, percentageRemaining])

  return (
    <Box sx={{ textAlign: "center", width: { xs: "100%", sm: "45%" }, position: "relative" }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#0c83c8" }}>
        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
        Time Remaining
      </Typography>
      <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <canvas
          ref={canvasRef}
          width="200"
          height="30"
          style={{ display: "block", width: "100%", height: "30px" }}
        ></canvas>
      </Box>
    </Box>
  )
}

// Enhanced Pie Chart Component with smoother animations
const EnhancedPieChart = ({ data }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const currentAnglesRef = useRef({})
  const targetAnglesRef = useRef({})

  useEffect(() => {
    const total = Object.values(data).reduce((acc, val) => acc + val, 0)
    if (total === 0) return

    let startAngle = -Math.PI / 2
    const newTargetAngles = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value === 0) {
        newTargetAngles[key] = { start: startAngle, end: startAngle }
        return
      }

      const sliceAngle = (value / total) * 2 * Math.PI
      const endAngle = startAngle + sliceAngle

      newTargetAngles[key] = { start: startAngle, end: endAngle }
      startAngle = endAngle
    })

    targetAnglesRef.current = newTargetAngles

    // Initialize current angles if not set
    if (Object.keys(currentAnglesRef.current).length === 0) {
      currentAnglesRef.current = JSON.parse(JSON.stringify(newTargetAngles))
    }

    const animate = () => {
      let needsAnimation = false

      // Update current angles towards target angles
      Object.keys(targetAnglesRef.current).forEach((key) => {
        if (!currentAnglesRef.current[key]) {
          currentAnglesRef.current[key] = { start: -Math.PI / 2, end: -Math.PI / 2 }
        }

        const target = targetAnglesRef.current[key]
        const current = currentAnglesRef.current[key]

        // Animate start angle
        if (Math.abs(current.start - target.start) > 0.01) {
          current.start += (target.start - current.start) * 0.1
          needsAnimation = true
        } else {
          current.start = target.start
        }

        // Animate end angle
        if (Math.abs(current.end - target.end) > 0.01) {
          current.end += (target.end - current.end) * 0.1
          needsAnimation = true
        } else {
          current.end = target.end
        }
      })

      drawChart()

      if (needsAnimation) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data])

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 10

    ctx.clearRect(0, 0, width, height)

    const colors = {
      answered: {
        fill: "#4caf50",
        gradient: ["#66bb6a", "#43a047"],
      },
      marked: {
        fill: "#fc7a46",
        gradient: ["#ff8f65", "#e56a3d"],
      },
      notAnswered: {
        fill: "#f44336",
        gradient: ["#ef5350", "#d32f2f"],
      },
      notVisited: {
        fill: "#e0e0e0",
        gradient: ["#f5f5f5", "#bdbdbd"],
      },
    }

    // Add shadow for the entire pie
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    Object.entries(currentAnglesRef.current).forEach(([key, angles]) => {
      if (angles.start === angles.end) return

      // Create gradient for slice
      const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
      gradient.addColorStop(0, colors[key].gradient[0])
      gradient.addColorStop(1, colors[key].gradient[1])

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, angles.start, angles.end)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Add a subtle stroke
      ctx.lineWidth = 1
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.stroke()
    })

    // Draw inner circle (creates donut effect)
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = "#fff"
    ctx.fill()

    // Add a subtle inner shadow to the donut hole
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 5
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  return (
    <Box sx={{ textAlign: "center", width: { xs: "100%", sm: "45%" } }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#0c83c8" }}>
        <QuestionMarkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
        Question Summary
      </Typography>
      <Box sx={{ position: "relative" }}>
        <canvas ref={canvasRef} width="100" height="100" style={{ margin: "0 auto" }}></canvas>
      </Box>
    </Box>
  )
}

const StatusIndicator = ({ status, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", mx: 1 }}>
    <QuestionIndicator
      status={status}
      sx={{
        width: 16,
        height: 16,
        minWidth: 16,
        margin: 0,
        marginRight: 0.5,
        fontSize: "0.6rem",
        cursor: "default",
        "&:hover": { transform: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
      }}
    />
    <Typography variant="caption">{label}</Typography>
  </Box>
)

const McqTest = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [mcqIds, setMcqIds] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentMcq, setCurrentMcq] = useState(null)
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState({})
  const [testName, setTestName] = useState("")
  const [testLanguage, setTestLanguage] = useState("")
  const [timeLeft, setTimeLeft] = useState(3600)
  const [loading, setLoading] = useState(true)
  const [fetchingMcq, setFetchingMcq] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const [refreshWarningOpen, setRefreshWarningOpen] = useState(false)
  const [submitWarningOpen, setSubmitWarningOpen] = useState(false)
  const [unansweredWarningOpen, setUnansweredWarningOpen] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [studentName, setStudentName] = useState("Loading...")
  const [visitedQuestions, setVisitedQuestions] = useState({})
  const [userId, setUserId] = useState(null)
  const [pocId, setPocId] = useState(null)
  const [correctAnswers, setCorrectAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("true")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setStudentName(user.user.full_name)
        setUserId(user.user.user_id)
        setPocId(user.user.mod_poc_id?.mod_poc_id)
      } catch (error) {
        console.error("Error parsing user from session storage:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (warningCount > 1) {
      console.log("Warning count exceeded 1, submitting test...")
      handleSubmit()
    }
  }, [warningCount])

  useEffect(() => {
    const enterFullScreen = () => {
      document.documentElement.requestFullscreen().catch((err) => console.error(err))
      if (
        typeof window !== "undefined" &&
        window.screen &&
        window.screen.orientation &&
        window.screen.orientation.lock
      ) {
        window.screen.orientation.lock("portrait").catch((err) => console.error("Orientation lock failed:", err))
      }
    }
    enterFullScreen()

    window.history.pushState(null, document.title, window.location.href)

    const preventNavigation = (e) => {
      e.preventDefault()
      setRefreshWarningOpen(true)
      setWarningCount((prev) => prev + 1)
      window.history.pushState(null, document.title, window.location.href)
      return false
    }

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setWarningOpen(true)
        setWarningCount((prev) => prev + 1)
        new Audio("/alert.wav").play().catch(() => {})
      }
    }

    const handleKeyDown = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || ["F5", "Tab", "Escape", "PrintScreen", "Backspace"].includes(e.key)) {
        e.preventDefault()
        setRefreshWarningOpen(true)
        setWarningCount((prev) => prev + 1)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setRefreshWarningOpen(true)
        setWarningCount((prev) => prev + 1)
      }
    }

    const handleContextMenu = (e) => e.preventDefault()
    const handleCopy = (e) => e.preventDefault()
    const handleCut = (e) => e.preventDefault()
    const handlePaste = (e) => e.preventDefault()

    const preventTouch = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
        setRefreshWarningOpen(true)
        setWarningCount((prev) => prev + 1)
      }
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = "Leaving will submit your test. Are you sure?"
      setRefreshWarningOpen(true)
      setWarningCount((prev) => prev + 1)
      return e.returnValue
    }

    const handlePopState = (e) => {
      e.preventDefault()
      setRefreshWarningOpen(true)
      setWarningCount((prev) => prev + 1)
      window.history.pushState(null, document.title, window.location.href)
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    }

    window.addEventListener("popstate", handlePopState)
    document.addEventListener("fullscreenchange", handleFullScreenChange)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("copy", handleCopy)
    document.addEventListener("cut", handleCut)
    document.addEventListener("paste", handlePaste)
    document.addEventListener("touchstart", preventTouch, { passive: false })
    document.addEventListener("touchmove", preventTouch, { passive: false })
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", preventNavigation)

    const historyPushInterval = setInterval(() => {
      window.history.pushState(null, document.title, window.location.href)
    }, 100)

    return () => {
      clearInterval(historyPushInterval)
      window.removeEventListener("popstate", handlePopState)
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("cut", handleCut)
      document.removeEventListener("paste", handlePaste)
      document.removeEventListener("touchstart", preventTouch)
      document.removeEventListener("touchmove", preventTouch)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", preventNavigation)
      document.exitFullscreen().catch(() => {})
      if (
        typeof window !== "undefined" &&
        window.screen &&
        window.screen.orientation &&
        window.screen.orientation.unlock
      ) {
        window.screen.orientation.unlock()
      }
    }
  }, [])

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const res = await getTestById(testId)
        setMcqIds(res.test_mcq_id || [])
        setTestName(res.test_name)
        setTestLanguage(res.test_language)
        setLoading(false)
        const initialVisited = { 0: true }
        setVisitedQuestions(initialVisited)
      } catch (err) {
        console.error("Failed to fetch test:", err)
        setLoading(false)
      }
    }
    fetchTestData()
  }, [testId])

  useEffect(() => {
    const fetchCurrentMcq = async () => {
      if (mcqIds.length && currentIndex < mcqIds.length) {
        setFetchingMcq(true)
        try {
          const res = await getMcqById(mcqIds[currentIndex])
          setCurrentMcq(res)
          setCorrectAnswers((prev) => ({
            ...prev,
            [res.mcq_id]: res.mcq_answer,
          }))
          setVisitedQuestions((prev) => ({ ...prev, [currentIndex]: true }))
        } catch (err) {
          console.error("Failed to fetch MCQ:", err)
        } finally {
          setFetchingMcq(false)
        }
      }
    }
    fetchCurrentMcq()
  }, [mcqIds, currentIndex])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours > 0 ? `${hours}:` : ""}${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleOptionSelect = (option) => {
    setAnswers((prev) => {
      if (prev[currentMcq.mcq_id] === option) {
        const newAnswers = { ...prev }
        delete newAnswers[currentMcq.mcq_id]
        return newAnswers
      }
      return { ...prev, [currentMcq.mcq_id]: option }
    })
  }

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentMcq.mcq_id]: !prev[currentMcq.mcq_id],
    }))
  }

  const handleNext = () => {
    if (currentIndex + 1 < mcqIds.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      handleManualSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1)
  }

  const handleManualSubmit = () => {
    const unansweredCount = mcqIds.length - Object.keys(answers).length
    if (unansweredCount > 0) {
      setUnansweredWarningOpen(true)
    } else {
      setSubmitWarningOpen(true)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (!userId || !pocId) {
        console.error("User ID or POC ID not available")
        return
      }

      const allMcqResponses = await Promise.all(mcqIds.map((mcqId) => getMcqById(mcqId)))

      const updatedCorrectAnswers = allMcqResponses.reduce((acc, mcq) => {
        acc[mcq.mcq_id] = mcq.mcq_answer
        return acc
      }, {})

      const score = Object.entries(answers).reduce((acc, [mcqId, userAnswer]) => {
        return acc + (userAnswer === updatedCorrectAnswers[mcqId] ? 1 : 0)
      }, 0)

      const resultData = {
        result_user_id: userId,
        result_test_id: testId,
        result_score: score,
        result_total_score: mcqIds.length,
        result_poc_id: pocId,
        testName,
        testLanguage,
      }
      await submitTestResult(resultData)
      console.log("Test submitted successfully:", resultData)
      navigate("/test-result", { state: { resultData } })
    } catch (err) {
      console.error("Error submitting test:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStay = () => {
    setRefreshWarningOpen(false)
    setWarningOpen(false)
    setSubmitWarningOpen(false)
    setUnansweredWarningOpen(false)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error("Failed to re-enter fullscreen:", err))
    }
    window.history.pushState(null, document.title, window.location.href)
  }

  const handleQuestionNavigation = (index) => setCurrentIndex(index)

  const getQuestionStatus = (index) => {
    const mcqId = mcqIds[index]
    if (answers[mcqId]) return "answered"
    if (markedForReview[mcqId]) return "marked"
    if (visitedQuestions[index] && !answers[mcqId]) return "notAnswered"
    return "notVisited"
  }

  const getStatusCounts = () => {
    let answered = 0
    let marked = 0
    let notAnswered = 0
    let notVisited = 0
    mcqIds.forEach((mcqId, index) => {
      if (answers[mcqId]) answered++
      else if (markedForReview[mcqId]) marked++
      else if (visitedQuestions[index]) notAnswered++
      else notVisited++
    })
    return { answered, marked, notAnswered, notVisited }
  }

  if (loading) {
    return (
      <LoadingContainer>
        <Fade in={true} timeout={800}>
          <LoadingBox elevation={3}>
            <CustomCircularProgress size={60} thickness={5} />
            <LoadingText variant="h5">Loading Test...</LoadingText>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Please wait while we prepare your assessment
            </Typography>
          </LoadingBox>
        </Fade>
      </LoadingContainer>
    )
  }

  const statusCounts = getStatusCounts()
  const progress = (Object.keys(answers).length / mcqIds.length) * 100

  return (
    <FullScreenCard>
      <TimerBox>
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {testName}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </TimerBox>

      <Box sx={{ mt: 7, p: 2 }}>
        {/* Reintroduced Progress Bar with hover animation */}
        <Box className="progress-container" sx={{ position: "relative" }}>
          <ProgressBarContainer>
            <ProgressBarFill value={progress} />

          </ProgressBarContainer>
          <ProgressHoverIndicator value={progress}>{Math.round(progress)}%</ProgressHoverIndicator>
        </Box>

        <Grid container spacing={2} sx={{ height: { xs: "auto", md: "calc(100vh - 250px)" } }}>
          <Grid item xs={12} md={8} order={{ xs: 1, md: 1 }}>
            <Zoom in={true} style={{ transitionDelay: "100ms" }}>
              <QuestionContainer>
                {fetchingMcq || !currentMcq ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CustomCircularProgress size={50} thickness={5} />
                    <Typography variant="h6" sx={{ ml: 2, color: "#0c83c8" }}>
                      Fetching Question...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
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

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 5,
                        background:
                          "linear-gradient(145deg, rgba(12, 131, 200, 0.05) 0%, rgba(12, 131, 200, 0.02) 100%)",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                        mb: 3,
                      }}
                    >
                      <Typography variant="body1" gutterBottom sx={{ fontSize: "1.1rem" }}>
                        {currentMcq.mcq_question}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                        Mark: 1
                      </Typography>
                    </Box>

                    <Box mt={2}>
                      <RadioGroup
                        value={answers[currentMcq.mcq_id] || ""}
                        onChange={(e) => handleOptionSelect(e.target.value)}
                      >
                        {currentMcq.mcq_options.map((option, idx) => (
                          <Fade in={true} key={idx} timeout={300} style={{ transitionDelay: `${idx * 50}ms` }}>
                            <OptionCard
                              selected={answers[currentMcq.mcq_id] === option}
                              onClick={() => handleOptionSelect(option)}
                            >
                              <FormControlLabel
                                value={option}
                                control={
                                  <Radio
                                    sx={{
                                      color: "#0c83c8",
                                      "&.Mui-checked": {
                                        color: "#0c83c8",
                                      },
                                      "& .MuiSvgIcon-root": {
                                        fontSize: 20,
                                      },
                                    }}
                                  />
                                }
                                label={option}
                                sx={{ width: "100%" }}
                              />
                            </OptionCard>
                          </Fade>
                        ))}
                      </RadioGroup>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="space-between">
                      <SecondaryButton
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        size={isMobile ? "medium" : "large"}
                      >
                        Previous
                      </SecondaryButton>
                      <PrimaryButton
                        variant="contained"
                        endIcon={currentIndex + 1 < mcqIds.length ? <ArrowForwardIcon /> : <CheckCircleIcon />}
                        onClick={handleNext}
                        size={isMobile ? "medium" : "large"}
                      >
                        {currentIndex + 1 < mcqIds.length ? "Next" : "Submit"}
                      </PrimaryButton>
                    </Box>
                  </>
                )}
              </QuestionContainer>
            </Zoom>
          </Grid>

          <Grid item xs={12} md={4} order={{ xs: 2, md: 2 }}>
            <Zoom in={true} style={{ transitionDelay: "200ms" }}>
              <SidebarContainer>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#0c83c8",
                    mb: 2,
                    background: "linear-gradient(90deg, #0c83c8 0%, #0a6eaa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {studentName}
                </Typography>

                <VisualsContainer>
                  <EnhancedTimer timeLeft={timeLeft} />
                  <EnhancedPieChart
                    data={{
                      answered: statusCounts.answered,
                      marked: statusCounts.marked,
                      notAnswered: statusCounts.notAnswered,
                      notVisited: statusCounts.notVisited,
                    }}
                  />
                </VisualsContainer>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(12, 131, 200, 0.05)",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#0c83c8" }}>
                    <HelpOutlineIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                    Question Navigator
                  </Typography>

                  <NavigatorContainer>
                    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", mb: 1 }}>
                      <StatusIndicator status="answered" label="Answered" />
                      <StatusIndicator status="marked" label="Marked" />
                      <StatusIndicator status="notAnswered" label="Not Answered" />
                      <StatusIndicator status="notVisited" label="Not Visited" />
                    </Box>
                    {mcqIds.map((_, index) => (
                      <Tooltip
                        key={index}
                        title={
                          getQuestionStatus(index) === "answered"
                            ? "Answered"
                            : getQuestionStatus(index) === "marked"
                              ? "Marked for Review"
                              : getQuestionStatus(index) === "notAnswered"
                                ? "Not Answered"
                                : "Not Visited"
                        }
                        arrow
                        placement="top"
                      >
                        <QuestionIndicator
                          status={getQuestionStatus(index)}
                          onClick={() => handleQuestionNavigation(index)}
                        >
                          {index + 1}
                        </QuestionIndicator>
                      </Tooltip>
                    ))}
                  </NavigatorContainer>
                </Box>

                <Box sx={{ width: "100%", mt: 3 }}>
                  <PrimaryButton
                    variant="contained"
                    onClick={handleManualSubmit}
                    startIcon={<CheckCircleIcon />}
                    fullWidth
                    disabled={submitting}
                    sx={{
                      py: 1.5,
                      background: "linear-gradient(135deg, #0c83c8 0%, #0a6eaa 100%)",
                      boxShadow: "0 4px 15px rgba(12, 131, 200, 0.3)",
                    }}
                  >
                    Submit Test
                  </PrimaryButton>
                </Box>
              </SidebarContainer>
            </Zoom>
          </Grid>
        </Grid>
      </Box>

      {submitting && (
        <SubmittingOverlay>
          <Fade in={true} timeout={500}>
            <Box
              sx={{
                textAlign: "center",
                backgroundColor: "#fff",
                padding: 4,
                borderRadius: 5,
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                border: "1px solid rgba(12, 131, 200, 0.1)",
              }}
            >
              <CustomCircularProgress size={60} thickness={5} />
              <Typography variant="h5" sx={{ mt: 2, color: "#0c83c8", fontWeight: "bold" }}>
                Submitting Your Test
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we process your answers...
              </Typography>
            </Box>
          </Fade>
        </SubmittingOverlay>
      )}

      <WarningDialog open={warningOpen} onClose={handleStay}>
        <WarningTitle>
          <WarningIcon sx={{ fontSize: 32 }} />
          Full Screen Warning
        </WarningTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Exiting full screen mode will automatically submit your test. All progress will be saved and the test will
            end.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please stay in full screen to continue the test.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <WarningButton variant="stay" onClick={handleStay}>
            Stay in Test
          </WarningButton>
          <WarningButton variant="submit" onClick={handleSubmit}>
            Submit & Exit
          </WarningButton>
        </DialogActions>
      </WarningDialog>

      <WarningDialog open={refreshWarningOpen} onClose={handleStay}>
        <WarningTitle>
          <WarningIcon sx={{ fontSize: 32 }} />
          Navigation Warning
        </WarningTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Attempting to navigate away (including back button) will automatically submit your answers. This action
            cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Return to the test to continue or submit now to end.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <WarningButton variant="stay" onClick={handleStay}>
            Return to Test
          </WarningButton>
          <WarningButton variant="submit" onClick={handleSubmit}>
            Submit & Exit
          </WarningButton>
        </DialogActions>
      </WarningDialog>

      <WarningDialog open={submitWarningOpen} onClose={handleStay}>
        <WarningTitle>
          <WarningIcon sx={{ fontSize: 32 }} />
          Confirm Submission
        </WarningTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to submit your test? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All your answers will be saved, and the test will end.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <WarningButton variant="stay" onClick={handleStay}>
            Continue Test
          </WarningButton>
          <WarningButton variant="submit" onClick={handleSubmit}>
            Submit Test
          </WarningButton>
        </DialogActions>
      </WarningDialog>

      <WarningDialog open={unansweredWarningOpen} onClose={handleStay}>
        <WarningTitle>
          <WarningIcon sx={{ fontSize: 32 }} />
          Unanswered Questions Warning
        </WarningTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have {mcqIds.length - Object.keys(answers).length} unanswered questions. Submitting now will mark these
            as incorrect.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Would you like to continue the test or submit it now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <WarningButton variant="stay" onClick={handleStay}>
            Continue Test
          </WarningButton>
          <WarningButton variant="submit" onClick={handleSubmit}>
            Submit Test
          </WarningButton>
        </DialogActions>
      </WarningDialog>
    </FullScreenCard>
  )
}

export default McqTest

