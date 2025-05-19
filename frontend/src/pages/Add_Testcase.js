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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Admin_Dashboard from "../components/AdminDash";
import { createTestCase } from "../axios"; // Import from API file

const Add_Testcase = () => {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async () => {
    if (!input || !output) {
      setErrorMessage("Please fill both input and output fields.");
      setOpenError(true);
      return;
    }

    const payload = {
      testcase_input: [input],
      testcase_output: [output],
      testcase_tags: tags.split(",").map((tag) => tag.trim()),
    };

    try {
      await createTestCase(payload);
      setOpenSuccess(true);
      handleClear();
    } catch (error) {
      setErrorMessage(error.message);
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setTags("");
  };

  const handleCloseSnackbar = () => {
    setOpenSuccess(false);
    setOpenError(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Container
        maxWidth="md"
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Paper
          elevation={6}
          sx={{ width: "100%", overflow: "hidden", borderRadius: "16px" }}
        >
          <Box
            sx={{
              background: "linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)",
              padding: "20px 24px",
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight="600">
              Create Test Case
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ opacity: 0.8, mt: 0.5 }}
            >
              Design a new Test Case for your quiz or assessment
            </Typography>
          </Box>

          <Box sx={{ padding: "24px" }}>
            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
              Testcase Input
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
              Testcase Output
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter Output"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter tags separated by commas (e.g., edge, iot, ai)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
                pt: 3,
                borderTop: "1px solid #e0e6f7",
              }}
            >
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
                  "&:hover": {
                    borderColor: "#3f51b5",
                    bgcolor: "#f5f7ff",
                  },
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
                Submit Test Case
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Success Snackbar */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
            icon={<CheckCircleOutlineIcon />}
          >
            Test case successfully submitted!
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%" }}
            icon={<ErrorOutlineIcon />}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_Testcase;
