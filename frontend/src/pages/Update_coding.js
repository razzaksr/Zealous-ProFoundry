import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Container,
  useMediaQuery,
  useTheme,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import Admin_Dashboard from "../components/AdminDash";

const Update_coding = () => {
  const [codeRows, setCodeRows] = useState([]);
  const [testcaseRows, setTestcaseRows] = useState([]);
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [selectedTestcaseIds, setSelectedTestcaseIds] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = () => {
    axios
      .get("http://localhost:8000/coding/get_allCodes")
      .then((response) => {
        const codesArray = response.data.codes || [];
        const formatted = codesArray.map((item) => ({
          id: item._id,
          code_id: item.code_id,
          problem: item.code_problem_statement,
          testCases: (item.code_test_cases_id || []).join(", "),
          tags: (item.code_tags || []).join(", "),
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString(),
        }));
        setCodeRows(formatted);
      })
      .catch((error) => console.error("Error fetching code data:", error));

    axios
      .get("http://localhost:8000/testcase/get_all_testCases")
      .then((res) => {
        const formatted = res.data.map((item) => ({
          id: item._id,
          testcase_id: item.testcase_id,
          input: item.testcase_input.join(", "),
          output: item.testcase_output.join(", "),
          tags: item.testcase_tags.join(", "),
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString(),
        }));
        setTestcaseRows(formatted);
      })
      .catch((err) => console.error("Failed to fetch test cases:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const codeColumns = [
    { field: "code_id", headerName: "Code ID", width: 200, flex: 1 },
    { field: "problem", headerName: "Problem Statement", width: 300, flex: 2 },
    { field: "testCases", headerName: "Test Cases ID", width: 250, flex: 1.5 },
    { field: "tags", headerName: "Tags", width: 200, flex: 1 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      flex: 1,
      hide: isMobile,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 180,
      flex: 1,
      hide: isMobile,
    },
  ];

  const testcaseColumns = [
    { field: "testcase_id", headerName: "Testcase ID", width: 250, flex: 1.5 },
    { field: "input", headerName: "Input", width: 200, flex: 1 },
    { field: "output", headerName: "Output", width: 200, flex: 1 },
    { field: "tags", headerName: "Tags", width: 300, flex: 1.5 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      flex: 1,
      hide: isMobile,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 180,
      flex: 1,
      hide: isMobile,
    },
  ];

  const handleCodeSelectionChange = (newSelection) => {
    const selectionArray = Array.isArray(newSelection)
      ? newSelection
      : [newSelection];

    if (selectionArray.length > 0) {
      setSelectedCodeId(selectionArray[0]);
      console.log("Code selected:", selectionArray[0]);
    } else {
      setSelectedCodeId(null);
    }
  };

  const handleTestcaseSelectionChange = (newSelection) => {
    const selectionArray = Array.isArray(newSelection) ? newSelection : [];

    setSelectedTestcaseIds(selectionArray);
    console.log("Testcases selected:", selectionArray);
  };

  const handleNext = () => {
    console.log("Selected Code ID:", selectedCodeId);
    console.log("Selected Test Case IDs:", selectedTestcaseIds);

    // Ensure both a code and at least one test case are selected
    if (selectedCodeId && selectedTestcaseIds.length > 0) {
      setShowCard(true);
    } else {
      setSnackbar({
        open: true,
        message: "Please select one code and at least one test case.",
        severity: "warning",
      });
    }
  };

  const handleCloseDialog = () => {
    setShowCard(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleConfirmAssociation = async () => {
    if (!selectedCodeId || selectedTestcaseIds.length === 0) {
      setSnackbar({
        open: true,
        message: "Missing required selections",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the selected code details
      const selectedCode = codeRows.find((row) => row.id === selectedCodeId);

      // Get the selected testcase IDs from the testcaseRows
      const testcaseIdsToAdd = selectedTestcaseIds
        .map((id) => {
          const testcase = testcaseRows.find((t) => t.id === id);
          return testcase?.testcase_id;
        })
        .filter(Boolean); // Filter out any undefined values

      // Create request payload
      const payload = {
        code_id: selectedCode?.code_id,
        code_test_cases_id: testcaseIdsToAdd,
        // You could also add tags if needed
        // code_tags: []
      };

      console.log("Sending update request with payload:", payload);

      // Send request to backend
      const response = await axios.put(
        "http://localhost:8000/coding/update_code",
        payload
      );

      console.log("Update response:", response.data);

      // Show success message
      setSnackbar({
        open: true,
        message: "Code association updated successfully!",
        severity: "success",
      });

      // Close the dialog
      setShowCard(false);

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error("Error updating code association:", error);
      setSnackbar({
        open: true,
        message: `Error: ${
          error.response?.data?.msg || error.message || "Unknown error occurred"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCode = codeRows.find((row) => row.id === selectedCodeId);
  const selectedTestcases = testcaseRows.filter((row) =>
    selectedTestcaseIds.includes(row.id)
  );

  const renderTagChips = (tags) => {
    if (!tags) return null;
    return tags
      .split(",")
      .map((tag, index) => (
        <Chip
          key={index}
          label={tag.trim()}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ m: 0.5 }}
        />
      ));
  };

  return (
    <>
      <Admin_Dashboard />
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, mb: 4 ,marginTop: 10}}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
          >
            <CodeIcon sx={{ mr: 1 }} /> Code Records
          </Typography>
          <Box sx={{ height: 400, width: "100%", mb: 3 }}>
            <DataGrid
              rows={codeRows}
              columns={codeColumns}
              checkboxSelection
              onCellClick={(params) => {
                setSelectedCodeId(params.row.id);
                console.log("Directly selected code ID:", params.row.id);
              }}
              isRowSelectable={(params) => true}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
                "& .MuiDataGrid-row.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
            />
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
          >
            <BugReportIcon sx={{ mr: 1 }} /> Test Case Records
          </Typography>
          <Box sx={{ height: 400, width: "100%", mb: 3 }}>
            <DataGrid
              rows={testcaseRows}
              columns={testcaseColumns}
              checkboxSelection
              onCellClick={(params) => {
                // Add to selection if not already selected, otherwise remove
                if (!selectedTestcaseIds.includes(params.row.id)) {
                  setSelectedTestcaseIds([
                    ...selectedTestcaseIds,
                    params.row.id,
                  ]);
                  console.log("Added testcase to selection:", params.row.id);
                } else {
                  setSelectedTestcaseIds(
                    selectedTestcaseIds.filter((id) => id !== params.row.id)
                  );
                  console.log(
                    "Removed testcase from selection:",
                    params.row.id
                  );
                }
              }}
              isRowSelectable={(params) => true}
              pageSize={10}
              rowsPerPageOptions={[10, 20]}
              sx={{
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
                "& .MuiDataGrid-row.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
            />
          </Box>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!selectedCodeId || selectedTestcaseIds.length === 0}
            size="large"
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Continue with Selection
          </Button>
        </Box>

        <Dialog
          open={showCard}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          PaperProps={{
            elevation: 5,
            sx: { borderRadius: 2 },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
               fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Selected Items
            <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                pl: 2,
                py: 1,
              }}
            >
              Selected Code Details
            </Typography>
            {selectedCode ? (
              <Box
                mb={3}
                component={Paper}
                elevation={2}
                sx={{ p: 3, borderRadius: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Code ID:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedCode.code_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="subtitle2">Problem:</Typography>
                    <Typography variant="body1">
                      {selectedCode.problem}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Tags:</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}>
                      {renderTagChips(selectedCode.tags)}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Typography>No code selected</Typography>
            )}

            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                pl: 2,
                py: 1,
                mt: 2,
              }}
            >
              Selected Test Cases ({selectedTestcases.length})
            </Typography>
            {selectedTestcases.length > 0 ? (
              <Grid container spacing={2}>
                {selectedTestcases.map((tc) => (
                  <Grid item xs={12} md={6} key={tc.id}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, borderRadius: 2, height: "100%" }}
                    >
                      <Typography variant="subtitle2">
                        ID: {tc.testcase_id}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2">Input:</Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          backgroundColor: "#f5f5f5",
                          p: 1,
                          borderRadius: 1,
                          overflowX: "auto",
                          fontFamily: "monospace",
                        }}
                      >
                        {tc.input}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Output:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          backgroundColor: "#f5f5f5",
                          p: 1,
                          borderRadius: 1,
                          overflowX: "auto",
                          fontFamily: "monospace",
                        }}
                      >
                        {tc.output}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Tags:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}>
                        {renderTagChips(tc.tags)}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No test cases selected</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              sx={{ px: 4 }}
              onClick={handleConfirmAssociation}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Association"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for showing notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Update_coding;
