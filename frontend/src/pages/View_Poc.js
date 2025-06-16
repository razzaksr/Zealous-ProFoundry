import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Fab,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, getModuleById, updatePoc } from '../axios';
import Admin_Dashboard from '../components/AdminDash';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

const View_Poc = () => {
  const [pocs, setPocs] = useState([]);
  const [filteredPocs, setFilteredPocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLiveOnly, setShowLiveOnly] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChangePending, setStatusChangePending] = useState(null);
  const [selectedPocForStatus, setSelectedPocForStatus] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  const today = new Date();

  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        console.log('Full API Response:', response);
        if (Array.isArray(response.data)) {
          console.log('Fetched POCs:', response.data);
          const pocsWithModuleDetails = await Promise.all(
            response.data.map(async (poc) => {
              try {
                const module = await getModuleById(poc.mod_id);
                const [startDateStr, endDateStr] = module.mod_duration.split(' - ');
                const startDate = new Date(
                  startDateStr.split('/').reverse().join('-')
                );
                const endDate = new Date(
                  endDateStr.split('/').reverse().join('-')
                );
                const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                const isLive = todayDate.getTime() === startDateOnly.getTime() ||
                               todayDate.getTime() === endDateOnly.getTime() ||
                               (todayDate >= startDateOnly && todayDate <= endDateOnly);
                return {
                  ...poc,
                  module_name: module.mod_name,
                  module_duration: module.mod_duration,
                  status: isLive ? 'Live' : 'Not Live',
                };
              } catch (err) {
                console.error(`Error fetching module for POC ${poc.mod_poc_id}:`, err);
                return {
                  ...poc,
                  module_name: 'N/A',
                  module_duration: 'N/A',
                  status: 'Unknown',
                };
              }
            })
          );
          setPocs(pocsWithModuleDetails);
          setFilteredPocs(pocsWithModuleDetails.filter((poc) => poc.status === 'Live'));
        } else {
          console.error('Expected an array, got:', response.data);
          setError('Invalid data format received from server');
          setPocs([]);
          setFilteredPocs([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching POCs:', error.message, error.response || error);
        setError('Failed to fetch POCs: ' + (error.message || 'Unknown error'));
        setPocs([]);
        setFilteredPocs([]);
        setLoading(false);
      }
    };
    getPocs();
  }, []);

  useEffect(() => {
    if (showLiveOnly) {
      setFilteredPocs(pocs.filter((poc) => poc.status === 'Live'));
    } else {
      setFilteredPocs(pocs);
    }
  }, [showLiveOnly, pocs]);

  const handleFabClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddPoc = () => {
    navigate('/add_poc');
    handleFabMenuClose();
  };

  const handleUpdatePoc = () => {
    navigate('/update_poc');
    handleFabMenuClose();
  };

  const handleOpenStatusDialog = (poc, newStatus) => {
    if (!poc || !poc.mod_poc_id) {
      setError('Invalid POC selected for status update');
      return;
    }
    console.log('Opening status dialog for POC:', poc.mod_poc_name, 'New status:', newStatus);
    setSelectedPocForStatus(poc);
    setStatusChangePending(newStatus);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedPocForStatus(null);
    setStatusChangePending(null);
  };

  const handleToggleCertStatus = async () => {
    if (!selectedPocForStatus || !selectedPocForStatus.mod_poc_id) {
      setError('No valid POC selected for status update');
      handleCloseStatusDialog();
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = {
        mod_poc_id: selectedPocForStatus.mod_poc_id,
        poc_certificate: {
          cert_status: statusChangePending
        }
      };
      console.log('Updating cert_status for POC:', updateData);

      const response = await updatePoc(updateData);
      console.log('POC update response:', response);

      const responsePocs = await fetchAllPocs();
      console.log('Refreshed POCs:', responsePocs.data);
      if (Array.isArray(responsePocs.data)) {
        const pocsWithModuleDetails = await Promise.all(
          responsePocs.data.map(async (poc) => {
            try {
              const module = await getModuleById(poc.mod_id);
              const [startDateStr, endDateStr] = module.mod_duration.split(' - ');
              const startDate = new Date(
                startDateStr.split('/').reverse().join('-')
              );
              const endDate = new Date(
                endDateStr.split('/').reverse().join('-')
              );
              const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              const isLive = todayDate.getTime() === startDateOnly.getTime() ||
                             todayDate.getTime() === endDateOnly.getTime() ||
                             (todayDate >= startDateOnly && todayDate <= endDateOnly);
              return {
                ...poc,
                module_name: module.mod_name,
                module_duration: module.mod_duration,
                status: isLive ? 'Live' : 'Not Live',
              };
            } catch (err) {
              console.error(`Error fetching module for POC ${poc.mod_poc_id}:`, err);
              return {
                ...poc,
                module_name: 'N/A',
                module_duration: 'N/A',
                status: 'Unknown',
              };
            }
          })
        );
        setPocs(pocsWithModuleDetails);
        setFilteredPocs(showLiveOnly ? pocsWithModuleDetails.filter((poc) => poc.status === 'Live') : pocsWithModuleDetails);
        setError(null);
      } else {
        setError('Invalid data format received from server after update');
        setPocs([]);
        setFilteredPocs([]);
      }

      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error updating POC cert_status:', error);
      setError(`Failed to update certificate status: ${error.response?.data?.error || error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns = [
    { field: 'mod_poc_name', headerName: 'Name', width: 150 },
    { field: 'mod_poc_role', headerName: 'Role', width: 100 },
    { field: 'mod_poc_email', headerName: 'Email', width: 200 },
    { field: 'mod_poc_mobile', headerName: 'Mobile', width: 150 },
    { field: 'mod_poc_id', headerName: 'POC ID', width: 200 },
    {
      field: 'poc_certificate',
      headerName: 'Certificate Status',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={params.value?.cert_status ? 'Issued' : 'Not Issued'}
            color={params.value?.cert_status ? 'success' : 'default'}
            size="small"
            sx={{ borderColor: '#0b78b9', color: '#0b78b9' }}
          />
          <Switch
            checked={params.value?.cert_status || false}
            onChange={() => handleOpenStatusDialog(params.row, !params.value?.cert_status)}
            disabled={updateLoading}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#0b78b9',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#0b78b9',
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'module_name',
      headerName: 'Module Name',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'module_duration',
      headerName: 'Module Duration',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: params.value === 'Live' ? 'green' : 'red', fontWeight: 'medium' }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'mod_users',
      headerName: 'No. of Students',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {Array.isArray(params.value) ? params.value.length : 0}
        </Typography>
      ),
    },
    {
      field: 'mod_tests',
      headerName: 'No. of Tests',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {Array.isArray(params.value) ? params.value.length : 0}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: 4,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: '#0b78b9',
              fontSize: { xs: '1.8rem', sm: '2.125rem' },
            }}
          >
            POC Management
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showLiveOnly}
                onChange={(e) => setShowLiveOnly(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#0b78b9',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#0b78b9',
                  },
                }}
              />
            }
            label="Show Live POCs Only"
            sx={{ color: '#333', fontWeight: 'medium' }}
          />
        </Box>
        {error && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#ffebee',
              textAlign: 'center',
            }}
          >
            <Typography color="error" sx={{ fontWeight: 'medium' }}>
              {error}
            </Typography>
          </Paper>
        )}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: '16px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredPocs}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id || row.mod_poc_id}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#0b78b9',
                  color: '#fff',
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
                '& .MuiDataGrid-cell': {
                  padding: '8px',
                  fontSize: '14px',
                },
                border: 'none',
                borderRadius: '12px',
              }}
            />
          </Box>
        </Paper>
        <Fab
          aria-label="add"
          onClick={handleFabClick}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: '#0b78b9',
            '&:hover': {
              backgroundColor: '#095e8f',
            },
          }}
        >
          <AddIcon />
        </Fab>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFabMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '8px 0',
              backgroundColor: '#fff',
            },
          }}
        >
          <MenuItem
            onClick={handleAddPoc}
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
          >
            <Fab
              variant="extended"
              size="small"
              sx={{
                backgroundColor: 'transparent',
                color: '#0b78b9',
                textTransform: 'none',
                fontWeight: 'medium',
                boxShadow: 'none',
                pointerEvents: 'none',
              }}
            >
              <AddIcon sx={{ mr: 1, color: '#0b78b9' }} />
              Add POC
            </Fab>
          </MenuItem>
          <MenuItem
            onClick={handleUpdatePoc}
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
          >
            <Fab
              variant="extended"
              size="small"
              sx={{
                backgroundColor: 'transparent',
                color: '#0b78b9',
                textTransform: 'none',
                fontWeight: 'medium',
                boxShadow: 'none',
                pointerEvents: 'none',
              }}
            >
              <EditIcon sx={{ mr: 1, color: '#0b78b9' }} />
              Update POC
            </Fab>
          </MenuItem>
        </Menu>
        <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#0b78b9', color: 'white', borderBottom: '1px solid #ddd' }}>
            Confirm Certificate Status Change
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ fontSize: '16px' }}>
              {statusChangePending
                ? `Are you sure you want to activate certificate issuance for ${selectedPocForStatus?.mod_poc_name || 'this POC'}?`
                : `Are you sure you want to deactivate certificate issuance for ${selectedPocForStatus?.mod_poc_name || 'this POC'}?`}
            </DialogContentText>
            {selectedPocForStatus && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>POC:</strong> {selectedPocForStatus.mod_poc_name || 'Unknown'} (ID: {selectedPocForStatus.mod_poc_id || 'N/A'})
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseStatusDialog}
              sx={{ color: '#0b78b9' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleCertStatus}
              variant="contained"
              disabled={updateLoading}
              sx={{ backgroundColor: '#0b78b9', '&:hover': { backgroundColor: '#095e8f' } }}
            >
              {updateLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default View_Poc;