import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  Menu,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchAllCodes, fetchAllMcqs, createTest } from "../axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import QuizIcon from "@mui/icons-material/Quiz";
import CodeIcon from "@mui/icons-material/Code";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import Admin_Dashboard from "../components/AdminDash";
import { stepConnectorClasses } from "@mui/material/StepConnector";
import { v4 as uuidv4 } from "uuid";

// Custom Stepper Connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#0c83c8',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#0c83c8',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
}));

// Custom Stepper Icon
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#e0e0e0',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  ...(ownerState.active || ownerState.completed ? {
    backgroundColor: '#0c83c8',
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
  } : {}),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <QuizIcon />,
    2: <CodeIcon />,
    3: <QuestionAnswerIcon />,
    4: <CheckCircleIcon />,
  };

  return (
    <Tooltip title={steps[icon - 1]}>
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(icon)]}
      </ColorlibStepIconRoot>
    </Tooltip>
  );
}

const steps = ['Enter Test Details', 'Select Coding Problems', 'Select MCQs', 'Review and Confirm'];

// Styled FAB for hover effect
const StyledFab = styled(Fab)(({ theme }) => ({
  backgroundColor: '#0c83c8',
  '&:hover': {
    backgroundColor: '#095e8f',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
  width: 56,
  height: 56,
}));

const AddTestModule = () => {
  const navigate = useNavigate();
  const [testDetails, setTestDetails] = useState({
    test_name: "",
    test_language: "",
    test_id: uuidv4(),
    status: "active",
  });
  const [codes, setCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState({
    codes: true,
    mcqs: true,
  });
  const [selectedCodeIds, setSelectedCodeIds] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState("");
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [activeStep, setActiveStep] = useState(0);
  const [dataGridKey, setDataGridKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        console.log("Fetching coding problems...");
        const codeResponse = await fetchAllCodes();
        console.log("Code response:", codeResponse);
        const codesArray = codeResponse.codes || [];
        if (!Array.isArray(codesArray)) {
          console.error("Codes data is not an array:", codesArray);
          setCodes([]);
        } else {
          const formattedRows = codesArray.map((item, index) => {
            const row = {
              id: item._id || `temp-id-${index}`,
              code_id: item.code_id || "N/A",
              problem: item.code_problem_statement || "N/A",
              testCases: (Array.isArray(item.code_test_cases_id) ? item.code_test_cases_id : Array.isArray(item.code_test_cases) ? item.code_test_cases : []).join(", ") || "None",
              tags: (Array.isArray(item.code_tags) ? item.code_tags : []).join(", ") || "None",
              createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
              updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A",
            };
            console.log(`Mapped code item ${index}:`, row);
            return row;
          });
          console.log("Formatted codes:", formattedRows);
          setCodes(formattedRows);
          setDataGridKey(prev => prev + 1);
        }
        setLoading(prev => ({ ...prev, codes: false }));
      } catch (error) {
        console.error("Error fetching codes:", error);
        setCodes([]);
        setLoading(prev => ({ ...prev, codes: false }));
        setSnackbarMessage("Failed to fetch codes: " + error);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchCodes();
  }, []);

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const mcqResponse = await fetchAllMcqs();
        const mcqData = mcqResponse.data?.mcqs || mcqResponse.data || [];
        if (!Array.isArray(mcqData)) {
          console.error("MCQs data is not an array:", mcqData);
          setMcqs([]);
        } else {
          setMcqs(mcqData);
        }
        setLoading(prev => ({ ...prev, mcqs: false }));
      } catch (error) {
        console.error("Error fetching MCQs:", error);
        setMcqs([]);
        setLoading(prev => ({ ...prev, mcqs: false }));
        setSnackbarMessage("Failed to fetch MCQs: " + error);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchMcqs();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!testDetails.test_name.trim()) {
      errors.test_name = "Test name is required";
    }
    if (!testDetails.test_language.trim()) {
      errors.test_language = "Test language is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setTestDetails(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleStatusToggle = () => {
    setTestDetails(prev => ({
      ...prev,
      status: prev.status === "active" ? "disabled" : "active",
    }));
  };

  const handleCopyToClipboard = text => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMessage("Copied to clipboard!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error("Error copying to clipboard:", err);
        setSnackbarMessage("Failed to copy to clipboard");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleViewDetails = (title, items) => {
    setDetailsDialogTitle(title);
    setDetailsDialogContent(Array.isArray(items) ? items : []);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  const handleOpenPreviewDialog = () => {
    if (!validateForm()) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateForm()) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
  };

  const calculateTotalScore = () => {
    const mcqCount = selectedMcqIds.length;
    const codeCount = selectedCodeIds.length;
    return mcqCount * 1 + codeCount * 10;
  };

  const handleCreateTest = async () => {
    if (!validateForm()) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const newMcqIds = mcqs
        .filter(mcq => selectedMcqIds.includes(mcq._id))
        .map(mcq => mcq.mcq_id);

      const newCodeIds = codes
        .filter(code => selectedCodeIds.includes(code.id))
        .map(code => code.code_id);

      const testData = {
        test_id: testDetails.test_id,
        test_name: testDetails.test_name,
        test_language: testDetails.test_language,
        test_mcq_id: newMcqIds,
        test_coding_id: newCodeIds,
        test_total_score: calculateTotalScore(),
        status: testDetails.status,
      };

      setCreateLoading(true);
      setPreviewDialogOpen(false);

      await createTest(testData);
      setSnackbarMessage("Test created successfully!");
      setSnackbarSeverity("success");

      setTestDetails({
        test_name: "",
        test_language: "",
        test_id: uuidv4(),
        status: "active",
      });
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setActiveStep(0);
      setDataGridKey(prev => prev + 1);
    } catch (error) {
      console.error("Error creating test:", error);
      setSnackbarMessage(`Failed to create test: ${error}`);
      setSnackbarSeverity("error");
    } finally {
      setCreateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleAddMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = path => {
    navigate(path);
    handleAddMenuClose();
  };

  const codeColumns = [
    { field: "code_id", headerName: "Code ID", minWidth: 200, flex: 1 },
    { field: "problem", headerName: "Problem Statement", minWidth: 300, flex: 1.5 },
    { field: "testCases", headerName: "Test Cases ID", minWidth: 250, flex: 1 },
    { field: "tags", headerName: "Tags", minWidth: 200, flex: 1 },
    { field: "createdAt", headerName: "Created At", minWidth: 180, flex: 0.8 },
    { field: "updatedAt", headerName: "Updated At", minWidth: 180, flex: 0.8 },
  ];

  const mcqColumns = [
    { field: "mcq_question", headerName: "Question", minWidth: 300, flex: 1.5 },
    {
      field: "mcq_options",
      headerName: "Options",
      minWidth: 250,
      flex: 1,
      valueGetter: params =>
        params.value && Array.isArray(params.value)
          ? params.value.join(", ")
          : "None",
    },
    { field: "mcq_answer", headerName: "Answer", minWidth: 150, flex: 0.6 },
    {
      field: "mcq_tag",
      headerName: "Tags",
      minWidth: 200,
      flex: 1,
      valueGetter: params =>
        params.value && Array.isArray(params.value)
          ? params.value.join(", ")
          : "None",
    },
    { field: "mcq_id", headerName: "MCQ ID", minWidth: 250, flex: 1 },
  ];

  const dataGridSx = {
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#0c83c8',
      color: 'white',
      fontWeight: 'bold',
      fontSize: { xs: '14px', sm: '16px' },
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 'bold',
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f9f9f9',
      },
      '&:hover': {
        backgroundColor: '#e3f2fd',
      },
    },
    borderRadius: '12px',
    fontSize: { xs: '12px', sm: '14px' },
  };

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            mb: { xs: 2, sm: 3, md: 4 },
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: '#0c83c8',
            width: '100%',
            py: 2,
            borderRadius: '12px 12px 0 0',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Add Test
        </Typography>
        <Paper
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            mb: 4,
            width: '100%',
            maxWidth: '1600px',
            bgcolor: 'white',
          }}
        >
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
            sx={{ mb: 4, px: { xs: 1, sm: 2 } }}
          >
            {steps.map(label => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '12px', sm: '14px', md: '16px' },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
        <Paper
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            width: '100%',
            maxWidth: '1600px',
            bgcolor: 'white',
          }}
        >
          {activeStep === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: '#0c83c8',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                Enter Test Details
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                <TextField
                  label="Test Name"
                  name="test_name"
                  value={testDetails.test_name}
                  onChange={handleInputChange}
                  error={!!formErrors.test_name}
                  helperText={formErrors.test_name}
                  fullWidth
                  required
                  sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                />
                <TextField
                  label="Test Language"
                  name="test_language"
                  value={testDetails.test_language}
                  onChange={handleInputChange}
                  error={!!formErrors.test_language}
                  helperText={formErrors.test_language}
                  fullWidth
                  required
                  sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                />
                <TextField
                  label="Test ID"
                  name="test_id"
                  value={testDetails.test_id}
                  disabled
                  fullWidth
                  sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={testDetails.status === "active"}
                      onChange={handleStatusToggle}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#0c83c8',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#0c83c8',
                        },
                      }}
                    />
                  }
                  label={`Status: ${testDetails.status === "active" ? "Active" : "Disabled"}`}
                  sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#0c83c8',
                    '&:hover': { backgroundColor: '#095e8f', transform: 'scale(1.05)' },
                    transition: 'all 0.3s ease',
                    fontSize: { xs: '12px', sm: '14px' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: '#0c83c8',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                Select Coding Problems
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Add New Coding Problem">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/add-coding')}
                    sx={{
                      backgroundColor: '#0c83c8',
                      '&:hover': { backgroundColor: '#095e8f', transform: 'scale(1.05)' },
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '12px', sm: '14px' },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Add Coding Problem
                  </Button>
                </Tooltip>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                {console.log("Rendering coding problems:", { loading: loading.codes, codesLength: codes.length, codes })}
                {loading.codes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : codes.length === 0 ? (
                  <Typography variant="body1" color="error" sx={{ textAlign: 'center', mt: 2 }}>
                    No coding problems found. Please add some coding problems.
                  </Typography>
                ) : (
                  <DataGrid
                    key={`code-grid-${dataGridKey}`}
                    rows={codes}
                    columns={codeColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    loading={loading.codes}
                    getRowId={row => row.id}
                    checkboxSelection
                    rowSelectionModel={selectedCodeIds}
                    onRowSelectionModelChange={newSelection => {
                      setSelectedCodeIds(newSelection);
                    }}
                    sx={dataGridSx}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontSize: { xs: '12px', sm: '14px' },
                    '&:hover': { borderColor: '#095e8f', color: '#095e8f' },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#0c83c8',
                    '&:hover': { backgroundColor: '#095e8f', transform: 'scale(1.05)' },
                    transition: 'all 0.3s ease',
                    fontSize: { xs: '12px', sm: '14px' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: '#0c83c8',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                Select MCQs
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Add New MCQ">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/add-mcq')}
                    sx={{
                      backgroundColor: '#0c83c8',
                      '&:hover': { backgroundColor: '#095e8f', transform: 'scale(1.05)' },
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '12px', sm: '14px' },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Add MCQ
                  </Button>
                </Tooltip>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                {loading.mcqs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : mcqs.length === 0 ? (
                  <Typography variant="body1" color="error" sx={{ textAlign: 'center', mt: 2 }}>
                    No MCQs found. Please add some MCQs.
                  </Typography>
                ) : (
                  <DataGrid
                    key={`mcq-grid-${dataGridKey}`}
                    rows={mcqs}
                    columns={mcqColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    loading={loading.mcqs}
                    getRowId={row => row._id}
                    checkboxSelection
                    rowSelectionModel={selectedMcqIds}
                    onRowSelectionModelChange={newSelection => {
                      setSelectedMcqIds(newSelection);
                    }}
                    sx={dataGridSx}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontSize: { xs: '12px', sm: '14px' },
                    '&:hover': { borderColor: '#095e8f', color: '#095e8f' },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#0c83c8',
                    '&:hover': { backgroundColor: '#095e8f', transform: 'scale(1.05)' },
                    transition: 'all 0.3s ease',
                    fontSize: { xs: '12px', sm: '14px' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 3 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: '#0c83c8',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                Review and Confirm
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: { xs: '14px', sm: '16px' },
                }}
              >
                Please review your selections below before confirming the creation.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontWeight: 'bold',
                  color: '#0c83c8',
                  fontSize: { xs: '14px', sm: '16px' },
                }}
              >
                Total Score: {calculateTotalScore()} ({selectedMcqIds.length} MCQs x 1 + {selectedCodeIds.length} Coding x 10)
              </Typography>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '14px', sm: '16px' },
                  }}
                >
                  Test Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2"><strong>Name:</strong> {testDetails.test_name || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Language:</strong> {testDetails.test_language || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {testDetails.status || 'Unknown'}</Typography>
                  <Typography variant="body2"><strong>Test ID:</strong> {testDetails.test_id || 'N/A'}</Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '14px', sm: '16px' },
                  }}
                >
                  Selected Coding Problems
                </Typography>
                {selectedCodeIds.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0c83c8' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Code ID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Problem Statement</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Test Cases ID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Tags</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {codes
                          .filter(code => selectedCodeIds.includes(code.id))
                          .map(code => (
                            <TableRow key={code.id}>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{code.code_id || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{code.problem || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{code.testCases || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{code.tags || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="error">No Coding Problems selected</Typography>
                )}
              </Box>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '14px', sm: '16px' },
                  }}
                >
                  Selected MCQs
                </Typography>
                {selectedMcqIds.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0c83c8' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Question</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Options</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Answer</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>Tags</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>MCQ ID</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mcqs
                          .filter(mcq => selectedMcqIds.includes(mcq._id))
                          .map(mcq => (
                            <TableRow key={mcq._id}>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{mcq.mcq_question || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{mcq.mcq_options?.length ? mcq.mcq_options.join(", ") : 'None'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{mcq.mcq_answer || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{mcq.mcq_tag?.length ? mcq.mcq_tag.join(", ") : 'None'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{mcq.mcq_id || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="error">No MCQs selected</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontSize: { xs: '12px', sm: '14px' },
                    '&:hover': { borderColor: '#095e8f', color: '#095e8f' },
                  }}
                >
                  Previous
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        <StyledFab
          onClick={activeStep === 3 ? handleOpenPreviewDialog : handleAddMenuOpen}
          disabled={activeStep === 3 && createLoading}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 20 },
            right: { xs: 16, sm: 20 },
            zIndex: 1000,
          }}
        >
          {activeStep === 3 ? (
            createLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SaveIcon />
            )
          ) : (
            <AddIcon />
          )}
        </StyledFab>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAddMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              borderRadius: '8px',
            },
          }}
        >
          <MenuItem
            onClick={() => handleNavigate('/add-test')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            <QuizIcon sx={{ mr: 1, color: '#0c83c8' }} /> Add Test
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add-coding')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            <CodeIcon sx={{ mr: 1, color: '#0c83c8' }} /> Add Coding Problem
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add-mcq')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            <QuestionAnswerIcon sx={{ mr: 1, color: '#0c83c8' }} /> Add MCQ
          </MenuItem>
        </Menu>
        <Dialog
          open={previewDialogOpen}
          onClose={handleClosePreviewDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' },
          }}
        >
          <DialogTitle sx={{ backgroundColor: '#0c83c8', color: 'white', fontSize: { xs: '16px', sm: '18px' } }}>
            Confirm Test Creation
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
              Review the test details below:
            </DialogContentText>
            <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
              <strong>Test Name:</strong> {testDetails.test_name}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
              <strong>Test Language:</strong> {testDetails.test_language}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
              <strong>Status:</strong> {testDetails.status}
            </Typography>
            {selectedCodeIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Coding Problems:</strong> {selectedCodeIds.length} selected
              </Typography>
            )}
            {selectedMcqIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>MCQs:</strong> {selectedMcqIds.length} selected
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontWeight: 'bold',
                color: '#0c83c8',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              <strong>Total Score:</strong> {calculateTotalScore()} ({selectedMcqIds.length} MCQs x 1 + {selectedCodeIds.length} Coding x 10)
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClosePreviewDialog}
              sx={{
                color: '#0c83c8',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateTest}
              disabled={createLoading}
              sx={{
                backgroundColor: '#0c83c8',
                '&:hover': { backgroundColor: '#095e8f' },
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {createLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#0c83c8',
              color: 'white',
              fontSize: { xs: '16px', sm: '18px' },
            }}
          >
            {detailsDialogTitle}
            <IconButton onClick={handleCloseDetailsDialog}>
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                maxHeight: '300px',
                overflow: 'auto',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 1,
              }}
            >
              {detailsDialogContent.map((item, index) => (
                <Box
                  key={`${item}-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: index < detailsDialogContent.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{item}</Typography>
                  <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                    <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleCopyToClipboard(detailsDialogContent.join('\n'))}
              startIcon={<ContentCopyIcon />}
              sx={{
                color: '#0c83c8',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              Copy All
            </Button>
            <Button
              onClick={handleCloseDetailsDialog}
              variant="contained"
              sx={{
                backgroundColor: '#0c83c8',
                '&:hover': { backgroundColor: '#095e8f' },
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: '100%',
              backgroundColor: snackbarSeverity === 'success' ? '#0c83c8' : undefined,
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default AddTestModule;