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
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllExperts, fetchAllPocs, fetchAllModules, updateExpert } from '../axios';
import SaveIcon from '@mui/icons-material/Save';

const Update_Expert = () => {
  // State for data
  const [experts, setExperts] = useState([]);
  const [pocs, setPocs] = useState([]);
  const [modules, setModules] = useState([]);

  // State for loading
  const [loading, setLoading] = useState({
    experts: true,
    pocs: true,
    modules: true
  });

  // State for selections
  const [selectedExpertIds, setSelectedExpertIds] = useState([]);
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  // State for update operation
  const [updateLoading, setUpdateLoading] = useState(false);

  // State for dialogs
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // State for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch Experts data
  useEffect(() => {
    const getExperts = async () => {
      try {
        const response = await fetchAllExperts();
        setExperts(response.data);
        setLoading(prev => ({ ...prev, experts: false }));
      } catch (error) {
        console.error('Error fetching experts:', error);
        setLoading(prev => ({ ...prev, experts: false }));
      }
    };
    getExperts();
  }, []);

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

  // Handle opening preview dialog
  const handleOpenPreviewDialog = () => {
    if (selectedExpertIds.length !== 1) {
      setSnackbarMessage('Please select exactly one expert to update');
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

  // Handle updating expert after confirmation
  const handleUpdateExpert = async () => {
    const selectedExpert = experts.find(expert => expert._id === selectedExpertIds[0]);
    if (!selectedExpert) {
      setSnackbarMessage('Selected expert not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Prepare update data
    const updateData = {
      mod_expert_id: selectedExpert.mod_expert_id,
    };

    // Add poc_id (array of mod_poc_id) if POCs are selected
    if (selectedPocIds.length > 0) {
      updateData.poc_id = pocs
        .filter(poc => selectedPocIds.includes(poc._id))
        .map(poc => poc.mod_poc_id);
    }

    // Add mod_id if modules are selected
    if (selectedModuleIds.length > 0) {
      updateData.mod_id = modules
        .filter(mod => selectedModuleIds.includes(mod._id))
        .map(mod => mod.mod_id);
    }

    console.log('Update data:', updateData);

    // Send update request
    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      const response = await updateExpert(updateData);

      setSnackbarMessage('Expert updated successfully');
      setSnackbarSeverity('success');

      // Refresh experts data
      const updatedExpertsResponse = await fetchAllExperts();
      setExperts(updatedExpertsResponse.data);

      // Clear selections
      setSelectedExpertIds([]);
      setSelectedPocIds([]);
      setSelectedModuleIds([]);
    } catch (error) {
      console.error('Error updating expert:', error);
      setSnackbarMessage(`Error updating expert: ${error.response?.data?.error || error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Expert DataGrid columns
  const columnsForExperts = [
    { field: 'mod_expert_name', headerName: 'Name', width: 150 },
    { field: 'mod_expert_role', headerName: 'Role', width: 150 },
    { field: 'mod_expert_mobile', headerName: 'Mobile', width: 150 },
    { field: 'mod_expert_id', headerName: 'Expert ID', width: 200 },
    {
      field: 'poc_id',
      headerName: 'POC IDs',
      width: 250,
      renderCell: (params) => (
        <Box>
          {params.value && params.value.length > 0 ? (
            params.value.map((id, index) => (
              <Typography key={index} variant="body2">{id}</Typography>
            ))
          ) : (
            <Typography variant="body2">No POCs</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'mod_id',
      headerName: 'Module IDs',
      width: 250,
      renderCell: (params) => (
        <Box>
          {params.value && params.value.length > 0 ? (
            params.value.map((id, index) => (
              <Typography key={index} variant="body2">{id}</Typography>
            ))
          ) : (
            <Typography variant="body2">No modules</Typography>
          )}
        </Box>
      ),
    },
  ];

  // POC DataGrid columns
  const columnsForPocs = [
    { field: 'mod_poc_name', headerName: 'POC Name', width: 150 },
    { field: 'mod_poc_role', headerName: 'Role', width: 120 },
    { field: 'mod_poc_email', headerName: 'Email', width: 200 },
    { field: 'mod_poc_mobile', headerName: 'Mobile', width: 150 },
    { field: 'mod_poc_id', headerName: 'POC ID', width: 200 },
  ];

  // Module DataGrid columns
  const columnsForModules = [
    { field: 'mod_name', headerName: 'Module Name', width: 200 },
    { field: 'mod_id', headerName: 'Module ID', width: 250 },
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
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Expert Management */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Expert Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px', mb: 4 }}>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={experts}
            columns={columnsForExperts}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading.experts}
            getRowId={(row) => row._id}
            checkboxSelection
            rowSelectionModel={selectedExpertIds}
            onRowSelectionModelChange={(newSelection) => {
              if (newSelection.length > 0) {
                setSelectedExpertIds([newSelection[newSelection.length - 1]]);
              } else {
                setSelectedExpertIds([]);
              }
            }}
            sx={dataGridSx}
          />
        </Box>
      </Paper>

      {/* POC Management */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        POC Selection
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px', mb: 4 }}>
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
              setSelectedPocIds(newSelection);
            }}
            sx={dataGridSx}
          />
        </Box>
      </Paper>

      {/* Module Management */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Module Selection
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px', mb: 4 }}>
        <Box sx={{ height: 400, width: '100%' }}>
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
              setSelectedModuleIds(newSelection);
            }}
            sx={dataGridSx}
          />
        </Box>
      </Paper>

      {/* Update Button */}
      <Fab
        color="primary"
        variant="extended"
        onClick={handleOpenPreviewDialog}
        disabled={updateLoading || selectedExpertIds.length !== 1}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <SaveIcon sx={{ mr: 1 }} />}
        Update Expert
      </Fab>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          Preview Expert Update
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText paragraph>
            Please review the following changes before updating the expert:
          </DialogContentText>

          {/* Selected Expert */}
          <Typography variant="h6" gutterBottom>Selected Expert</Typography>
          {selectedExpertIds.length === 1 ? (
            <List dense>
              {experts.filter(expert => expert._id === selectedExpertIds[0]).map(expert => (
                <ListItem key={expert._id}>
                  <ListItemText
                    primary={expert.mod_expert_name}
                    secondary={`ID: ${expert.mod_expert_id} | Role: ${expert.mod_expert_role} | Mobile: ${expert.mod_expert_mobile}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">No expert selected</Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Selected POCs */}
          <Typography variant="h6" gutterBottom>Selected POCs ({selectedPocIds.length})</Typography>
          {selectedPocIds.length > 0 ? (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {pocs.filter(poc => selectedPocIds.includes(poc._id)).map(poc => (
                <ListItem key={poc._id}>
                  <ListItemText
                    primary={poc.mod_poc_name}
                    secondary={`ID: ${poc.mod_poc_id} | Role: ${poc.mod_poc_role} | Email: ${poc.mod_poc_email} | Mobile: ${poc.mod_poc_mobile}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No POCs selected</Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Selected Modules */}
          <Typography variant="h6" gutterBottom>Selected Modules ({selectedModuleIds.length})</Typography>
          {selectedModuleIds.length > 0 ? (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {modules.filter(mod => selectedModuleIds.includes(mod._id)).map(mod => (
                <ListItem key={mod._id}>
                  <ListItemText
                    primary={mod.mod_name}
                    secondary={`ID: ${mod.mod_id}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No modules selected</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateExpert}
            variant="contained"
            color="primary"
            disabled={updateLoading || selectedExpertIds.length !== 1}
          >
            {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            Confirm Update
          </Button>
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
    </Box>
  );
};

export default Update_Expert;