import React from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Add_Coding = () => {
  const [problemStatement, setProblemStatement] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleSubmit = async () => {
    if (!problemStatement.trim()) {
      setOpenError(true);
      return;
    }

    const payload = {
      code_problem_statement: problemStatement,
      code_test_cases_id: [], // Always an empty array
      code_tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      const response = await fetch('http://localhost:8000/coding/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to create code problem");

      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error(err);
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setProblemStatement("");
    setTags("");
  };

  const handleCloseSnackbar = () => {
    setOpenSuccess(false);
    setOpenError(false);
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <Paper elevation={6} sx={{ width: "100%", overflow: "hidden", borderRadius: "16px" }}>
        {/* Header */}
        <Box sx={{ background: "linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)", padding: "20px 24px", color: "white" }}>
          <Typography variant="h5" fontWeight="600">Add Code Problem</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5 }}>Add a new coding question for assessment</Typography>
        </Box>

        {/* Form Content */}
        <Box sx={{ padding: "24px" }}>
          {/* Problem Statement */}
          <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>Problem Statement</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Write a function to check if a number is prime."
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />

          {/* Tags */}
          <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>Tags</Typography>
          <TextField
            fullWidth
            placeholder="Enter tags separated by commas (e.g., maths, loops, prime)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2, pt: 3, borderTop: "1px solid #e0e6f7" }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleClear}
              sx={{
                borderRadius: "8px",
                px: 3,
                py: 1.5,
                color: "#5c6bc0",
                borderColor: "#c5cae9",
                "&:hover": { borderColor: "#3f51b5", bgcolor: "#f5f7ff" },
              }}
            >
              Clear Form
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{
                borderRadius: "8px",
                px: 4,
                py: 1.5,
                bgcolor: "#3f51b5",
                "&:hover": { bgcolor: "#303f9f" },
                boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
              }}
            >
              Submit Problem
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar open={openSuccess} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }} icon={<CheckCircleOutlineIcon />}>
          Code problem successfully submitted!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={openError} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }} icon={<ErrorOutlineIcon />}>
          Problem statement is required.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Add_Coding;
