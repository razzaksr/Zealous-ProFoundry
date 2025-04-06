import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import Dash from "../components/dash";

const API_BASE_URL = "http://localhost:4000";

const McqTest = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const testMcqIds = location.state?.testMcqIds || [];
  const testTotalScore = location.state?.testTotalScore || 0;

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [userId, setUserId] = useState("");
  const [pocId, setPocId] = useState("");
  const [test_id, setTestId] = useState("");

  useEffect(() => {
    if (testId) setTestId(testId);

    const fetchMcqs = async () => {
      try {
        const mcqResponses = await Promise.all(
          testMcqIds.map(async (mcqId) => {
            try {
              const res = await axios.get(`${API_BASE_URL}/test_gateway/test/get_by_test_id/${mcqId}`);
              return res.data;
            } catch (err) {
              console.error(`MCQ ${mcqId} not found`);
              return null;
            }
          })
        );
        const validMcqs = mcqResponses.filter((mcq) => mcq !== null);
        if (validMcqs.length === 0) {
          setError("No valid MCQs found for this test.");
        }
        setMcqs(validMcqs);
      } catch (err) {
        console.error("Error fetching MCQs:", err);
        setError("Failed to load questions.");
      }
      setLoading(false);
    };

    fetchMcqs();

    const storedUser = sessionStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.user_id) {
          setUserId(user.user.user_id);
          fetchModuleAndPoc(user.user.user_id);
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [testId, testMcqIds]);

  const fetchModuleAndPoc = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/poc_gateway/poc/mod_and_poc/${userId}`);
      if (response.data && response.data.mod_poc_id) {
        setPocId(response.data.mod_poc_id);
      }
    } catch (err) {
      console.error("Error fetching module and PoC:", err);
    }
  };

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer === mcqs[currentIndex].mcq_answer) {
      setScore((prev) => prev + 1);
    }
    setSelectedAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
    setSelectedAnswer("");
  };

  const handleSubmit = async () => {
    const finalScore = score + (selectedAnswer === mcqs[currentIndex].mcq_answer ? 1 : 0);

    const resultData = {
      result_user_id: userId,
      result_test_id: test_id,
      result_score: finalScore,
      result_total_score: testTotalScore,
      result_poc_id: pocId,
    };

    try {
      await axios.post(`${API_BASE_URL}/mcq_gateway/mcq/submit_result`, resultData);
      alert("Test submitted successfully!");
      navigate(`/test-result`, { state: { resultData } });
    } catch (err) {
      console.error("Error submitting result:", err);
      alert("Failed to submit test.");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Dash />
      <Container maxWidth="md" sx={{ py: 5 }}>
        {mcqs.length > 0 && currentIndex < mcqs.length ? (
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #6DD5FA, #2980B9)",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Question {currentIndex + 1} of {mcqs.length}
            </Typography>

            <Typography variant="h6" gutterBottom>
              {mcqs[currentIndex].mcq_question}
            </Typography>

            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => handleAnswerSelection(e.target.value)}
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 1,
                mt: 2,
              }}
            >
              {mcqs[currentIndex].mcq_options.map((option, idx) => (
                <FormControlLabel
                  key={idx}
                  value={option}
                  control={<Radio sx={{ color: "#f1c40f" }} />}
                  label={
                    <Typography variant="body1" sx={{ fontSize: "16px", color: "#000" }}>
                      {option}
                    </Typography>
                  }
                  sx={{
                    width: "80%",
                    background: "#fff",
                    color: "#000",
                    borderRadius: 2,
                    padding: "10px 15px",
                    boxShadow: 2,
                    "&:hover": { background: "#f1f1f1" },
                  }}
                />
              ))}
            </RadioGroup>

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#e67e22",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#d35400" },
                }}
                disabled={currentIndex === 0}
                onClick={handlePrevious}
              >
                Previous
              </Button>

              {currentIndex === mcqs.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  sx={{
                    backgroundColor: "#27AE60",
                    "&:hover": { backgroundColor: "#229954" },
                  }}
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  Submit Test
                </Button>
              ) : (
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#3498DB", "&:hover": { backgroundColor: "#2980B9" } }}
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Typography variant="h6" color="error">
            No MCQs found for this test.
          </Typography>
        )}
      </Container>
    </>
  );
};

export default McqTest;
