import React from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";

// Import these icons or you can replace with any other icons you have
// If you don't have icons, you can remove them
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Admin_Dashboard from "../components/AdminDash";

const Add_Mcq = () => {
  const [question, setQuestion] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [options, setOptions] = React.useState(["", "", "", ""]);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    if (!question || options.some(opt => !opt) || !selectedValue) {
      setOpenError(true);
      return;
    }
  
    const payload = {
      mcq_question: question,
      mcq_options: options,
      mcq_answer: selectedValue,
      mcq_tag: tags.split(',').map(tag => tag.trim())
    };
  
    try {
      const response = await fetch('http://localhost:8086/mcq_gateway/mcq/add_mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit MCQ');
      }
  
      setOpenSuccess(true);
      handleClear(); // Clear form after successful submission
    } catch (error) {
      console.error('Error submitting MCQ:', error);
      setOpenError(true);
    }
  };
  

  const handleClear = () => {
    setQuestion("");
    setTags("");
    setOptions(["", "", "", ""]);
    setSelectedValue("");
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
        minHeight: "30vh !important",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "16px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)",
            padding: "20px 24px",
            color: "white",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h5" fontWeight="600">
            Create Multiple Choice Question
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Design a new question for your quiz or assessment
          </Typography>
        </Box>

        {/* Form Content */}
        <Box sx={{ padding: "24px" }}>
          {/* Question Field */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
              Question Text
            </Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="Enter your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Box>

          {/* Tags Field */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter tags separated by commas (e.g., math, algebra, equations)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Box>

          {/* Options */}
          <FormControl sx={{ width: "100%", mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 2 }}>
              Answer Options
            </Typography>
            <RadioGroup
              name="mcq-options"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              {options.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    p: 2,
                    bgcolor: "#f8f9fc",
                    borderRadius: "10px",
                    border: "1px solid #e0e6f7",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "#f0f2f9",
                    },
                  }}
                >
                  <FormControlLabel
                    value={option}
                    control={
                      <Radio
                        sx={{
                          color: "#3f51b5",
                          "&.Mui-checked": {
                            color: "#3f51b5",
                          },
                        }}
                      />
                    }
                    label=""
                  />
                  <TextField
                    fullWidth
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      flexGrow: 1,
                      mr: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#e0e6f7",
                      color: "#3f51b5",
                      fontWeight: "500",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </Box>
                </Box>
              ))}
            </RadioGroup>
          </FormControl>

          {/* Selected Answer Display */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              bgcolor: "#ebeffd",
              borderRadius: "10px",
              mb: 4,
            }}
          >
            <Typography variant="subtitle1" fontWeight="500" color="#3f51b5" sx={{ mr: 2 }}>
              Correct Answer:
            </Typography>
            <Box
              sx={{
                bgcolor: "white",
                border: "1px solid #c5cae9",
                borderRadius: "6px",
                p: "8px 16px",
                minWidth: "150px",
              }}
            >
              {selectedValue || "No answer selected"}
            </Box>
          </Box>

          {/* Action Buttons */}
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
                "&:hover": {
                  bgcolor: "#303f9f",
                },
                boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
              }}
            >
              Submit Question
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
          Question successfully submitted!
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
          Please fill all required fields and select the correct answer
        </Alert>
      </Snackbar>
    </Container>
   </>
  );
};

export default Add_Mcq;