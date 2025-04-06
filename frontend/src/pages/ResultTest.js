import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Card, CardContent } from "@mui/material"
import { styled } from "@mui/material/styles"
import { CheckCircle as CheckCircleIcon, Home as HomeIcon, Refresh as RefreshIcon } from "@mui/icons-material"

const ResultContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: "0 auto",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
  overflow: "hidden",
}))

const ScoreCircle = styled(Box)(({ theme, percentage }) => ({
  position: "relative",
  width: 200,
  height: 200,
  margin: "0 auto",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f5f5f5",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: `conic-gradient(
      ${percentage >= 70 ? "#4caf50" : percentage >= 40 ? "#fc7a46" : "#f44336"} 
      ${percentage * 3.6}deg, 
      #f5f5f5 ${percentage * 3.6}deg 360deg
    )`,
  },
}))

const InnerCircle = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "80%",
  height: "80%",
  borderRadius: "50%",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
}))

const StyledButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  margin: theme.spacing(1),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
}))

const PrimaryButton = styled(StyledButton)({
  backgroundColor: "#0c83c8",
  "&:hover": {
    backgroundColor: "#0a6eaa",
  },
})

const SecondaryButton = styled(StyledButton)({
  color: "#0c83c8",
  borderColor: "#0c83c8",
  "&:hover": {
    borderColor: "#0a6eaa",
  },
})

const ResultCard = styled(Card)(({ theme, status }) => ({
  transition: "all 0.3s ease",
  backgroundColor: status === "pass" ? "rgba(76, 175, 80, 0.05)" : "rgba(244, 67, 54, 0.05)",
  borderLeft: status === "pass" ? "4px solid #4caf50" : "4px solid #f44336",
  marginBottom: theme.spacing(2),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
}))

const ResultTest = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)

  useEffect(() => {
    // Simulate loading the result data
    const timer = setTimeout(() => {
      if (location.state?.resultData) {
        setResult(location.state.resultData)
      } else {
        // Mock data for demonstration
        setResult({
          result_score: 7,
          result_total_score: 10,
          result_test_id: "TEST123",
        })
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [location])

  const handleRetakeTest = () => {
    // Navigate back to the test
    if (result?.result_test_id) {
      navigate(`/test/${result.result_test_id}`)
    } else {
      navigate("/")
    }
  }

  const handleGoHome = () => {
    navigate("/")
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <CircularProgress sx={{ color: "#0c83c8" }} />
      </Box>
    )
  }

  const score = result.result_score
  const totalScore = result.result_total_score
  const percentage = Math.round((score / totalScore) * 100)
  const isPassed = percentage >= 60

  return (
    <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <ResultContainer>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#0c83c8" }}>
            Test Results
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Here's how you performed on the test
          </Typography>
        </Box>

        <Box mb={4}>
          <ScoreCircle percentage={percentage}>
            <InnerCircle>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {percentage}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your Score
              </Typography>
            </InnerCircle>
          </ScoreCircle>
        </Box>

        <ResultCard status={isPassed ? "pass" : "fail"}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              {isPassed ? (
                <CheckCircleIcon sx={{ color: "#4caf50", mr: 1, fontSize: "2rem" }} />
              ) : (
                <RefreshIcon sx={{ color: "#f44336", mr: 1, fontSize: "2rem" }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {isPassed ? "Congratulations! You passed." : "You didn't pass this time."}
              </Typography>
            </Box>
            <Typography variant="body1">
              {isPassed
                ? "Great job on completing the test successfully!"
                : "Don't worry, you can retake the test to improve your score."}
            </Typography>
          </CardContent>
        </ResultCard>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(12, 131, 200, 0.05)",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Score Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Correct Answers:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{score}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Total Questions:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{totalScore}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Percentage:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{percentage}%</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(252, 122, 70, 0.05)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                Test Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Test ID:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{result.result_test_id}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Date:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{new Date().toLocaleDateString()}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" mt={4}>
          <SecondaryButton variant="outlined" startIcon={<HomeIcon />} onClick={handleGoHome}>
            Go to Home
          </SecondaryButton>
          <PrimaryButton variant="contained" startIcon={<RefreshIcon />} onClick={handleRetakeTest}>
            Retake Test
          </PrimaryButton>
        </Box>
      </ResultContainer>
    </Box>
  )
}

export default ResultTest

