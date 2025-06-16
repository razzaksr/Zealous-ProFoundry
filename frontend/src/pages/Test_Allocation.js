import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { fetchAllPocs, fetchAllTests } from '../axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import axios from 'axios';

const PocAndTestDataGrids = () => {
  // State for data
  const [pocs, setPocs] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState({
    pocs: true,
    tests: true,
  });
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPoc, setSelectedPoc] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [assignedDate, setAssignedDate] = useState(null);

  // Fetch POCs data
  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        setPocs(response.data);
        setLoading((prev) => ({ ...prev, pocs: false }));
      } catch (error) {
        console.error('Error fetching POCs:', error);
        setLoading((prev) => ({ ...prev, pocs: false }));
      }
    };
    getPocs();
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
        setLoading((prev) => ({ ...prev, tests: false }));
      } catch (error) {
        console.error('Error fetching tests:', error);
        setTests([]);
        setLoading((prev) => ({ ...prev, tests: false }));
      }
    };
    fetchTestsData();
  }, []);

  // Handle copy to clipboard
  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  // Handle opening details dialog
  const handleViewDetails = (title, items) => {
    setDetailsDialogTitle(title);
    setDetailsDialogContent(items);
    setDetailsDialogOpen(true);
  };

  // Handle update POC tests
  const handleUpdatePocTests = async () => {
    if (!selectedPoc || !assignedDate || selectedTests.length === 0) {
      alert('Please select a POC, at least one test, and an assigned date.');
      return;
    }

    const formattedDate = format(assignedDate, 'dd/MM/yyyy');
    const testData = selectedTests.map((test) => ({
      test_id: test.test_id,
      assigned_date: formattedDate,
    }));

    try {
      const response = await axios.put('http://localhost:8084/poc/update_poc', {
        mod_poc_id: selectedPoc.mod_poc_id,
        mod_tests: testData,
      });

      // Update local state with the new POC data
      setPocs((prevPocs) =>
        prevPocs.map((poc) =>
          poc.mod_poc_id === selectedPoc.mod_poc_id ? response.data : poc
        )
      );
      setUpdateDialogOpen(false);
      setSelectedPoc(null);
      setSelectedTests([]);
      setAssignedDate(null);
      alert('POC tests updated successfully!');
    } catch (error) {
      console.error('Error updating POC tests:', error);
      alert('Failed to update POC tests: ' + error.message);
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
          {params.value && params.value.map ? (
            params.value.map((test, index) => (
              <Typography key={index} variant="body2">
                Test ID: {test.test_id}, Assigned: {test.assigned_date}
              </Typography>
            ))
          ) : (
            <Typography variant="body2">No tests</Typography>
          )}
        </Box>
      ),
    },
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
              <IconButton
                size="small"
                onClick={() => handleViewDetails(`MCQ IDs for ${params.row.test_name}`, params.value)}
              >
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
      },
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
              <IconButton
                size="small"
                onClick={() => handleViewDetails(`Coding IDs for ${params.row.test_name}`, params.value)}
              >
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
      },
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
      ),
    },
    {
      field: 'test_id',
      headerName: 'Test ID',
      width: 300,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Tooltip title={params.value}>
            <Typography
              variant="body2"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 30px)' }}
            >
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
      {/* POC Management */}
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          POC Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => setUpdateDialogOpen(true)}
        >
          Update POC Tests
        </Button>
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
                if (newSelection.length > 0) {
                  setSelectedPocIds([newSelection[newSelection.length - 1]]);
                  setSelectedPoc(pocs.find((poc) => poc._id === newSelection[newSelection.length - 1]));
                } else {
                  setSelectedPocIds([]);
                  setSelectedPoc(null);
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tests
          </Typography>
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
                setSelectedTests(tests.filter((test) => newSelection.includes(test._id)));
              }}
              autoHeight
              sx={dataGridSx}
            />
          </Box>
        </Paper>
      </Box>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)}>
        <DialogTitle>{detailsDialogTitle}</DialogTitle>
        <DialogContent>
          {detailsDialogContent.map((item, index) => (
            <Typography key={index} variant="body2">
              {item}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update POC Tests Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
        <DialogTitle>Update POC Tests</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Autocomplete
              options={pocs}
              getOptionLabel={(option) => option.mod_poc_name || ''}
              value={selectedPoc}
              onChange={(event, newValue) => setSelectedPoc(newValue)}
              renderInput={(params) => <TextField {...params} label="Select POC" />}
            />
            <Autocomplete
              multiple
              options={tests}
              getOptionLabel={(option) => option.test_name || ''}
              value={selectedTests}
              onChange={(event, newValue) => setSelectedTests(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Tests" />}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Assigned Date"
                value={assignedDate}
                onChange={(newValue) => setAssignedDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdatePocTests} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PocAndTestDataGrids;