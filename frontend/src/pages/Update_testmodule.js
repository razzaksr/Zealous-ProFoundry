import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchAllTests, fetchAllCodes, fetchAllMcqs, updateTest } from "../axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CloseIcon from "@mui/icons-material/Close";
import Admin_Dashboard from "../components/Admin_dash";

const UpdateTestModule = () => {
  const [tests, setTests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState({
    tests: true,
    codes: true,
    mcqs: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedCodeIds, setSelectedCodeIds] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedTestForUpdate, setSelectedTestForUpdate] = useState(null);

  // Debug state changes
  useEffect(() => {
    console.log("Selected Test IDs:", selectedTestIds);
    console.log("Selected Code IDs:", selectedCodeIds);
    console.log("Selected MCQ IDs:", selectedMcqIds);
    console.log(
      "Any selected:",
      selectedTestIds.length > 0 ||
        selectedCodeIds.length > 0 ||
        selectedMcqIds.length > 0
    );
  }, [selectedTestIds, selectedCodeIds, selectedMcqIds]);

  // Fetch data for all sections
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetchAllTests();
        console.log("Tests Response:", response);
        const testData = response.data?.tests || response.data || [];
        if (!Array.isArray(testData)) {
          console.error("Tests data is not an array:", testData);
          setTests([]);
        } else {
          setTests(testData);
        }
        setLoading((prev) => ({ ...prev, tests: false }));
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]);
        setLoading((prev) => ({ ...prev, tests: false }));
        setSnackbarMessage("Failed to fetch tests: " + error.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    const fetchCodes = async () => {
      try {
        const response = await fetchAllCodes();
        console.log("Codes Full Response:", response);
        const codesArray = response.data?.codes || response.codes || [];
        if (!Array.isArray(codesArray)) {
          console.error("Codes data is not an array:", codesArray);
          setCodes([]);
        } else {
          const formattedRows = codesArray.map((item) => ({
            id: item._id,
            code_id: item.code_id,
            problem: item.code_problem_statement,
            testCases: (item.code_test_cases_id || []).join(", "),
            tags: (item.code_tags || []).join(", "),
            createdAt: new Date(item.createdAt).toLocaleString(),
            updatedAt: new Date(item.updatedAt).toLocaleString(),
          }));
          setCodes(formattedRows);
        }
        setLoading((prev) => ({ ...prev, codes: false }));
      } catch (error) {
        console.error("Error fetching codes:", error);
        setCodes([]);
        setLoading((prev) => ({ ...prev, codes: false }));
        setSnackbarMessage("Failed to fetch codes: " + error.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    const fetchMcqs = async () => {
      try {
        const response = await fetchAllMcqs();
        console.log("MCQs Response:", response);
        const mcqData = response.data?.mcqs || response.data || [];
        if (!Array.isArray(mcqData)) {
          console.error("MCQs data is not an array:", mcqData);
          setMcqs([]);
        } else {
          setMcqs(mcqData);
        }
        setLoading((prev) => ({ ...prev, mcqs: false }));
      } catch (error) {
        console.error("Error fetching MCQs:", error);
        setMcqs([]);
        setLoading((prev) => ({ ...prev, mcqs: false }));
        setSnackbarMessage("Failed to fetch MCQs: " + error.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchTests();
    fetchCodes();
    fetchMcqs();
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMessage("Copied to clipboard!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setSnackbarMessage("Failed to copy to clipboard");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleViewDetails = (title, items) => {
    setDialogTitle(title);
    setDialogContent(items);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedTestForUpdate(null);
  };

  const handleUpdateTest = async (test) => {
    if (!test || !test.test_id) {
      setSnackbarMessage("No test selected for update");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSelectedTestForUpdate(test);
    setUpdating(true);

    try {
      // Append selected MCQs to the test
      const selectedMcqIdsToUpdate = mcqs
        .filter((mcq) => selectedMcqIds.includes(mcq._id))
        .map((mcq) => mcq.mcq_id);

      const selectedCodingIdsToUpdate = codes
        .filter((code) => selectedCodeIds.includes(code.id))
        .map((code) => code.code_id);

      // Perform the update with arrays of IDs
      const response = await updateTest({
        test_id: test.test_id,
        mcq_id: selectedMcqIdsToUpdate,
        coding_test_id: selectedCodingIdsToUpdate,
      });

      console.log("Update response:", response.data);
      setSnackbarMessage("Test updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Refresh tests data
      const refreshResponse = await fetchAllTests();
      const testData = refreshResponse.data?.tests || refreshResponse.data || [];
      if (Array.isArray(testData)) {
        setTests(testData);
      } else {
        setTests([]);
      }

      // Close dialog after successful update
      setDetailsDialogOpen(false);
      setSelectedTestForUpdate(null);
    } catch (error) {
      console.error("Error updating test:", error);
      setSnackbarMessage(
        `Update failed: ${error.response?.data?.msg || error.message}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleNextClick = () => {
    console.log("Next button clicked! Opening details dialog.");
    console.log("Selected Test IDs:", selectedTestIds);
    console.log("Selected Code IDs:", selectedCodeIds);
    console.log("Selected MCQ IDs:", selectedMcqIds);

    if (selectedTestIds.length > 0) {
      const firstSelectedTest = tests.find((test) =>
        selectedTestIds.includes(test._id)
      );
      setSelectedTestForUpdate(firstSelectedTest || null);
    } else {
      setSelectedTestForUpdate(null);
    }
    setDetailsDialogOpen(true);
  };

  // Selected Data Displays
  const selectedTestsDisplay = tests.filter((test) =>
    selectedTestIds.includes(test._id)
  );
  const selectedCodesDisplay = codes.filter((code) =>
    selectedCodeIds.includes(code.id)
  );
  const selectedMcqsDisplay = mcqs.filter((mcq) =>
    selectedMcqIds.includes(mcq._id)
  );

  // Test Columns
  const testColumns = [
    { field: "test_name", headerName: "Test Name", width: 200, flex: 1 },
    { field: "test_language", headerName: "Language", width: 150 },
    { field: "test_total_score", headerName: "Total Score", width: 120 },
    {
      field: "test_mcq_id",
      headerName: "MCQ IDs",
      width: 200,
      flex: 1,
      renderCell: (params) => {
        if (
          !params.value ||
          !Array.isArray(params.value) ||
          params.value.length === 0
        ) {
          return (
            <Typography variant="body2" color="textSecondary">
              None
            </Typography>
          );
        }
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`${params.value.length} MCQs`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Tooltip title="View All MCQ IDs">
              <IconButton
                size="small"
                onClick={() =>
                  handleViewDetails(
                    `MCQ IDs for ${params.row.test_name}`,
                    params.value
                  )
                }
              >
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(params.value.join("\n"))}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "test_coding_id",
      headerName: "Coding IDs",
      width: 200,
      flex: 1,
      renderCell: (params) => {
        if (
          !params.value ||
          !Array.isArray(params.value) ||
          params.value.length === 0
        ) {
          return (
            <Typography variant="body2" color="textSecondary">
              None
            </Typography>
          );
        }
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`${params.value.length} Codes`}
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Tooltip title="View All Coding IDs">
              <IconButton
                size="small"
                onClick={() =>
                  handleViewDetails(
                    `Coding IDs for ${params.row.test_name}`,
                    params.value
                  )
                }
              >
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(params.value.join("\n"))}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || "Unknown"}
          color={params.value === "enabled" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "test_id",
      headerName: "Test ID",
      width: 300,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Tooltip title={params.value}>
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "calc(100% - 30px)",
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
          <Tooltip title="Copy ID">
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(params.value)}
              sx={{ ml: "auto" }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Code Columns
  const codeColumns = [
    { field: "code_id", headerName: "Code ID", width: 200 },
    { field: "problem", headerName: "Problem Statement", width: 300 },
    { field: "testCases", headerName: "Test Cases ID", width: 250 },
    { field: "tags", headerName: "Tags", width: 200 },
    { field: "createdAt", headerName: "Created At", width: 180 },
    { field: "updatedAt", headerName: "Updated At", width: 180 },
  ];

  // MCQ Columns
  const mcqColumns = [
    { field: "mcq_question", headerName: "Question", width: 300 },
    {
      field: "mcq_options",
      headerName: "Options",
      width: 250,
      valueGetter: (params) =>
        params.value && Array.isArray(params.value)
          ? params.value.join(", ")
          : "None",
    },
    { field: "mcq_answer", headerName: "Answer", width: 150 },
    {
      field: "mcq_tag",
      headerName: "Tags",
      width: 200,
      valueGetter: (params) =>
        params.value && Array.isArray(params.value)
          ? params.value.join(", ")
          : "None",
    },
    { field: "mcq_id", headerName: "MCQ ID", width: 250 },
  ];

  // Calculate if the Next button should be enabled
  const isNextButtonEnabled =
    selectedTestIds.length > 0 ||
    selectedCodeIds.length > 0 ||
    selectedMcqIds.length > 0;

  return (
    <>
      <Admin_Dashboard />
      <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          Test Management Dashboard
        </Typography>

        {/* Tests Section */}
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: "16px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tests
          </Typography>
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={tests}
              columns={testColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.tests}
              getRowId={(row) => row._id}
              checkboxSelection
              rowSelectionModel={selectedTestIds}
              onRowSelectionModelChange={(newSelection) => {
                console.log("Tests selection changed:", newSelection);
                setSelectedTestIds(newSelection);
              }}
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1565c0",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#f9f9f9",
                },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#e3f2fd" },
                borderRadius: "12px",
              }}
            />
          </Box>
        </Paper>

        {/* Coding Problems Section */}
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: "16px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Coding Problems
          </Typography>
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={codes}
              columns={codeColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.codes}
              getRowId={(row) => row.id}
              checkboxSelection
              rowSelectionModel={selectedCodeIds}
              onRowSelectionModelChange={(newSelection) => {
                console.log("Codes selection changed:", newSelection);
                setSelectedCodeIds(newSelection);
              }}
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1565c0",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#f9f9f9",
                },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#e3f2fd" },
                borderRadius: "12px",
              }}
            />
          </Box>
        </Paper>

        {/* MCQs Section */}
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: "16px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            MCQs
          </Typography>
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={mcqs}
              columns={mcqColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.mcqs}
              getRowId={(row) => row._id}
              checkboxSelection
              rowSelectionModel={selectedMcqIds}
              onRowSelectionModelChange={(newSelection) => {
                console.log("MCQs selection changed:", newSelection);
                setSelectedMcqIds(newSelection);
              }}
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1565c0",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#f9f9f9",
                },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#e3f2fd" },
                borderRadius: "12px",
              }}
            />
          </Box>
        </Paper>

        {/* Next Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextClick}
            disabled={!isNextButtonEnabled}
            sx={{ px: 4, py: 1.5, fontSize: "16px" }}
          >
            Next (
            {selectedTestIds.length +
              selectedCodeIds.length +
              selectedMcqIds.length}{" "}
            items selected)
          </Button>
        </Box>

        {/* Dialog for showing MCQ or Coding IDs */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #ddd",
            }}
          >
            {dialogTitle}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Box
              sx={{
                maxHeight: "400px",
                overflow: "auto",
                fontFamily: "monospace",
                backgroundColor: "#f9f9f9",
                p: 2,
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              {dialogContent.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    borderBottom:
                      index < dialogContent.length - 1
                        ? "1px solid #eee"
                        : "none",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <Typography variant="body2">{item}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(item)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Typography variant="caption" color="textSecondary">
              {dialogContent.length} items
            </Typography>
            <Box>
              <Button
                onClick={() => handleCopyToClipboard(dialogContent.join("\n"))}
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                sx={{ mr: 1 }}
              >
                Copy All
              </Button>
              <Button onClick={handleCloseDialog} variant="contained">
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Details Dialog with Card */}
        <Dialog
          open={detailsDialogOpen}
          onClose={handleDetailsDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #ddd",
            }}
          >
            Selected Items Details
            <IconButton onClick={handleDetailsDialogClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {/* Selected Tests */}
            {selectedTestIds.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Selected Tests ({selectedTestIds.length})
                </Typography>
                {selectedTestsDisplay.map((test) => (
                  <Card key={test._id} sx={{ mb: 2, p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Test Name: {test.test_name}
                      </Typography>
                      <Typography variant="body2">
                        Language: {test.test_language}
                      </Typography>
                      <Typography variant="body2">
                        Total Score: {test.test_total_score}
                      </Typography>
                      <Typography variant="body2">
                        MCQ IDs:{" "}
                        {test.test_mcq_id && test.test_mcq_id.length
                          ? test.test_mcq_id.join(", ")
                          : "None"}
                      </Typography>
                      <Typography variant="body2">
                        Coding IDs:{" "}
                        {test.test_coding_id && test.test_coding_id.length
                          ? test.test_coding_id.join(", ")
                          : "None"}
                      </Typography>
                      <Typography variant="body2">
                        Status: {test.status || "Unknown"}
                      </Typography>
                      <Typography variant="body2">
                        Test ID: {test.test_id}
                      </Typography>
                      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdateTest(test)}
                          disabled={updating}
                          startIcon={updating ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                          {updating ? "Updating..." : "Select for Update"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Selected Coding Problems */}
            {selectedCodeIds.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Selected Coding Problems ({selectedCodeIds.length})
                </Typography>
                {selectedCodesDisplay.map((code) => (
                  <Card key={code.id} sx={{ mb: 2, p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Code ID: {code.code_id}
                      </Typography>
                      <Typography variant="body2">
                        Problem: {code.problem}
                      </Typography>
                      <Typography variant="body2">
                        Test Cases: {code.testCases}
                      </Typography>
                      <Typography variant="body2">Tags: {code.tags}</Typography>
                      <Typography variant="body2">
                        Created At: {code.createdAt}
                      </Typography>
                      <Typography variant="body2">
                        Updated At: {code.updatedAt}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Selected MCQs */}
            {selectedMcqIds.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Selected MCQs ({selectedMcqIds.length})
                </Typography>
                {selectedMcqsDisplay.map((mcq) => (
                  <Card key={mcq._id} sx={{ mb: 2, p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Question: {mcq.mcq_question}
                      </Typography>
                      <Typography variant="body2">
                        Options:{" "}
                        {mcq.mcq_options && mcq.mcq_options.length
                          ? mcq.mcq_options.join(", ")
                          : "None"}
                      </Typography>
                      <Typography variant="body2">
                        Answer: {mcq.mcq_answer}
                      </Typography>
                      <Typography variant="body2">
                        Tags:{" "}
                        {mcq.mcq_tag && mcq.mcq_tag.length
                          ? mcq.mcq_tag.join(", ")
                          : "None"}
                      </Typography>
                      <Typography variant="body2">
                        MCQ ID: {mcq.mcq_id}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {selectedTestIds.length === 0 &&
              selectedCodeIds.length === 0 &&
              selectedMcqIds.length === 0 && (
                <Typography variant="body1" align="center">
                  No items selected.
                </Typography>
              )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDetailsDialogClose} variant="contained">
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUpdateTest(selectedTestForUpdate)}
              disabled={!selectedTestForUpdate || updating}
              startIcon={
                updating ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {updating ? "Updating..." : "Update with Selected Items"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default UpdateTestModule;