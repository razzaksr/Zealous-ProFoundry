import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, fetchAllTests, fetchPocById, updateTestPoc } from '../axios';
import SaveIcon from '@mui/icons-material/Save';
import ModuleIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Admin_Dashboard from '../components/AdminDash';
import { Stepper, Step, StepLabel, StepConnector, styled } from '@mui/material';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#0b78b9',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#0b78b9',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme }) => ({
  backgroundColor: '#e0e0e0',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  '&.active, &.completed': {
    backgroundColor: '#0b78b9',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,0.25)',
  },
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <ModuleIcon />,
    2: <AssignmentIcon />,
    3: <CheckCircleIcon />,
  };

  return (
    <ColorlibStepIconRoot className={`${className} ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select POC', 'Select Tests', 'Review'];

const Allocate_Test = () => {
  const [pocs, setPocs] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState({
    pocs: true,
    tests: true,
    pocDetails: false,
  });
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [testDates, setTestDates] = useState({});
  const [originalTestDates, setOriginalTestDates] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [pocDetailsFetched, setPocDetailsFetched] = useState(false);

  useEffect(() => {
    try {
      const pocIds = JSON.parse(localStorage.getItem('selectedPocIds')) || [];
      const testIds = JSON.parse(localStorage.getItem('selectedTestIds')) || [];
      const storedTestDates = JSON.parse(localStorage.getItem('testDates')) || {};

      // Parse stored dates from ISO strings to dayjs objects
      const parsedTestDates = Object.keys(storedTestDates).reduce((acc, testId) => {
        const date = dayjs(storedTestDates[testId]);
        if (date.isValid()) {
          acc[testId] = date;
        }
        return acc;
      }, {});

      setSelectedPocIds(Array.isArray(pocIds) ? pocIds : []);
      setSelectedTestIds(Array.isArray(testIds) ? testIds : []);
      setTestDates(parsedTestDates);
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('testDates');
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('testDates');
    };
  }, []);

  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        setPocs(response.data || []);
        setLoading(prev => ({ ...prev, pocs: false }));
      } catch (error) {
        console.error('Error fetching POCs:', error);
        setSnackbarMessage(`Error fetching POCs: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, pocs: false }));
      }
    };
    getPocs();
  }, []);

  useEffect(() => {
    const getTests = async () => {
      try {
        const response = await fetchAllTests();
        setTests(response.data || []);
        setLoading(prev => ({ ...prev, tests: false }));
      } catch (error) {
        console.error('Error fetching tests:', error);
        setSnackbarMessage(`Error fetching tests: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, tests: false }));
      }
    };
    getTests();
  }, []);

  useEffect(() => {
    if (loading.pocs || selectedPocIds.length !== 1 || pocDetailsFetched) return;

    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc?.mod_poc_id) {
      console.error('Selected POC has no valid POC ID');
      setSelectedPocIds([]);
      localStorage.removeItem('selectedPocIds');
      return;
    }

    const fetchPocDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, pocDetails: true }));
        const pocData = await fetchPocById(selectedPoc.mod_poc_id);
        if (pocData && Array.isArray(pocData.mod_tests)) {
          // Filter test IDs to those present in tests state
          const validTestIds = pocData.mod_tests
            .map(test => test.test_id)
            .filter(id => id && typeof id === 'string' && tests.some(t => t.test_id === id));
          const dates = pocData.mod_tests.reduce((acc, test) => {
            if (test.test_id && test.assigned_date && validTestIds.includes(test.test_id)) {
              const parsedDate = dayjs(test.assigned_date, 'DD/MM/YYYY');
              if (parsedDate.isValid()) {
                acc[test.test_id] = parsedDate;
              }
            }
            return acc;
          }, {});

          setSelectedTestIds(validTestIds);
          setTestDates(dates);
          setOriginalTestDates(dates);

          // Store dates as ISO strings in localStorage
          const serializableDates = Object.keys(dates).reduce((acc, testId) => {
            acc[testId] = dates[testId].toISOString();
            return acc;
          }, {});
          localStorage.setItem('selectedTestIds', JSON.stringify(validTestIds));
          localStorage.setItem('testDates', JSON.stringify(serializableDates));
          console.log('Preselected tests:', validTestIds, 'with dates:', JSON.stringify(dates, null, 2));
        }
        setPocDetailsFetched(true);
      } catch (error) {
        console.error('Error fetching POC details:', error);
        setSnackbarMessage(`Error fetching POC details: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSelectedPocIds([]);
        localStorage.removeItem('selectedPocIds');
      } finally {
        setLoading(prev => ({ ...prev, pocDetails: false }));
      }
    };

    fetchPocDetails();
  }, [loading.pocs, selectedPocIds, pocs, pocDetailsFetched, tests]);

  const getTestSelectionModel = () => {
    const selection = tests
      .filter(test => selectedTestIds.includes(test.test_id))
      .map(test => test._id)
      .filter(id => id);
    console.log('Test selection model:', selection);
    return selection;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (selectedPocIds.length !== 1) {
        setSnackbarMessage('Please select exactly one POC');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (!pocDetailsFetched) {
        setSnackbarMessage('Please wait for POC details to load');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    } else if (activeStep === 1) {
      for (const testId of selectedTestIds) {
        if (!testDates[testId] || !dayjs(testDates[testId]).isValid()) {
          setSnackbarMessage(`Please select a valid date for test ID: ${testId}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
      }
      console.log('Proceeding to Review with tests:', selectedTestIds, 'dates:', JSON.stringify(testDates, null, 2));
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
    if (activeStep === 1) {
      setPocDetailsFetched(false);
    }
  };

  const handleOpenPreviewDialog = () => {
    if (selectedPocIds.length !== 1) {
      setSnackbarMessage('Please select exactly one POC to update');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    for (const testId of selectedTestIds) {
      if (!testDates[testId] || !dayjs(testDates[testId]).isValid()) {
        setSnackbarMessage(`Please select a valid date for test ID: ${testId}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }
    console.log('Opening preview with tests:', selectedTestIds, 'and dates:', JSON.stringify(testDates, null, 2));
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleUpdateTest = async () => {
    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc) {
      setSnackbarMessage('Selected POC not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Validate test IDs exist in tests state and remove duplicates
    const uniqueTestIds = [...new Set(selectedTestIds)];
    const invalidTestIds = uniqueTestIds.filter(
      testId => !tests.some(test => test.test_id === testId)
    );
    if (invalidTestIds.length > 0) {
      setSnackbarMessage(`Invalid test IDs: ${invalidTestIds.join(', ')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Validate dates
    const invalidTests = uniqueTestIds.filter(
      testId => !testDates[testId] || !dayjs(testDates[testId]).isValid()
    );
    if (invalidTests.length > 0) {
      setSnackbarMessage(`Invalid or missing dates for test IDs: ${invalidTests.join(', ')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const data = {
      mod_poc_id: selectedPoc.mod_poc_id,
      test_id: uniqueTestIds.map(testId => ({
        test_id: testId,
        assigned_date: dayjs(testDates[testId]).format('DD/MM/YYYY'),
      })),
    };

    console.log('Sending update test payload:', JSON.stringify(data, null, 2));

    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      const response = await updateTestPoc(data);
      setSnackbarMessage(response.message || 'Tests allocated successfully');
      setSnackbarSeverity('success');

      const updatedPocsResponse = await fetchAllPocs();
      setPocs(updatedPocsResponse.data || []);

      setSelectedPocIds([]);
      setSelectedTestIds([]);
      setTestDates({});
      setOriginalTestDates({});
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('testDates');
      setPocDetailsFetched(false);
      setActiveStep(0);
    } catch (error) {
      console.error('Error allocating tests:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to allocate tests';
      setSnackbarMessage(`Error allocating tests: ${errorMessage}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const columnsForPocs = [
    { field: 'mod_poc_name', headerName: 'Name', width: 150 },
    { field: 'mod_poc_role', headerName: 'Role', width: 100 },
    { field: 'mod_poc_email', headerName: 'Email', width: 200 },
    { field: 'mod_poc_mobile', headerName: 'Mobile', width: 150 },
    { field: 'mod_poc_id', headerName: 'POC ID', width: 200 },
  ];

  const columnsForTests = [
    { field: 'test_name', headerName: 'Test Name', width: 200 },
    { field: 'test_tech', headerName: 'Technology', width: 150 },
    { field: 'test_duration', headerName: 'Duration', width: 150 },
    { field: 'test_id', headerName: 'Test ID', width: 200 },
    {
      field: 'assigned_date',
      headerName: 'Assigned Date',
      width: 200,
      renderCell: (params) => {
        const testId = params.row.test_id;
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={testDates[testId] || null}
              onChange={(newValue) => {
                if (newValue && dayjs(newValue).isValid()) {
                  const updatedDates = { ...testDates, [testId]: newValue };
                  setTestDates(updatedDates);
                  // Store dates as ISO strings in localStorage
                  const serializableDates = Object.keys(updatedDates).reduce((acc, id) => {
                    acc[id] = updatedDates[id].toISOString();
                    return acc;
                  }, {});
                  localStorage.setItem('testDates', JSON.stringify(serializableDates));
                  console.log('Updated test dates:', JSON.stringify(updatedDates, null, 2));
                }
              }}
              renderInput={(props) => <TextField {...props} size="small" />}
            />
          </LocalizationProvider>
        );
      },
    },
  ];

  const dataGridSx = {
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#0b78b9',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px',
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
  };

  return (
    <Box>
      <Admin_Dashboard />
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh', position: 'relative' }}>
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#0b78b9' }}>
          Allocate Tests to POC
        </Typography>
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', mb: 4 }}>
          <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {activeStep === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#0b78b9' }}>
                Select POC
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={pocs}
                  columns={columnsForPocs}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.pocs || loading.pocDetails}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedPocIds}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                    setSelectedPocIds(updatedSelection);
                    setSelectedTestIds([]);
                    setTestDates({});
                    setOriginalTestDates({});
                    localStorage.setItem('selectedPocIds', JSON.stringify(updatedSelection));
                    localStorage.removeItem('selectedTestIds');
                    localStorage.removeItem('testDates');
                    setPocDetailsFetched(false);
                    console.log('POC selection updated:', updatedSelection);
                  }}
                  sx={dataGridSx}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading.pocDetails || selectedPocIds.length !== 1}
                  sx={{ backgroundColor: '#0b78b9', '&:hover': { backgroundColor: '#095e8f' } }}
                >
                  {loading.pocDetails ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#0b78b9' }}>
                Select Tests
              </Typography>
              <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={tests}
                  columns={columnsForTests}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25]}
                  loading={loading.tests}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={getTestSelectionModel()}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = [...new Set(newSelection
                      .map(id => {
                        const test = tests.find(t => t._id === id);
                        return test?.test_id;
                      })
                      .filter(id => id && typeof id === 'string'))];

                    const updatedDates = updatedSelection.reduce((acc, testId) => {
                      acc[testId] = testDates[testId] || originalTestDates[testId] || dayjs();
                      return acc;
                    }, {});

                    setSelectedTestIds(updatedSelection);
                    setTestDates(updatedDates);
                    // Store dates as ISO strings in localStorage
                    const serializableDates = Object.keys(updatedDates).reduce((acc, id) => {
                      acc[id] = updatedDates[id].toISOString();
                      return acc;
                    }, {});
                    localStorage.setItem('selectedTestIds', JSON.stringify(updatedSelection));
                    localStorage.setItem('testDates', JSON.stringify(serializableDates));
                    console.log('Test selection updated:', updatedSelection, 'with dates:', JSON.stringify(updatedDates, null, 2));
                  }}
                  sx={dataGridSx}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{ color: '#0b78b9', borderColor: '#0b78b9' }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ backgroundColor: '#0b78b9', '&:hover': { backgroundColor: '#095e8f' } }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#0b78b9' }}>
                Review Test Allocations
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Please review your selections below before confirming the allocation.
              </Typography>
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Selected POC
                </Typography>
                {selectedPocIds.length === 1 ? (
                  (() => {
                    const poc = pocs.find(poc => poc._id === selectedPocIds[0]);
                    return poc ? (
                      <Box>
                        <Typography variant="body2"><strong>Name:</strong> {poc.mod_poc_name || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Role:</strong> {poc.mod_poc_role || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {poc.mod_poc_email || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Mobile:</strong> {poc.mod_poc_mobile || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>POC ID:</strong> {poc.mod_poc_id || 'N/A'}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="error">No POC found</Typography>
                    );
                  })()
                ) : (
                  <Typography variant="body2" color="textSecondary">No POC selected</Typography>
                )}
              </Box>
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Selected Tests
                </Typography>
                {selectedTestIds.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0b78b9' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Test Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Technology</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Test ID</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Assigned Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTestIds.map(testId => {
                          const test = tests.find(t => t.test_id === testId);
                          return (
                            <TableRow key={testId}>
                              <TableCell>{test?.test_name || 'N/A'}</TableCell>
                              <TableCell>{test?.test_tech || 'N/A'}</TableCell>
                              <TableCell>{test?.test_duration || 'N/A'}</TableCell>
                              <TableCell>{testId}</TableCell>
                              <TableCell>
                                {testDates[testId] ? dayjs(testDates[testId]).format('DD/MM/YYYY') : 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">No Tests selected</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{ color: '#0b78b9', borderColor: '#0b78b9' }}
                >
                  Previous
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        {activeStep === 2 && (
          <Fab
            color="primary"
            variant="extended"
            onClick={handleOpenPreviewDialog}
            disabled={updateLoading || selectedPocIds.length !== 1}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              backgroundColor: '#0b78b9',
              '&:hover': { backgroundColor: '#095e8f' },
            }}
          >
            {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <SaveIcon sx={{ mr: 1 }} />}
            Confirm Allocation
          </Fab>
        )}
        <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            Confirm Test Allocation
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              Confirm the test allocations below for the selected POC:
            </DialogContentText>
            {selectedPocIds.length === 1 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>POC:</strong> {pocs.find(poc => poc._id === selectedPocIds[0])?.mod_poc_name || 'N/A'}
              </Typography>
            )}
            {selectedTestIds.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2"><strong>Tests:</strong></Typography>
                {selectedTestIds.map(testId => {
                  const test = tests.find(t => t.test_id === testId);
                  return (
                    <Typography key={testId} variant="body2" sx={{ ml: 2 }}>
                      - {test?.test_name || 'N/A'} (ID: {testId}, Date: {testDates[testId] ? dayjs(testDates[testId]).format('DD/MM/YYYY') : 'Not set'})
                    </Typography>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 2 }}>No tests selected for this POC.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreviewDialog} sx={{ color: '#0b78b9' }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTest}
              variant="contained"
              color="primary"
              disabled={updateLoading}
              sx={{ backgroundColor: '#0b78b9', '&:hover': { backgroundColor: '#095e8f' } }}
            >
              {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Allocate_Test;