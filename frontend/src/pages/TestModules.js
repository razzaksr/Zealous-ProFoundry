import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Clock, Award } from "lucide-react";

const API_BASE_URL = "http://localhost:4000";

const TestComponent = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mcqData, setMcqData] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();

  // Fetch module & test IDs by user ID
  const fetchModuleAndTests = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/poc_gateway/poc/mod_and_poc/${userId}`);
      if (response.data && response.data.test_ids) {
        const testIds = response.data.test_ids;

        // Fetch details for each test ID
        const testDetails = await Promise.all(
          testIds.map(async (testId) => {
            const testRes = await axios.get(`${API_BASE_URL}/test_gateway/test/get_by_test_id/${testId}`);
            return testRes.data;
          })
        );

        setTests(testDetails);
      } else {
        setTests([]);
        setError("No tests available for this user.");
      }
    } catch (err) {
      console.error("Error fetching module & test data:", err);
      setError("Failed to load tests. Please try again later.");
    }
    setLoading(false);
  }, []);

  // Fetch user from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.user_id) {
          fetchModuleAndTests(user.user.user_id);
        } else {
          console.warn("User ID not found in session storage");
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
      }
    } else {
      console.warn("No user found in session storage");
    }
  }, [fetchModuleAndTests]);

  // Fetch MCQ question
  const fetchMcqQuestion = async (mcqId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/mcq_gateway/mcq/get_mcq/${mcqId}`);
      setMcqData(response.data);
      setSelectedOption(""); // Reset selected option
    } catch (error) {
      console.error("Error fetching MCQ:", error);
      setError("Failed to load MCQ. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" color="#1e1e1e" textAlign="start" gutterBottom>
        Test Modules
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={50} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3, textAlign: "center" }}>
          {error}
        </Alert>
      ) : mcqData ? (
        // Display MCQ question
        <Card sx={{ p: 3, bgcolor: "#F5F5F5", borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {mcqData.mcq_question}
            </Typography>

            <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
              {mcqData.mcq_options.map((option, index) => (
                <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!selectedOption}
              onClick={() => alert(selectedOption === mcqData.mcq_answer ? "✅ Correct!" : "❌ Incorrect")}
            >
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={5} justifyContent="center">
          {tests.map((test) => (
            <Grid item xs={12} key={test.test_id}>
              <Card
                sx={{
                  p: 2,
                  bgcolor: "#F5F5F5",
                  borderRadius: 2,
                  boxShadow: 3,
                  height: "100%",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {test.test_name}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Clock size={16} color="gray" />
                    <Typography variant="body2">{test.duration || "60 mins"}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Award size={16} color="gold" />
                    <Typography variant="body2">{test.difficulty || "Medium"}</Typography>
                  </Box>
                </CardContent>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    bgcolor: test.test_mcq_id?.length > 0 ? "primary.main" : "gray",
                    color: "white",
                    "&:hover": { bgcolor: test.test_mcq_id?.length > 0 ? "primary.dark" : "gray" },
                  }}
                  onClick={() => {
                    if (test.test_mcq_id?.length > 0) {
                      fetchMcqQuestion(test.test_mcq_id[0]);
                    } else {
                      alert("⚠️ Test is not available at the moment!");
                    }
                  }}
                  disabled={!test.test_mcq_id?.length}
                >
                  Start Test
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TestComponent;
