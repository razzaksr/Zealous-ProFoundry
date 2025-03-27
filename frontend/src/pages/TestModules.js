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
} from "@mui/material";
import { Clock, Award } from "lucide-react";

const API_BASE_URL = "http://localhost:4000";

const TestModule = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch tests assigned to user
  const fetchTests = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/poc_gateway/poc/mod_and_poc/${userId}`);
      if (response.data?.test_ids?.length) {
        const testDetails = await Promise.all(
          response.data.test_ids.map(async (testId) => {
            const testRes = await axios.get(`${API_BASE_URL}/test_gateway/test/get_by_test_id/${testId}`);
            return testRes.data;
          })
        );
        setTests(testDetails);
      } else {
        setTests([]);
        setError("No tests available.");
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load tests.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.user_id) {
          fetchTests(user.user.user_id);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, [fetchTests]);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Test Modules
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {tests.map((test) => (
            <Grid item xs={12} md={6} key={test.test_id}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
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
                  sx={{ mt: 2 }}
                  onClick={() =>
                    navigate(`/mcq-test/${test.test_id}`, { state: { testMcqIds: test.test_mcq_id } })
                  }
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

export default TestModule;
