import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, fetchPocById, fetchAllUsers, fetchAllModules, updatePoc } from '../axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import ModuleIcon from '@mui/icons-material/Book';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Admin_Dashboard from '../components/AdminDash';
import { Stepper, Step, StepLabel, StepConnector, styled } from '@mui/material';
import { stepConnectorClasses } from '@mui/material/StepConnector';

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
  variants: [
    {
      props: ({ ownerState }) => ownerState.active || ownerState.completed,
      style: {
        backgroundColor: '#0b78b9',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
      },
    },
  ],
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <ModuleIcon />,
    2: <PersonIcon />,
    3: <GroupIcon />,
    4: <CheckCircleIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select Module', 'Select POC', 'Select Users', 'Review and Confirm'];

const Update_Poc = () => {
  const [pocs, setPocs] = useState([]);
  const [modules, setModules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    pocs: true,
    modules: true,
    users: true,
    pocDetails: false,
  });
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [pocDetailsFetched, setPocDetailsFetched] = useState(false);

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const pocIds = JSON.parse(localStorage.getItem('selectedPocIds')) || [];
      const moduleIds = JSON.parse(localStorage.getItem('selectedModuleIds')) || [];
      const userIds = JSON.parse(localStorage.getItem('selectedUserIds')) || [];

      setSelectedPocIds(Array.isArray(pocIds) ? pocIds : []);
      setSelectedModuleIds(Array.isArray(moduleIds) ? moduleIds : []);
      setSelectedUserIds(Array.isArray(userIds) ? userIds : []);
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      localStorage.removeItem('selectedUserIds');
    }
  }, []);

  // Fetch POC details if selectedPocIds exists after pocs are loaded
  useEffect(() => {
    if (loading.pocs || pocDetailsFetched || selectedPocIds.length !== 1) return;

    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc?.mod_poc_id) {
      console.error('Selected POC has no valid POC ID');
      setSelectedPocIds([]);
      localStorage.removeItem('selectedPocIds');
      return;
    }

    const fetchInitialPocDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, pocDetails: true }));
        const pocData = await fetchPocById(selectedPoc.mod_poc_id);
        const moduleIds = selectedModuleIds.length > 0 ? selectedModuleIds : pocData.mod_id ? [pocData.mod_id] : [];
        const userIds = Array.isArray(pocData.mod_users) ? pocData.mod_users : [];

        setSelectedModuleIds(moduleIds);
        setSelectedUserIds(userIds);

        // Update localStorage
        localStorage.setItem('selectedModuleIds', JSON.stringify(moduleIds));
        localStorage.setItem('selectedUserIds', JSON.stringify(userIds));

        setPocDetailsFetched(true);
      } catch (error) {
        console.error('Error fetching initial POC details:', error);
        setSnackbarMessage(`Error fetching POC details: ${error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSelectedPocIds([]);
        localStorage.removeItem('selectedPocIds');
      } finally {
        setLoading(prev => ({ ...prev, pocDetails: false }));
      }
    };

    fetchInitialPocDetails();
  }, [loading.pocs, selectedPocIds, pocs, pocDetailsFetched, selectedModuleIds]);

  // Clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      localStorage.removeItem('selectedUserIds');
    };
  }, []);

  // Fetch POCs
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

  // Fetch Modules
  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        setModules(response.data || []);
        setLoading(prev => ({ ...prev, modules: false }));
      } catch (error) {
        console.error('Error fetching modules:', error);
        setSnackbarMessage(`Error fetching modules: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, modules: false }));
      }
    };
    getModules();
  }, []);

  // Fetch Users
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAllUsers();
        setUsers(response.data || []);
        setLoading(prev => ({ ...prev, users: false }));
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbarMessage(`Error fetching users: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    getUsers();
  }, []);

  // Fetch POC details when clicking Next (if not already fetched)
  const fetchPocDetails = async (pocId) => {
    try {
      setLoading(prev => ({ ...prev, pocDetails: true }));
      const pocData = await fetchPocById(pocId);
      const moduleIds = selectedModuleIds.length > 0 ? selectedModuleIds : pocData.mod_id ? [pocData.mod_id] : [];
      const userIds = Array.isArray(pocData.mod_users) ? pocData.mod_users : [];

      setSelectedModuleIds(moduleIds);
      setSelectedUserIds(userIds);

      // Update localStorage
      localStorage.setItem('selectedModuleIds', JSON.stringify(moduleIds));
      localStorage.setItem('selectedUserIds', JSON.stringify(userIds));

      setPocDetailsFetched(true);
      setLoading(prev => ({ ...prev, pocDetails: false }));
      return true;
    } catch (error) {
      console.error('Error fetching POC details:', error);
      setSnackbarMessage(`Error fetching POC details: ${error}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(prev => ({ ...prev, pocDetails: false }));
      return false;
    }
  };

  // Map selectedModuleIds (mod_id) to module _id for DataGrid selection
  const getModuleSelectionModel = () => {
    return modules
      .filter(module => selectedModuleIds.includes(module.mod_id))
      .map(module => module._id);
  };

  // Map selectedUserIds (user_id) to user _id for DataGrid selection
  const getUserSelectionModel = () => {
    return users
      .filter(user => selectedUserIds.includes(user.user_id))
      .map(user => user._id);
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (selectedModuleIds.length !== 1) {
        setSnackbarMessage('Please select exactly one Module');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }
    if (activeStep === 1) {
      if (selectedPocIds.length !== 1) {
        setSnackbarMessage('Please select exactly one POC');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
      if (!selectedPoc?.mod_poc_id) {
        setSnackbarMessage('Selected POC has no valid POC ID');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (!pocDetailsFetched) {
        const success = await fetchPocDetails(selectedPoc.mod_poc_id);
        if (!success) return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarSeverity('error');
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
    if (selectedPocIds.length !== 1) {
      setSnackbarMessage('Please select exactly one POC to update');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleUpdatePoc = async () => {
    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc) {
      setSnackbarMessage('Selected POC not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updateData = {
      mod_poc_id: selectedPoc.mod_poc_id,
    };

    if (selectedModuleIds.length > 0) {
      const selectedModule = modules.find(m => m.mod_id === selectedModuleIds[0]);
      if (selectedModule?.mod_id) {
        updateData.mod_id = selectedModule.mod_id;
        console.log('Updating POC with mod_id:', selectedModule.mod_id);
      }
    }

    if (selectedUserIds.length > 0) {
      updateData.mod_users = selectedUserIds;
    }

    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      await updatePoc(updateData);
      setSnackbarMessage('POC updated successfully');
      setSnackbarSeverity('success');

      const updatedPocsResponse = await fetchAllPocs();
      setPocs(updatedPocsResponse.data || []);

      // Clear selections and localStorage
      setSelectedPocIds([]);
      setSelectedModuleIds([]);
      setSelectedUserIds([]);
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      localStorage.removeItem('selectedUserIds');
      setPocDetailsFetched(false);

      setActiveStep(0);
    } catch (error) {
      console.error('Error updating POC:', error);
      setSnackbarMessage(`Error updating POC: ${error.response?.data?.message || error.message}`);
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

  const columnsForModules = [
    { field: 'mod_name', headerName: 'Module Name', width: 200 },
    { field: 'mod_tech', headerName: 'Technology', width: 150 },
    { field: 'mod_duration', headerName: 'Duration', width: 200 },
    { field: 'mod_id', headerName: 'Module ID', width: 250 },
  ];

  const columnsForUsers = [
    { field: 'full_name', headerName: 'Full Name', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'college', headerName: 'College', width: 100 },
    { field: 'rollno', headerName: 'Roll No', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'user_id', headerName: 'User ID', width: 200 },
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
    <>
      <Admin_Dashboard />
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh', position: 'relative' }}>
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#0b78b9' }}>
          Update POC
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
                Select Module
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={modules}
                  columns={columnsForModules}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.modules}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={getModuleSelectionModel()}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection
                      .map(id => modules.find(m => m._id === id)?.mod_id)
                      .filter(Boolean);
                    setSelectedModuleIds(updatedSelection.length > 0 ? [updatedSelection[updatedSelection.length - 1]] : []);
                    localStorage.setItem('selectedModuleIds', JSON.stringify(updatedSelection));
                    console.log('Module selection updated:', updatedSelection);
                  }}
                  sx={dataGridSx}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
          {activeStep === 1 && (
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
                  loading={loading.pocs}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedPocIds}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                    setSelectedPocIds(updatedSelection);
                    localStorage.setItem('selectedPocIds', JSON.stringify(updatedSelection));
                    // Clear user selections to avoid stale data, but preserve module selection
                    setSelectedUserIds([]);
                    localStorage.removeItem('selectedUserIds');
                    setPocDetailsFetched(false);
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
                  disabled={selectedPocIds.length !== 1 || loading.pocDetails}
                  sx={{ backgroundColor: '#0b78b9', '&:hover': { backgroundColor: '#095e8f' } }}
                >
                  {loading.pocDetails ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#0b78b9' }}>
                Select Users
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={users}
                  columns={columnsForUsers}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.users}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={getUserSelectionModel()}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection
                      .map(id => users.find(u => u._id === id)?.user_id)
                      .filter(Boolean);
                    setSelectedUserIds(updatedSelection);
                    localStorage.setItem('selectedUserIds', JSON.stringify(updatedSelection));
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
          {activeStep === 3 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#0b78b9' }}>
                Review and Confirm
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Please review your selections below before confirming the update.
              </Typography>

              {/* Module Details */}
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Selected Module
                </Typography>
                {selectedModuleIds.length === 1 ? (
                  (() => {
                    const module = modules.find(mod => mod.mod_id === selectedModuleIds[0]);
                    return module ? (
                      <Box>
                        <Typography variant="body2"><strong>Name:</strong> {module.mod_name || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Technology:</strong> {module.mod_tech || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Duration:</strong> {module.mod_duration || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Module ID:</strong> {module.mod_id || 'N/A'}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="error">No Module found</Typography>
                    );
                  })()
                ) : (
                  <Typography variant="body2" color="textSecondary">No Module selected</Typography>
                )}
              </Box>

              {/* POC Details */}
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

              {/* Users Details */}
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Selected Users
                </Typography>
                {selectedUserIds.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0b78b9' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Full Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>College</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Roll No</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users
                          .filter(user => selectedUserIds.includes(user.user_id))
                          .map(user => (
                            <TableRow key={user._id}>
                              <TableCell>{user.full_name || 'N/A'}</TableCell>
                              <TableCell>{user.department || 'N/A'}</TableCell>
                              <TableCell>{user.college || 'N/A'}</TableCell>
                              <TableCell>{user.rollno || 'N/A'}</TableCell>
                              <TableCell>{user.email || 'N/A'}</TableCell>
                              <TableCell>{user.user_id || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">No Users selected</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
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
        {activeStep === 3 && (
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
            Update POC
          </Fab>
        )}
        <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            Confirm POC Update
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              Review the changes below for the selected POC:
            </DialogContentText>
            {selectedPocIds.length === 1 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>POC:</strong> {pocs.find(poc => poc._id === selectedPocIds[0])?.mod_poc_name || 'Unknown'}
              </Typography>
            )}
            {selectedModuleIds.length === 1 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Module:</strong> {modules.find(mod => mod.mod_id === selectedModuleIds[0])?.mod_name || 'Unknown'}
              </Typography>
            )}
            {selectedUserIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Users:</strong> {selectedUserIds.length} selected
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreviewDialog}>Cancel</Button>
            <Button
              onClick={handleUpdatePoc}
              variant="contained"
              color="primary"
              disabled={updateLoading}
            >
              {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            {detailsDialogTitle}
            <IconButton onClick={handleCloseDetailsDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ maxHeight: '300px', overflow: 'auto', fontFamily: 'monospace', backgroundColor: '#f9f9f9', p: 2, borderRadius: 1 }}>
              {detailsDialogContent.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: index < detailsDialogContent.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Typography variant="body2">{item}</Typography>
                  <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleCopyToClipboard(detailsDialogContent.join('\n'))} startIcon={<ContentCopyIcon />}>
              Copy All
            </Button>
            <Button onClick={handleCloseDetailsDialog} variant="contained">Close</Button>
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
    </>
  );
};

export default Update_Poc;  