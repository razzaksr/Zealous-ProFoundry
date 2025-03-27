import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Paper,
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Alert,
} from "@mui/material";

const API_BASE_URL = "http://localhost:4000/mcq_gateway/mcq/get_mcq";

const McqTestPage = ({ mcqIds }) => {
  const [mcqList, setMcqList] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});

  // Fetch MCQs based on mcqIds
  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const requests = mcqIds.map((id) => axios.get(`${API_BASE_URL}/${id}`));
        const responses = await Promise.all(requests);
        setMcqList(responses.map((res) => res.data));
      } catch (error) {
        console.error("Error fetching MCQs:", error);
      }
    };
    fetchMcqs();
  }, [mcqIds]);

  // Handle answer selection
  const handleAnswerChange = (mcqId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [mcqId]: answer,
    }));
  };

  // Submit answers
  const handleSubmit = () => {
    const results = {};
    mcqList.forEach((mcq) => {
      results[mcq.mcq_id] = answers[mcq.mcq_id] === mcq.mcq_answer;
    });
    setCorrectAnswers(results);
    setSubmitted(true);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        📝 MCQ Test
      </Typography>

      {mcqList.map((mcq, index) => (
        <Paper key={mcq.mcq_id} elevation={5} style={{ padding: "20px", marginBottom: "20px" }}>
          <Typography variant="h6">{index + 1}. {mcq.mcq_question}</Typography>

          <RadioGroup
            value={answers[mcq.mcq_id] || ""}
            onChange={(e) => handleAnswerChange(mcq.mcq_id, e.target.value)}
          >
            {mcq.mcq_options.map((option, i) => (
              <FormControlLabel key={i} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>

          {submitted && (
            <Alert severity={correctAnswers[mcq.mcq_id] ? "success" : "error"} sx={{ mt: 2 }}>
              {correctAnswers[mcq.mcq_id] ? "✅ Correct Answer!" : "❌ Incorrect Answer!"}
            </Alert>
          )}
        </Paper>
      ))}

      <Box textAlign="center" mt={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitted}>
          Submit Answers
        </Button>
      </Box>
    </Container>
  );
};

export default McqTestPage;
