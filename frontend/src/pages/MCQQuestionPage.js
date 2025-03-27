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
} from "@mui/material";

const API_BASE_URL = "http://localhost:4000";

const McqTest = () => {
  const { testId } = useParams(); // Test ID from the URL
  const location = useLocation();
  const navigate = useNavigate();
  const testMcqIds = location.state?.testMcqIds || [];

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [userId, setUserId] = useState("");

  // Fetch MCQs for the test
  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const mcqResponses = await Promise.all(
          testMcqIds.map(async (mcqId) => {
            const res = await axios.get(`${API_BASE_URL}/mcq_gateway/mcq/get_mcq/${mcqId}`);
            return res.data;
          })
        );
        setMcqs(mcqResponses);
      } catch (err) {
        console.error("Error fetching MCQs:", err);
        setError("Failed to load questions.");
      }
      setLoading(false);
    };

    fetchMcqs();

    // Fetch user ID from session storage
    const storedUser = sessionStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.user.user_id);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [testMcqIds]);

  // Handle answer selection
  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  // Handle next question
  const handleNext = () => {
    if (selectedAnswer === mcqs[currentIndex].mcq_answer) {
      setScore(score + 1);
    }
    setSelectedAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  // Handle previous question
  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
    setSelectedAnswer("");
  };

  // Handle submission of the test
  const handleSubmit = async () => {
    // Check the last question answer and update score
    if (selectedAnswer === mcqs[currentIndex].mcq_answer) {
      setScore(score + 1);
    }

    const resultData = {
      result_user_id: userId,       // Use the userId from session
      result_test_id: testId,       // Use the testId from URL
      result_score: score + (selectedAnswer === mcqs[currentIndex].mcq_answer ? 1 : 0),
      result_poc_id: "",            // Modify if necessary
    };

    try {
      await axios.post(`${API_BASE_URL}/mcq_gateway/mcq/submit_result`, resultData);
      alert("Test submitted successfully!");
      navigate("/test-modules"); // Redirect after submission
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
    <Container maxWidth="md" sx={{ py: 5 }}>
      {mcqs.length > 0 && currentIndex < mcqs.length ? (
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Question {currentIndex + 1} of {mcqs.length}
          </Typography>

          <Typography variant="h6" gutterBottom>{mcqs[currentIndex].mcq_question}</Typography>

          <RadioGroup value={selectedAnswer} onChange={(e) => handleAnswerSelection(e.target.value)}>
            {mcqs[currentIndex].mcq_options.map((option, idx) => (
              <FormControlLabel key={idx} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button variant="contained" disabled={currentIndex === 0} onClick={handlePrevious}>
              Previous
            </Button>

            {currentIndex === mcqs.length - 1 ? (
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit Test
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} disabled={!selectedAnswer}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Typography variant="h6">No MCQs found for this test.</Typography>
      )}
    </Container>
  );
};

export default McqTest;
