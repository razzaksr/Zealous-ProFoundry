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
import dayjs from "dayjs";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Admin_Dashboard from "../components/AdminDash";
import { addModule } from "../axios"; 

const Add_Module = () => {
  const [modName, setModName] = React.useState("");
  const [modTech, setModTech] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleSubmit = async () => {
    if (!modName || !modTech || !startDate || !endDate) {
      setOpenError(true);
      return;
    }

    const formattedStartDate = dayjs(startDate).format("DD/MM/YYYY");
    const formattedEndDate = dayjs(endDate).format("DD/MM/YYYY");
    const mod_duration = `${formattedStartDate} - ${formattedEndDate}`;

    const payload = {
      mod_name: modName,
      mod_tech: modTech,
      mod_duration,
    };

    try {
      await addModule(payload); 
      setOpenSuccess(true);
      handleClear();
    } catch (error) {
      console.error("Error adding module:", error);
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setModName("");
    setModTech("");
    setStartDate("");
    setEndDate("");
  };

  const handleCloseSnackbar = () => {
    setOpenSuccess(false);
    setOpenError(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Paper elevation={6} sx={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
          <Box sx={{ background: "linear-gradient(90deg, #3f51b5, #5c6bc0)", p: 3, color: "white" }}>
            <Typography variant="h5" fontWeight={600}>
              Create Test Module
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1, opacity: 0.8 }}>
              Add new module with duration and technology
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <TextField
              label="Module Name"
              fullWidth
              value={modName}
              onChange={(e) => setModName(e.target.value)}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <TextField
              label="Module Technologies"
              fullWidth
              value={modTech}
              onChange={(e) => setModTech(e.target.value)}
              placeholder="e.g., MERN, React, Node.js"
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label="From Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: "50%", "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                label="To Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputProps={{ inputProps: { min: startDate } }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: "50%", "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                sx={{
                  borderRadius: "8px",
                  px: 3,
                  color: "#5c6bc0",
                  borderColor: "#c5cae9",
                  "&:hover": { borderColor: "#3f51b5", bgcolor: "#f5f7ff" },
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  borderRadius: "8px",
                  px: 4,
                  bgcolor: "#3f51b5",
                  "&:hover": { bgcolor: "#303f9f" },
                  boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Snackbars */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            onClose={handleCloseSnackbar}
            sx={{ width: "100%" }}
          >
            Module successfully created!
          </Alert>
        </Snackbar>

        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            onClose={handleCloseSnackbar}
            sx={{ width: "100%" }}
          >
            Please fill all required fields!
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_Module;
