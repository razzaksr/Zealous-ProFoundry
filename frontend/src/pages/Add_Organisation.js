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
import dayjs from "dayjs";
import Admin_Dashboard from "../components/Admin_dash";

const Add_Organisation = () => {
  const [orgName, setOrgName] = React.useState("");
  const [orgAddress, setOrgAddress] = React.useState("");
  const [orgEmail, setOrgEmail] = React.useState("");
  const [orgContact, setOrgContact] = React.useState("");
  const [orgDate, setOrgDate] = React.useState("");
  const [mod_id, setMod_id] = React.useState("");

  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleSubmit = async () => {
    if (!orgName || !orgAddress || !orgEmail || !orgContact || !orgDate) {
      setOpenError(true);
      return;
    }

    const formattedDate = dayjs(orgDate).format("YYYY-MM-DD");

    const payload = {
      org_name: orgName,
      org_address: orgAddress,
      org_email: orgEmail,
      org_contact: orgContact,
      org_associated_date: formattedDate,
      mod_id: "",
    };

    try {
      const response = await fetch("http://localhost:5000/organization/create_org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create organization");

      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error(err);
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setOrgName("");
    setOrgAddress("");
    setOrgEmail("");
    setOrgContact("");
    setOrgDate("");
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
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Paper elevation={6} sx={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
        <Box
          sx={{
            background: "linear-gradient(90deg, #3f51b5, #5c6bc0)",
            p: 3,
            color: "white",
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Create Organization
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1, opacity: 0.8 }}>
            Add new organization details
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <TextField
            label="Organization Name"
            fullWidth
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Organization Address"
            fullWidth
            value={orgAddress}
            onChange={(e) => setOrgAddress(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Organization Email"
            fullWidth
            value={orgEmail}
            onChange={(e) => setOrgEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Organization Contact Number"
            fullWidth
            value={orgContact}
            onChange={(e) => setOrgContact(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Associated Date"
            type="date"
            fullWidth
            value={orgDate}
            onChange={(e) => setOrgDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          onClose={handleCloseSnackbar}
          sx={{ width: "100%" }}
        >
          Organization successfully created!
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

export default Add_Organisation;
