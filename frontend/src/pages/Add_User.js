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
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { UploadFile } from "@mui/icons-material";
import { Button as BootstrapButton, Row, Col } from "react-bootstrap";
import Papa from "papaparse";
import { addUser, bulkAddUsers } from "../axios";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle download button click
  const handleDownloadCsv = () => {
    const downloadData = csvData.map((row) => ({
      full_name: row.full_name,
      email: row.email,
      plain_password: "",
      department: row.department,
      college: row.college,
      rollno: row.rollno,
    }));
    generateAndDownloadCsv(downloadData, "Credential_details.csv");
    setSnackbar({
      open: true,
      message: "CSV downloaded successfully!",
      severity: "success",
    });
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

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    switch (name) {
      case "full_name":
        return value.trim() ? "" : "Full name is required";
      case "email":
        if (!value.trim()) return "Email is required";
        return emailRegex.test(value) ? "" : "Invalid email format";
      case "mobile_no":
        return value && !mobileRegex.test(value) ? "Mobile number must be 10 digits" : "";
      case "department":
        return formData.admin || value.trim() ? "" : "Department is required";
      case "college":
        return formData.admin || value.trim() ? "" : "College is required";
      case "rollno":
        return formData.admin || value.trim() ? "" : "Roll number is required";
      case "password":
        if (formData.admin && !value) return "Password is required for admin users";
        if (value && value.length < 4) return "Password must be at least 4 characters";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "admin") {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    if (!formData.admin && !formData.password && !formData.mobile_no.trim()) {
      newErrors.mobile_no = "Mobile number is required when password is empty";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: Object.values(errors).find((err) => err) || "Please fix the errors",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await addUser(formData);
      setSnackbar({
        open: true,
        message: `User created successfully! Password: ${response.data.plain_password}`,
        severity: "success",
      });
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
      setErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Failed to create user: Server error";
      setSnackbar({
        open: true,
        message: errorMsg.includes("already exists") ? "User already exists" : errorMsg,
        severity: "error",
      });
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
      transformHeader: (header) => header.trim().toLowerCase(),
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
        const headers = Object.keys(result.data[0] || {}).map((h) => h.trim().toLowerCase());
        const isValid = expectedHeaders.every((h) =>
          h === "admin" ? true : headers.includes(h)
        );

        if (!isValid) {
          setSnackbar({
            open: true,
            message: `Invalid CSV format. Expected headers: ${expectedHeaders.join(", ")} (admin optional)`,
            severity: "error",
          });
          setCsvLoading(false);
          return;
        }

        const formattedData = result.data.map((row, index) => ({
          id: index,
          full_name: row.full_name || "",
          department: row.department || "",
          college: row.college || "",
          rollno: row.rollno || "",
          email: row.email || "",
          mobile_no: row.mobile_no || "",
          admin: row.admin === "true" || row.admin === true || false,
        }));

        setCsvData(formattedData);
        setSelectedRows([]);
        setSnackbar({
          open: true,
          message: "CSV loaded successfully!",
          severity: "success",
        });
        setCsvLoading(false);
      },
      error: (error) => {
        setSnackbar({
          open: true,
          message: "Failed to parse CSV file",
          severity: "error",
        });
        setCsvLoading(false);
      },
    });
  };

  const handleBulkCreate = async (selectedOnly = false) => {
    if (csvData.length === 0) {
      setSnackbar({
        open: true,
        message: "No CSV data to process",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const usersToCreate = selectedOnly
        ? csvData.filter((row) => selectedRows.includes(row.id))
        : csvData;

      if (usersToCreate.length === 0) {
        setSnackbar({
          open: true,
          message: "No users selected",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const response = await bulkAddUsers(usersToCreate);
      const { successes, failures } = response.data;

      if (successes.length > 0) {
        generateAndDownloadCsv(successes, "Credential_details.csv");
      }

      let message = `Bulk creation completed: ${successes.length} succeeded, ${failures.length} failed.`;
      if (successes.length > 0) {
        message += `\nPasswords: ${successes.map((s) => `${s.email}: ${s.plain_password}`).join("; ")}`;
      }
      if (failures.length > 0) {
        message += `\nFailures: ${failures.map((f) => `${f.email}: ${f.msg}`).join("; ")}`;
      }

      setSnackbar({
        open: true,
        message,
        severity: failures.length > 0 ? "warning" : "success",
      });

      if (successes.length > 0) {
        setCsvData([]);
        setSelectedRows([]);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.msg || "Failed to create users: Server error",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    { field: "full_name", headerName: "Full Name", width: isMobile ? 100 : 150 },
    { field: "department", headerName: "Department", width: isMobile ? 80 : 120 },
    { field: "college", headerName: "College", width: isMobile ? 120 : 200 },
    { field: "rollno", headerName: "Roll Number", width: isMobile ? 80 : 120 },
    { field: "email", headerName: "Email", width: isMobile ? 120 : 200 },
    { field: "mobile_no", headerName: "Mobile Number", width: isMobile ? 100 : 150 },
    { field: "admin", headerName: "Admin", width: isMobile ? 70 : 100, type: "boolean" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, rgba(12, 131, 200, 0.05) 0%, rgba(252, 122, 70, 0.05) 100%)`,
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="d-flex justify-content-center"
    >
      {/* Single User Form */}
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 2 : 4,
          maxWidth: isMobile ? "100%" : 600,
          mx: "auto",
          borderRadius: "12px",
          mb: isMobile ? 2 : 4,
          background: "rgba(255, 255, 255, 0.95)",
        }}
        className="shadow-sm"
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          align="center"
          sx={{ mb: isMobile ? 2 : 3, fontWeight: "bold", color: theme.palette.primary.main }}
          className="mb-3"
        >
          Add User
        </Typography>
        <form onSubmit={handleSubmit}>
          <Row>
            <Col xs={12} sm={6} className="mb-2">
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.full_name}
                helperText={errors.full_name || "Enter full name"}
                required
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} sm={6} className="mb-2">
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email || "Enter email address"}
                required
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} sm={6} className="mb-2">
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.department}
                helperText={errors.department || (formData.admin ? "Disabled for admins" : "Enter department")}
                disabled={formData.admin}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} sm={6} className="mb-2">
              <TextField
                fullWidth
                label="College"
                name="college"
                value={formData.college}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.college}
                helperText={errors.college || (formData.admin ? "Disabled for admins" : "Enter college")}
                disabled={formData.admin}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} sm={6} className="mb-2">
              <TextField
                fullWidth
                label="Roll Number"
                name="rollno"
                value={formData.rollno}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.rollno}
                helperText={errors.rollno || (formData.admin ? "Disabled for admins" : "Enter roll number")}
                disabled={formData.admin}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} sm={6} className="mb-2">
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.mobile_no}
                helperText={errors.mobile_no || "Enter 10-digit mobile number"}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} className="mb-2">
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password || (formData.admin ? "Required for admins" : "Optional for non-admins")}
                required={formData.admin}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                className="form-control"
              />
            </Col>
            <Col xs={12} className="mb-3">
              <FormControlLabel
                control={
                  <Checkbox
                    name="admin"
                    checked={formData.admin}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Admin User"
                className="ms-2"
              />
            </Col>
            <Col xs={12} className="d-flex justify-content-center">
              <BootstrapButton
                variant="primary"
                type="submit"
                disabled={loading}
                className={`btn ${isMobile ? "btn-sm" : ""} shadow-sm`}
                style={{
                  padding: isMobile ? "6px 16px" : "8px 24px",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  borderRadius: "8px",
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} color="inherit" className="me-2" />
                    Adding...
                  </>
                ) : (
                  "Add User"
                )}
              </BootstrapButton>
            </Col>
          </Row>
        </form>
      </Paper>

      {/* CSV Upload and Bulk Creation */}
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 2 : 4,
          maxWidth: isMobile ? "100%" : 900,
          mx: "auto",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.95)",
        }}
        className="shadow-sm"
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          align="center"
          sx={{ mb: isMobile ? 2 : 3, fontWeight: "bold", color: theme.palette.primary.main }}
          className="mb-3"
        >
          Bulk Add Non-Admin Users via CSV
        </Typography>
        <Row className="mb-3">
          <Col xs={12}>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              disabled={csvLoading}
              style={{ display: "none" }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outlined"
                component="span"
                color="primary"
                disabled={csvLoading}
                startIcon={<UploadFile />}
                className={`btn btn-outline-primary ${isMobile ? "btn-sm" : ""} shadow-sm`}
                sx={{
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 0.5 : 0.75,
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                {csvLoading ? "Uploading..." : "Upload CSV"}
              </Button>
            </label>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontSize: isMobile ? "0.75rem" : "0.875rem" }}
              className="mt-2"
            >
              Upload a CSV with headers: full_name, department, college, rollno, email, mobile_no, admin (admin optional)
            </Typography>
          </Col>
        </Row>
        {csvData.length > 0 && (
          <>
            <Box
              sx={{
                height: isMobile ? 250 : 350,
                width: "100%",
                mb: isMobile ? 2 : 3,
                overflowX: "auto",
              }}
              className="table-responsive"
            >
              <DataGrid
                rows={csvData}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                rowSelectionModel={selectedRows}
                loading={csvLoading}
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: isMobile ? "0.7rem" : "0.8rem",
                  },
                  borderRadius: "8px",
                }}
              />
            </Box>
            <Row className="justify-content-center g-2">
              <Col xs="auto">
                <BootstrapButton
                  variant="primary"
                  onClick={() => handleBulkCreate(false)}
                  disabled={loading || csvData.length === 0}
                  className={`btn ${isMobile ? "btn-sm" : ""} shadow-sm`}
                  style={{
                    padding: isMobile ? "6px 16px" : "8px 24px",
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    borderRadius: "8px",
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={16} color="inherit" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    "Create All"
                  )}
                </BootstrapButton>
              </Col>
              <Col xs="auto">
                <BootstrapButton
                  variant="secondary"
                  onClick={() => handleBulkCreate(true)}
                  disabled={loading || selectedRows.length === 0}
                  className={`btn ${isMobile ? "btn-sm" : ""} shadow-sm`}
                  style={{
                    padding: isMobile ? "6px 16px" : "8px 24px",
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    borderRadius: "8px",
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={16} color="inherit" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    `Create Selected (${selectedRows.length})`
                  )}
                </BootstrapButton>
              </Col>
              <Col xs="auto">
                <BootstrapButton
                  variant="outline-primary"
                  onClick={handleDownloadCsv}
                  disabled={csvData.length === 0}
                  className={`btn ${isMobile ? "btn-sm" : ""} shadow-sm`}
                  style={{
                    padding: isMobile ? "6px 16px" : "8px 24px",
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    borderRadius: "8px",
                  }}
                >
                  Download CSV
                </BootstrapButton>
              </Col>
            </Row>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", whiteSpace: "pre-wrap", fontSize: isMobile ? "0.75rem" : "0.875rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Add_User;