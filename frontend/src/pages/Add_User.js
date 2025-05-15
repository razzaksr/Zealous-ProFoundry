import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Input,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Papa from "papaparse";
import { addUser, bulkAddUsers } from "../axios";

const Add_User = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    department: "",
    college: "",
    rollno: "",
    email: "",
    password: "",
    mobile_no: "",
    admin: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);

  // Generate CSV and trigger download
  const generateAndDownloadCsv = (data, filename = "Credential_details.csv") => {
    const headers = ["full_name,email,password,department,college,rollno"];
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          `"${row.full_name.replace(/"/g, '""')}"`,
          row.email,
          `"${(row.plain_password || "").replace(/"/g, '""')}"`,
          `"${row.department.replace(/"/g, '""')}"`,
          `"${row.college.replace(/"/g, '""')}"`,
          row.rollno,
        ].join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");

    // Create Blob for download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Trigger download with explicit filename
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  };

  // Handle download button click
  const handleDownloadCsv = () => {
    // Use csvData for pre-creation download, exclude mobile_no and admin
    const downloadData = csvData.map((row) => ({
      full_name: row.full_name,
      email: row.email,
      plain_password: "", // Password not available pre-creation
      department: row.department,
      college: row.college,
      rollno: row.rollno,
    }));
    generateAndDownloadCsv(downloadData, "Credential_details.csv");
  };

  // Form handling for single user
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.admin) {
      if (!formData.department.trim()) newErrors.department = "Department is required";
      if (!formData.college.trim()) newErrors.college = "College is required";
      if (!formData.rollno.trim()) newErrors.rollno = "Roll number is required";
      if (!formData.password && !formData.mobile_no.trim()) {
        newErrors.mobile_no = "Mobile number is required when password is empty";
      }
    }
    if (formData.admin && !formData.password) {
      newErrors.password = "Password is required for admin users";
    } else if (formData.password && formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await addUser(formData);
      console.log("User created:", response.data);
      setSnackbarMessage(
        `User created successfully! Password: ${response.data.plain_password}`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setFormData({
        full_name: "",
        department: "",
        college: "",
        rollno: "",
        email: "",
        password: "",
        mobile_no: "",
        admin: false,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setSnackbarMessage(
        error.response?.data?.msg || "Failed to create user: Server error"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // CSV handling
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(), // Normalize headers
      complete: (result) => {
        const expectedHeaders = [
          "full_name",
          "department",
          "college",
          "rollno",
          "email",
          "mobile_no",
          "admin",
        ];
        const headers = Object.keys(result.data[0] || {}).map((h) =>
          h.trim().toLowerCase()
        );
        const isValid = expectedHeaders.every((h) =>
          h === "admin" ? true : headers.includes(h)
        ); // admin is optional

        if (!isValid) {
          setSnackbarMessage(
            "Invalid CSV format. Expected headers: " +
              expectedHeaders.join(", ") +
              " (admin optional)"
          );
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setCsvLoading(false);
          return;
        }

        const formattedData = result.data.map((row, index) => ({
          id: index, // Unique ID for DataGrid (numeric)
          full_name: row.full_name || "",
          department: row.department || "",
          college: row.college || "",
          rollno: row.rollno || "",
          email: row.email || "",
          mobile_no: row.mobile_no || "",
          admin: row.admin === "true" || row.admin === true || false,
        }));

        setCsvData(formattedData);
        setSelectedRows([]); // Reset selection on new upload
        setSnackbarMessage("CSV loaded successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setCsvLoading(false);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setSnackbarMessage("Failed to parse CSV file");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setCsvLoading(false);
      },
    });
  };

  const handleBulkCreate = async (selectedOnly = false) => {
    if (csvData.length === 0) {
      setSnackbarMessage("No CSV data to process");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const usersToCreate = selectedOnly
        ? csvData.filter((row) => selectedRows.includes(row.id))
        : csvData;

      console.log("Selected rows:", selectedRows); // Debug
      console.log("Users to create:", usersToCreate); // Debug

      if (usersToCreate.length === 0) {
        setSnackbarMessage("No users selected");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const response = await bulkAddUsers(usersToCreate);
      const { successes, failures } = response.data;

      // Generate and download CSV for successful users
      if (successes.length > 0) {
        console.log("Generating CSV for successes:", successes); // Debug
        generateAndDownloadCsv(successes, "Credential_details.csv");
      }

      let message = `Bulk creation completed: ${successes.length} succeeded, ${failures.length} failed.`;
      if (successes.length > 0) {
        message +=
          "\nPasswords: " +
          successes
            .map((s) => `${s.email}: ${s.plain_password}`)
            .join("; ");
      }
      if (failures.length > 0) {
        message +=
          "\nFailures: " +
          failures.map((f) => `${f.email}: ${f.msg}`).join("; ");
      }

      setSnackbarMessage(message);
      setSnackbarSeverity(failures.length > 0 ? "warning" : "success");
      setSnackbarOpen(true);

      // Clear CSV data and selection on success
      if (successes.length > 0) {
        setCsvData([]);
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error in bulk user creation:", error);
      setSnackbarMessage(
        error.response?.data?.msg || "Failed to create users: Server error"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    { field: "full_name", headerName: "Full Name", width: 150 },
    { field: "department", headerName: "Department", width: 120 },
    { field: "college", headerName: "College", width: 200 },
    { field: "rollno", headerName: "Roll Number", width: 120 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "mobile_no", headerName: "Mobile Number", width: 150 },
    { field: "admin", headerName: "Admin", width: 100, type: "boolean" },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Single User Form */}
      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 600, mx: "auto", borderRadius: "16px", mb: 4 }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          Add User
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={!!errors.full_name}
            helperText={errors.full_name}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={!!errors.department}
            helperText={errors.department}
            margin="normal"
            disabled={formData.admin}
          />
          <TextField
            fullWidth
            label="College"
            name="college"
            value={formData.college}
            onChange={handleChange}
            error={!!errors.college}
            helperText={errors.college}
            margin="normal"
            disabled={formData.admin}
          />
          <TextField
            fullWidth
            label="Roll Number"
            name="rollno"
            value={formData.rollno}
            onChange={handleChange}
            error={!!errors.rollno}
            helperText={errors.rollno}
            margin="normal"
            disabled={formData.admin}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mobile Number"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange}
            error={!!errors.mobile_no}
            helperText={errors.mobile_no}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || "Optional for non-admin users"}
            margin="normal"
            required={formData.admin}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="admin"
                checked={formData.admin}
                onChange={handleChange}
              />
            }
            label="Admin User"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ px: 4, py: 1.5 }}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {loading ? "Adding User..." : "Add User"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* CSV Upload and Bulk Creation */}
      <Paper
        elevation={3}
        sx={{ p: 4, maxWidth: 1200, mx: "auto", borderRadius: "16px" }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          Bulk Add Non-Admin Users via CSV
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            disabled={csvLoading}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Upload a CSV with headers: full_name, department, college, rollno,
            email, mobile_no, admin (admin optional)
          </Typography>
        </Box>
        {csvData.length > 0 && (
          <>
            <Box sx={{ height: 400, width: "100%", mb: 4 }}>
              <DataGrid
                rows={csvData}
                columns={columns}
                pageSizeOptions={[10, 20, 50]}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => {
                  console.log("New selection:", newSelection); // Debug
                  setSelectedRows(newSelection);
                }}
                rowSelectionModel={selectedRows}
                loading={csvLoading}
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#1565c0",
                    color: "white",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBulkCreate(false)}
                disabled={loading || csvData.length === 0}
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {loading ? "Creating..." : "Create All"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleBulkCreate(true)}
                disabled={loading || selectedRows.length === 0}
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {loading
                  ? "Creating..."
                  : `Create Selected (${selectedRows.length})`}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownloadCsv}
                disabled={csvData.length === 0}
              >
                Download CSV
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%", whiteSpace: "pre-wrap" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Add_User;