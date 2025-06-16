import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Admin_Dashboard from "../components/AdminDash";
import { addPOC } from "../axios";

const Add_POC = () => {
  const [pocName, setPocName] = useState("");
  const [pocRole, setPocRole] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocMobile, setPocMobile] = useState("");
  const [certId, setCertId] = useState("");
  const [certStatus, setCertStatus] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Please fill all fields correctly.");

  const handleSubmit = async () => {
    if (!pocName || !pocRole || !pocEmail || !pocMobile) {
      setErrorMessage("Please fill all required fields.");
      setOpenError(true);
      return;
    }

    const payload = {
      mod_poc_name: pocName,
      mod_poc_role: pocRole,
      mod_poc_email: pocEmail,
      mod_poc_mobile: pocMobile,
      mod_images: [],
      mod_tests: [],
      mod_users: [],
      attendance: [],
      poc_certificate: certId ? {
        cert_id: certId,
        cert_status: certStatus
      } : null,
      certificates: {},
    };

    try {
      const data = await addPOC(payload);
      console.log("POC added:", data);
      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error("Error adding POC:", err.message || err);
      setErrorMessage(err.message || "Failed to add POC. Please try again.");
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setPocName("");
    setPocRole("");
    setPocEmail("");
    setPocMobile("");
    setCertId("");
    setCertStatus(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Container maxWidth="sm" sx={{ py: 4, minHeight: "90vh" }}>
        <Paper elevation={6} sx={{ borderRadius: 4 }}>
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(90deg, #3f51b5, #5c6bc0)",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Add POC
            </Typography>
            <Typography variant="subtitle2">
              Enter Point of Contact information
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="POC Name"
              variant="outlined"
              value={pocName}
              onChange={(e) => setPocName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="POC Role"
              variant="outlined"
              value={pocRole}
              onChange={(e) => setPocRole(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="POC Email"
              variant="outlined"
              type="email"
              value={pocEmail}
              onChange={(e) => setPocEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="POC Mobile"
              variant="outlined"
              value={pocMobile}
              onChange={(e) => setPocMobile(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Certificate ID"
              variant="outlined"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="e.g., CET/DEMO/"
              helperText="Leave empty if no certificate"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={certStatus}
                  onChange={(e) => setCertStatus(e.target.checked)}
                  color="primary"
                />
              }
              label="Certificate Status (Active/Inactive)"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Snackbar Alerts */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={() => setOpenSuccess(false)}
        >
          <Alert severity="success">POC added successfully!</Alert>
        </Snackbar>
        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={() => setOpenError(false)}
        >
          <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_POC;