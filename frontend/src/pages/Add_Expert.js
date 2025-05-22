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
} from "@mui/material";
import Admin_Dashboard from "../components/AdminDash";
import { addExpert } from "../axios";

const Add_Expert = () => {
  const [expertName, setExpertName] = useState("");
  const [expertMobile, setExpertMobile] = useState("");
  const [expertRole, setExpertRole] = useState("");
  const [expertProfile, setExpertProfile] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!expertName || !expertMobile || !expertRole || !expertProfile) {
      setErrorMessage("Please fill in all required fields.");
      setOpenError(true);
      return;
    }

    const payload = {
      mod_expert_name: expertName,
      mod_expert_mobile: expertMobile,
      mod_expert_role: expertRole,
      mod_expert_profile: expertProfile,
    };

    try {
      const data = await addExpert(payload);
      console.log("Expert added:", data);
      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error("Error adding expert:", err);
      setErrorMessage(err.error || "Failed to add expert.");
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setExpertName("");
    setExpertMobile("");
    setExpertRole("");
    setExpertProfile("");
  };

  return (
    <>
      <Admin_Dashboard />
      <Container maxWidth="sm" sx={{ py: 4, minHeight: "90vh" }}>
        <Paper elevation={6} sx={{ borderRadius: 4 }}>
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(90deg, #009688, #26a69a)",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Add Expert
            </Typography>
            <Typography variant="subtitle2">
              Enter Expert Information
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Expert Name"
              value={expertName}
              onChange={(e) => setExpertName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Expert Mobile"
              value={expertMobile}
              onChange={(e) => setExpertMobile(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Expert Role"
              value={expertRole}
              onChange={(e) => setExpertRole(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Expert Profile"
              value={expertProfile}
              onChange={(e) => setExpertProfile(e.target.value)}
              sx={{ mb: 2 }}
              required
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

        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={() => setOpenSuccess(false)}
        >
          <Alert severity="success">Expert added successfully!</Alert>
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

export default Add_Expert;
