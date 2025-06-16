import React, { useEffect, useState, useCallback } from "react";
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
  Switch,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchAllTests, fetchAllCodes, fetchAllMcqs, updateTest, getTestById } from "../axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import QuizIcon from "@mui/icons-material/Quiz";
import CodeIcon from "@mui/icons-material/Code";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import Admin_Dashboard from "../components/AdminDash";
import { stepConnectorClasses } from "@mui/material/StepConnector";

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

const steps = ['Select Test', 'Select Coding Problems', 'Select MCQs', 'Review and Confirm'];

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

const UpdateTestModule = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState({
    tests: true,
    codes: true,
    mcqs: true,
  });
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedCodeIds, setSelectedCodeIds] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState("");
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChange, setStatusChange] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [activeStep, setActiveStep] = useState(0);
  const [dataGridKey, setDataGridKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    try {
      const testIds = JSON.parse(localStorage.getItem('selectedTestIds')) || [];
      const codeIds = JSON.parse(localStorage.getItem('selectedCodeIds')) || [];
      const mcqIds = JSON.parse(localStorage.getItem('selectedMcqIds')) || [];

      setSelectedTestIds(Array.isArray(testIds) ? testIds : []);
      setSelectedCodeIds(Array.isArray(codeIds) ? codeIds : []);
      setSelectedMcqIds(Array.isArray(mcqIds) ? mcqIds : []);
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
    };
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testResponse = await fetchAllTests();
        const testData = testResponse.data?.tests || testResponse.data || [];
        if (!Array.isArray(testData)) {
          console.error("Tests data is not an array:", testData);
          setTests([]);
        } else {
          setTests(testData);
        }
        setLoading(prev => ({ ...prev, tests: false }));
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]);
        setLoading(prev => ({ ...prev, tests: false }));
        setSnackbarMessage("Failed to fetch tests: " + error);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchTests();
  }, []);

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

  // Debug codes state
  useEffect(() => {
    console.log("Codes state updated:", codes);
  }, [codes]);

  const fetchTestDetails = useCallback(async () => {
    if (loading.tests || loading.codes || loading.mcqs || !tests.length || !mcqs.length || !codes.length) {
      return;
    }

    if (selectedTestIds.length !== 1) {
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setDataGridKey(prev => prev + 1);
      return;
    }

    const test = tests.find(test => test._id === selectedTestIds[0]);
    if (!test || !test.test_id) {
      setSnackbarMessage("Invalid test selected");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setDataGridKey(prev => prev + 1);
      return;
    }

    setSelectedTest(test);

    try {
      const testData = await getTestById(test.test_id);
      const mcqIds = mcqs
        .filter(mcq => testData.test_mcq_id?.includes(mcq.mcq_id))
        .map(mcq => mcq._id);
      const codeIds = codes
        .filter(code => testData.test_coding_id?.includes(code.code_id))
        .map(code => code.id);

      setSelectedMcqIds(mcqIds);
      setSelectedCodeIds(codeIds);
      localStorage.setItem('selectedMcqIds', JSON.stringify(mcqIds));
      localStorage.setItem('selectedCodeIds', JSON.stringify(codeIds));
      setDataGridKey(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching test details:", error);
      setSnackbarMessage("Failed to fetch test details: " + error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setDataGridKey(prev => prev + 1);
    }
  }, [selectedTestIds, tests, mcqs, codes, loading.tests, loading.codes, loading.mcqs]);

  useEffect(() => {
    fetchTestDetails();
  }, [fetchTestDetails]);

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
    if (selectedTestIds.length !== 1) {
      setSnackbarMessage("Please select exactly one Test to update");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleOpenStatusDialog = (test, newStatus) => {
    if (!test || !test._id || selectedTestIds[0] !== test._id) {
      setSnackbarMessage("Please select a test to update its status");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setSelectedTest(test);
    setStatusChange(newStatus);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setStatusChange(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedTest || !selectedTest.test_id) {
      setSnackbarMessage("No valid test selected for status update");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      handleCloseStatusDialog();
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = {
        test_id: selectedTest.test_id,
        status: statusChange,
      };

      await updateTest(updateData);
      setSnackbarMessage(`Test status updated to ${statusChange} successfully!`);
      setSnackbarSeverity("success");

      const refreshResponse = await fetchAllTests();
      const testData = refreshResponse.data?.tests || refreshResponse.data || [];
      if (Array.isArray(testData)) {
        setTests(testData);
        const updatedTest = testData.find(t => t.test_id === selectedTest.test_id);
        if (updatedTest) {
          setSelectedTest(updatedTest);
        }
      } else {
        setTests([]);
      }

      handleCloseStatusDialog();
    } catch (error) {
      console.error("Error updating test status:", error);
      setSnackbarMessage(`Failed to update test status: ${error}`);
      setSnackbarSeverity("error");
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedTestIds.length !== 1) {
      setSnackbarMessage("Please select exactly one Test");
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

  const handleUpdateTest = async () => {
    if (!selectedTest || !selectedTest.test_id) {
      setSnackbarMessage("No valid test selected for update");
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

      const updateData = {
        test_id: selectedTest.test_id,
        test_mcq_id: newMcqIds,
        test_coding_id: newCodeIds,
        test_total_score: calculateTotalScore(),
      };

      setUpdateLoading(true);
      setPreviewDialogOpen(false);

      await updateTest(updateData);
      setSnackbarMessage("Test updated successfully!");
      setSnackbarSeverity("success");

      const refreshResponse = await fetchAllTests();
      const testData = refreshResponse.data?.tests || refreshResponse.data || [];
      if (Array.isArray(testData)) {
        setTests(testData);
      } else {
        setTests([]);
      }

      setSelectedTestIds([]);
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setActiveStep(0);
      setDataGridKey(prev => prev + 1);
    } catch (error) {
      console.error("Error updating test:", error);
      setSnackbarMessage(`Update failed: ${error}`);
      setSnackbarSeverity("error");
    } finally {
      setUpdateLoading(false);
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

  const testColumns = [
    { field: "test_name", headerName: "Test Name", minWidth: 200, flex: 1 },
    { field: "test_language", headerName: "Language", minWidth: 150, flex: 0.5 },
    { field: "test_total_score", headerName: "Total Score", minWidth: 120, flex: 0.4 },
    {
      field: "test_mcq_id",
      headerName: "MCQ IDs",
      minWidth: 200,
      flex: 1,
      renderCell: params => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
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
              sx={{ borderColor: '#0c83c8', color: '#0c83c8' }}
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
                <ListAltIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(params.value.join("\n"))}
              >
                <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "test_coding_id",
      headerName: "Coding IDs",
      minWidth: 200,
      flex: 1,
      renderCell: params => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
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
              sx={{ borderColor: '#0c83c8', color: '#0c83c8' }}
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
                <ListAltIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(params.value.join("\n"))}
              >
                <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.5,
      renderCell: params => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={params.value || "Unknown"}
            color={params.value === "active" ? "success" : "default"}
            size="small"
            sx={{ borderColor: '#0c83c8', color: '#0c83c8' }}
          />
          <Tooltip title={params.value === "active" ? "Disable Test" : "Activate Test"}>
            <Switch
              checked={params.value === "active"}
              onChange={() =>
                handleOpenStatusDialog(
                  params.row,
                  params.value === "active" ? "disabled" : "active"
                )
              }
              disabled={selectedTestIds[0] !== params.row._id || updateLoading}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#0c83c8',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#0c83c8',
                },
              }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "test_id",
      headerName: "Test ID",
      minWidth: 200,
      flex: 1.5,
      renderCell: params => (
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
              <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
          Update Test
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
                Select Test
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Add New Test">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/add_test')}
                    sx={{
                      backgroundColor: '#0c83c8',
                      '&:hover': { backgroundColor: '#095e8f', transform: 'scale(1.05)' },
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '12px', sm: '14px' },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Add Test
                  </Button>
                </Tooltip>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                <DataGrid
                  key={`test-grid-${dataGridKey}`}
                  rows={tests}
                  columns={testColumns}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  loading={loading.tests}
                  getRowId={row => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedTestIds}
                  onRowSelectionModelChange={newSelection => {
                    const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                    setSelectedTestIds(updatedSelection);
                    localStorage.setItem('selectedTestIds', JSON.stringify(updatedSelection));
                  }}
                  sx={dataGridSx}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    console.log({
                      selectedTestIds,
                      selectedTest,
                      selectedMcqIds,
                      selectedCodeIds,
                      tests,
                      mcqs: mcqs.map(m => ({ _id: m._id, mcq_id: m.mcq_id })),
                      codes: codes.map(c => ({ id: c.id, code_id: c.code_id })),
                    });
                  }}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontSize: { xs: '12px', sm: '14px' },
                    '&:hover': { borderColor: '#095e8f', color: '#095e8f' },
                  }}
                >
                  Debug State
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
                    onClick={() => navigate('/add_coding')}
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
                      localStorage.setItem('selectedCodeIds', JSON.stringify(newSelection));
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
                    onClick={() => navigate('/add_mcq')}
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
                      localStorage.setItem('selectedMcqIds', JSON.stringify(newSelection));
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
                Please review your selections below before confirming the update.
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
                  Selected Test
                </Typography>
                {selectedTestIds.length === 1 && selectedTest ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2"><strong>Name:</strong> {selectedTest.test_name || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Language:</strong> {selectedTest.test_language || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Total Score:</strong> {selectedTest.test_total_score || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>MCQ IDs:</strong> {selectedTest.test_mcq_id?.length ? selectedTest.test_mcq_id.join(", ") : 'None'}</Typography>
                    <Typography variant="body2"><strong>Coding IDs:</strong> {selectedTest.test_coding_id?.length ? selectedTest.test_coding_id.join(", ") : 'None'}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {selectedTest.status || 'Unknown'}</Typography>
                    <Typography variant="body2"><strong>Test ID:</strong> {selectedTest.test_id || 'N/A'}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">No Test found</Typography>
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
          disabled={activeStep === 3 && (updateLoading || selectedTestIds.length !== 1)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 20 },
            right: { xs: 16, sm: 20 },
            zIndex: 1000,
          }}
        >
          {activeStep === 3 ? (
            updateLoading ? (
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
            onClick={() => handleNavigate('/add_test')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            <QuizIcon sx={{ mr: 1, color: '#0c83c8' }} /> Add Test
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add_coding')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            <CodeIcon sx={{ mr: 1, color: '#0c83c8' }} /> Add Coding Problem
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add_mcq')}
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
            Confirm Test Update
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
              Review the changes below:
            </DialogContentText>
            {selectedTest && (
              <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Test:</strong> {selectedTest.test_name || 'Unknown'}
              </Typography>
            )}
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
              onClick={handleUpdateTest}
              disabled={updateLoading}
              sx={{
                backgroundColor: '#0c83c8',
                '&:hover': { backgroundColor: '#095e8f' },
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={statusDialogOpen}
          onClose={handleCloseStatusDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' },
          }}
        >
          <DialogTitle sx={{ backgroundColor: '#0c83c8', color: 'white', fontSize: { xs: '16px', sm: '18px' } }}>
            Confirm Status Change
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
              {statusChange === "active"
                ? `Are you sure you want to activate this test? It will become available to users. Ensure it has sufficient questions (currently ${selectedMcqIds.length} MCQs, ${selectedCodeIds.length} coding problems).`
                : `Are you sure you want to disable this test? It will no longer be available to users.`}
            </DialogContentText>
            {selectedTest && (
              <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Test:</strong> {selectedTest.test_name || 'Unknown'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseStatusDialog}
              sx={{
                color: '#0c83c8',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleToggleStatus}
              disabled={updateLoading}
              sx={{
                backgroundColor: '#0c83c8',
                '&:hover': { backgroundColor: '#095e8f' },
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
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

export default UpdateTestModule;