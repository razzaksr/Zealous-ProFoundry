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
import { fetchAllOrganizations, fetchAllModules, updateOrganization } from '../axios';
import SaveIcon from '@mui/icons-material/Save';

const Update_Organization = () => {
  // State for data
  const [organizations, setOrganizations] = useState([]);
  const [modules, setModules] = useState([]);

  // State for loading
  const [loading, setLoading] = useState({
    organizations: true,
    modules: true
  });

  // State for selections
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  // State for update operation
  const [updateLoading, setUpdateLoading] = useState(false);

  // State for dialogs
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // State for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch Organizations data
  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const response = await fetchAllOrganizations();
        setOrganizations(response.data);
        setLoading(prev => ({ ...prev, organizations: false }));
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setLoading(prev => ({ ...prev, organizations: false }));
      }
    };
    getOrganizations();
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

  // Update selectedModuleIds when an organization is selected
  useEffect(() => {
    if (selectedOrganizationIds.length === 1) {
      const selectedOrg = organizations.find(org => org._id === selectedOrganizationIds[0]);
      if (selectedOrg && selectedOrg.mod_id) {
        // Map mod_id to module _id
        const preSelectedModuleIds = modules
          .filter(mod => selectedOrg.mod_id.includes(mod.mod_id))
          .map(mod => mod._id);
        setSelectedModuleIds(preSelectedModuleIds);
      } else {
        setSelectedModuleIds([]);
      }
    } else {
      setSelectedModuleIds([]);
    }
  }, [selectedOrganizationIds, organizations, modules]);

  // Handle opening preview dialog
  const handleOpenPreviewDialog = () => {
    if (selectedOrganizationIds.length !== 1) {
      setSnackbarMessage('Please select exactly one organization to update');
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

  // Handle updating organization after confirmation
  const handleUpdateOrganization = async () => {
    const selectedOrg = organizations.find(org => org._id === selectedOrganizationIds[0]);
    if (!selectedOrg) {
      setSnackbarMessage('Selected organization not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Prepare update data
    const updateData = {
      org_id: selectedOrg.org_id,
    };

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
      const response = await updateOrganization(updateData);

      setSnackbarMessage('Organization updated successfully');
      setSnackbarSeverity('success');

      // Refresh organizations data
      const updatedOrgsResponse = await fetchAllOrganizations();
      setOrganizations(updatedOrgsResponse.data);

      // Clear selections
      setSelectedOrganizationIds([]);
      setSelectedModuleIds([]);
    } catch (error) {
      console.error('Error updating organization:', error);
      setSnackbarMessage(`Error updating organization: ${error.response?.data?.error || error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Organization DataGrid columns
  const columnsForOrganizations = [
    { field: 'org_name', headerName: 'Name', width: 200 },
    { field: 'org_email', headerName: 'Email', width: 200 },
    { field: 'org_contact', headerName: 'Contact', width: 150 },
    { field: 'org_address', headerName: 'Address', width: 200 },
    { field: 'org_id', headerName: 'Organization ID', width: 200 },
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
      {/* Organization Management */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Organization Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px', mb: 4 }}>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={organizations}
            columns={columnsForOrganizations}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading.organizations}
            getRowId={(row) => row._id}
            checkboxSelection
            rowSelectionModel={selectedOrganizationIds}
            onRowSelectionModelChange={(newSelection) => {
              if (newSelection.length > 0) {
                setSelectedOrganizationIds([newSelection[newSelection.length - 1]]);
              } else {
                setSelectedOrganizationIds([]);
              }
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
        disabled={updateLoading || selectedOrganizationIds.length !== 1}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <SaveIcon sx={{ mr: 1 }} />}
        Update Organization
      </Fab>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          Preview Organization Update
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText paragraph>
            Please review the following changes before updating the organization:
          </DialogContentText>

          {/* Selected Organization */}
          <Typography variant="h6" gutterBottom>Selected Organization</Typography>
          {selectedOrganizationIds.length === 1 ? (
            <List dense>
              {organizations.filter(org => org._id === selectedOrganizationIds[0]).map(org => (
                <ListItem key={org._id}>
                  <ListItemText
                    primary={org.org_name}
                    secondary={`ID: ${org.org_id} | Email: ${org.org_email} | Contact: ${org.org_contact} | Address: ${org.org_address}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">No organization selected</Alert>
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
            onClick={handleUpdateOrganization}
            variant="contained"
            color="primary"
            disabled={updateLoading || selectedOrganizationIds.length !== 1}
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

export default Update_Organization;