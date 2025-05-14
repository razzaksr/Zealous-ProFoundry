import React, { useEffect, useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, fetchAllUsers, fetchAllModules, fetchAllTests } from '../axios';
import axios from 'axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Admin_Dashboard from '../components/Admin_dash';

const Update_Poc = () => {
  // State for data
  const [pocs, setPocs] = useState([]);
  const [modules, setModules] = useState([]);
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  
  // State for loading
  const [loading, setLoading] = useState({
    pocs: true,
    modules: true,
    tests: true,
    users: true
  });
  
  // State for selections
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // State for update operation
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // State for dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // State for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch POCs data
  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        setPocs(response.data);
        setLoading(prev => ({ ...prev, pocs: false }));
      } catch (error) {
        console.error('Error fetching POCs:', error);
        setLoading(prev => ({ ...prev, pocs: false }));
      }
    };
    getPocs();
  }, []);

  // Fetch Modules data
  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        setModules(response.data);
        setLoading(prev => ({ ...prev, modules: false }));
      } catch (error) {
        console.error('Error fetching modules:', error);
        setLoading(prev => ({ ...prev, modules: false }));
      }
    };
    getModules();
  }, []);

  // Fetch Tests data
  useEffect(() => {
    const fetchTestsData = async () => {
      try {
        const response = await fetchAllTests();
        const testData = response.data?.tests || response.data || [];
        if (!Array.isArray(testData)) {
          console.error('Tests data is not an array:', testData);
          setTests([]);
        } else {
          setTests(testData);
        }
        setLoading(prev => ({ ...prev, tests: false }));
      } catch (error) {
        console.error('Error fetching tests:', error);
        setTests([]);
        setLoading(prev => ({ ...prev, tests: false }));
      }
    };
    fetchTestsData();
  }, []);

  // Fetch Users data
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAllUsers();
        setUsers(response.data);
        setLoading(prev => ({ ...prev, users: false }));
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    getUsers();
  }, []);

  // Handle copy to clipboard
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

  // Handle opening details dialog
  const handleViewDetails = (title, items) => {
    setDetailsDialogTitle(title);
    setDetailsDialogContent(items);
    setDetailsDialogOpen(true);
  };

  // Handle closing details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  // Handle opening preview dialog
  const handleOpenPreviewDialog = () => {
    // Check if a POC is selected
    if (selectedPocIds.length !== 1) {
      setSnackbarMessage('Please select exactly one POC to update');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  // Handle closing preview dialog
  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  // Handle updating POC after confirmation
  const handleUpdatePoc = async () => {
    // Find the selected POC to get its ID
    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc) {
      setSnackbarMessage('Selected POC not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    // Prepare the test objects array
    const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const testUpdates = selectedTestIds.map(testId => {
      const test = tests.find(t => t._id === testId);
      return {
        test_id: test?.test_id || testId,
        assigned_date: currentDate
      };
    });
  
    // Prepare update data - start with just the POC ID
    const updateData = {
      mod_poc_id: selectedPoc.mod_poc_id,
    };
  
    // Only add mod_id if a module is selected
    if (selectedModuleIds.length > 0) {
      const selectedModule = modules.find(m => m._id === selectedModuleIds[0]);
      if (selectedModule?.mod_id) {
        updateData.mod_id = selectedModule.mod_id;
      }
    }
  
    // Only add mod_tests if there are tests to update
    if (testUpdates.length > 0) {
      updateData.mod_tests = testUpdates;
    }
  
    // Only add mod_users if there are users to update
    if (selectedUserIds.length > 0) {
      updateData.mod_users = selectedUserIds.map(userId => {
        const user = users.find(u => u._id === userId);
        return user?.user_id || userId;
      });
    }
  
    console.log('Update data:', updateData);
  
    // Send update request
    setUpdateLoading(true);
    setPreviewDialogOpen(false);
    
    try {
      const response = await axios.put('http://localhost:4000/poc_gateway/poc/update_poc', updateData);
      
      setSnackbarMessage('POC updated successfully');
      setSnackbarSeverity('success');
      
      // Refresh POCs data to show updated data
      const updatedPocsResponse = await fetchAllPocs();
      setPocs(updatedPocsResponse.data);
      
      // Clear selections
      setSelectedPocIds([]);
      setSelectedModuleIds([]);
      setSelectedTestIds([]);
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Error updating POC:', error);
      setSnackbarMessage(`Error updating POC: ${error.response?.data?.message || error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };
  // POC DataGrid columns
  const columnsForPocs = [
    { field: 'mod_poc_name', headerName: 'Name', width: 150 },
    { field: 'mod_poc_role', headerName: 'Role', width: 100 },
    { field: 'mod_poc_email', headerName: 'Email', width: 200 },
    { field: 'mod_poc_mobile', headerName: 'Mobile', width: 150 },
    { field: 'mod_poc_id', headerName: 'POC ID', width: 200 },
    {
      field: 'mod_tests',
      headerName: 'Tests',
      width: 300,
      renderCell: (params) => (
        <Box>
          {params.value && params.value.map ? params.value.map((test, index) => (
            <Typography key={index} variant="body2">
              {`Test ID: ${test.test_id}, Assigned: ${test.assigned_date}`}
            </Typography>
          )) : <Typography variant="body2">No tests</Typography>}
        </Box>
      ),
    },
  ];

  // Module DataGrid columns
  const columnsForModules = [
    { field: 'mod_name', headerName: 'Module Name', width: 200 },
    { field: 'mod_tech', headerName: 'Technology', width: 150 },
    { field: 'mod_duration', headerName: 'Duration', width: 200 },
    { field: 'mod_id', headerName: 'Module ID', width: 250 },
  ];

  // User DataGrid columns
  const columnsForUsers = [
    { field: 'full_name', headerName: 'Full Name', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'college', headerName: 'College', width: 100 },
    { field: 'rollno', headerName: 'Roll No', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'user_id', headerName: 'User ID', width: 200 },
  ];

  // Test DataGrid columns
  const columnsForTests = [
    { field: 'test_name', headerName: 'Test Name', width: 200, flex: 1 },
    { field: 'test_language', headerName: 'Language', width: 150 },
    { field: 'test_total_score', headerName: 'Total Score', width: 120 },
    {
      field: 'test_mcq_id',
      headerName: 'MCQ IDs',
      width: 200,
      flex: 1,
      renderCell: (params) => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
          return <Typography variant="body2" color="textSecondary">None</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${params.value.length} MCQs`} size="small" color="primary" variant="outlined" />
            <Tooltip title="View All MCQ IDs">
              <IconButton size="small" onClick={() => handleViewDetails(`MCQ IDs for ${params.row.test_name}`, params.value)}>
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton size="small" onClick={() => handleCopyToClipboard(params.value.join('\n'))}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      field: 'test_coding_id',
      headerName: 'Coding IDs',
      width: 200,
      flex: 1,
      renderCell: (params) => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
          return <Typography variant="body2" color="textSecondary">None</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${params.value.length} Codes`} size="small" color="secondary" variant="outlined" />
            <Tooltip title="View All Coding IDs">
              <IconButton size="small" onClick={() => handleViewDetails(`Coding IDs for ${params.row.test_name}`, params.value)}>
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton size="small" onClick={() => handleCopyToClipboard(params.value.join('\n'))}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Unknown'} 
          color={params.value === 'enabled' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'test_id', 
      headerName: 'Test ID', 
      width: 300,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Tooltip title={params.value}>
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 30px)' }}>
              {params.value}
            </Typography>
          </Tooltip>
          <Tooltip title="Copy ID">
            <IconButton size="small" onClick={() => handleCopyToClipboard(params.value)} sx={{ ml: 'auto' }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Common DataGrid styling
  const dataGridSx = {
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#1565c0',
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
      {/* POC Management */}
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          POC Management
        </Typography>
        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ height: 600, width: '100%' }}>
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
                // Limit to single selection for POCs
                if (newSelection.length > 0) {
                  setSelectedPocIds([newSelection[newSelection.length - 1]]);
                } else {
                  setSelectedPocIds([]);
                }
              }}
              sx={dataGridSx}
            />
          </Box>
        </Paper>
      </Box>

      {/* Module Management */}
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Module Management
        </Typography>
        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={modules}
              columns={columnsForModules}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.modules}
              getRowId={(row) => row._id}
              checkboxSelection
              rowSelectionModel={selectedModuleIds}
              onRowSelectionModelChange={(newSelection) => {
                // Limit to single selection for modules
                if (newSelection.length > 0) {
                  setSelectedModuleIds([newSelection[newSelection.length - 1]]);
                } else {
                  setSelectedModuleIds([]);
                }
              }}
              sx={dataGridSx}
            />
          </Box>
        </Paper>
      </Box>

      {/* Test Management */}
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Test Management Dashboard
        </Typography>
        
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: '16px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Tests</Typography>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={tests}
              columns={columnsForTests}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.tests}
              getRowId={(row) => row._id}
              checkboxSelection
              rowSelectionModel={selectedTestIds}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedTestIds(newSelection);
              }}
              autoHeight
              sx={dataGridSx}
            />
          </Box>
        </Paper>
      </Box>

      {/* User Management */}
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          User Management Dashboard
        </Typography>
        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={users}
              columns={columnsForUsers}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.users}
              getRowId={(row) => row._id}
              checkboxSelection
              rowSelectionModel={selectedUserIds}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedUserIds(newSelection);
              }}
              sx={dataGridSx}
            />
          </Box>
        </Paper>
      </Box>

      {/* Update Button */}
      <Fab
        color="primary"
        variant="extended"
        onClick={handleOpenPreviewDialog}
        disabled={updateLoading || selectedPocIds.length !== 1}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <SaveIcon sx={{ mr: 1 }} />}
        Update POC
      </Fab>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          Preview POC Update
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText paragraph>
            Please review the following changes before updating the POC:
          </DialogContentText>
          
          {/* Selected POC */}
          <Typography variant="h6" gutterBottom>Selected POC</Typography>
          {selectedPocIds.length === 1 ? (
            <List dense>
              {pocs.filter(poc => poc._id === selectedPocIds[0]).map(poc => (
                <ListItem key={poc._id}>
                  <ListItemText 
                    primary={poc.mod_poc_name} 
                    secondary={`ID: ${poc.mod_poc_id} | Role: ${poc.mod_poc_role} | Email: ${poc.mod_poc_email}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">No POC selected</Alert>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Selected Module */}
          <Typography variant="h6" gutterBottom>Selected Module</Typography>
          {selectedModuleIds.length === 1 ? (
            <List dense>
              {modules.filter(mod => mod._id === selectedModuleIds[0]).map(mod => (
                <ListItem key={mod._id}>
                  <ListItemText 
                    primary={mod.mod_name} 
                    secondary={`ID: ${mod.mod_id} | Technology: ${mod.mod_tech} | Duration: ${mod.mod_duration}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No module selected</Alert>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Selected Tests */}
          <Typography variant="h6" gutterBottom>Selected Tests ({selectedTestIds.length})</Typography>
          {selectedTestIds.length > 0 ? (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {tests.filter(test => selectedTestIds.includes(test._id)).map(test => (
                <ListItem key={test._id}>
                  <ListItemText 
                    primary={test.test_name} 
                    secondary={`ID: ${test.test_id} | Language: ${test.test_language} | Score: ${test.test_total_score}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No tests selected</Alert>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Selected Users */}
          <Typography variant="h6" gutterBottom>Selected Users ({selectedUserIds.length})</Typography>
          {selectedUserIds.length > 0 ? (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {users.filter(user => selectedUserIds.includes(user._id)).map(user => (
                <ListItem key={user._id}>
                  <ListItemText 
                    primary={user.full_name} 
                    secondary={`ID: ${user.user_id} | Email: ${user.email} | Dept: ${user.department}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No users selected</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdatePoc} 
            variant="contained" 
            color="primary" 
            disabled={updateLoading || selectedPocIds.length !== 1}
          >
            {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            Confirm Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog for showing MCQ or Coding IDs */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          {detailsDialogTitle}
          <IconButton onClick={handleCloseDetailsDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ maxHeight: '400px', overflow: 'auto', fontFamily: 'monospace', backgroundColor: '#f9f9f9', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
            {detailsDialogContent.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: index < detailsDialogContent.length - 1 ? '1px solid #eee' : 'none', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                <Typography variant="body2">{item}</Typography>
                <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="textSecondary">{detailsDialogContent.length} items</Typography>
          <Box>
            <Button onClick={() => handleCopyToClipboard(detailsDialogContent.join('\n'))} variant="outlined" startIcon={<ContentCopyIcon />} sx={{ mr: 1 }}>
              Copy All
            </Button>
            <Button onClick={handleCloseDetailsDialog} variant="contained">Close</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification */}
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
    </>
  );
};

export default Update_Poc;