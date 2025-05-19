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
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllTests, fetchAllMcqs } from '../axios'; // Assuming these are in your axios file
import axios from 'axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import Admin_Dashboard from '../components/AdminDash';

const UpdateTestModule = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tests, setTests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState({ tests: true, codes: true, mcqs: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch data for all sections
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetchAllTests();
        setTests(response.data);
        setLoading(prev => ({ ...prev, tests: false }));
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(prev => ({ ...prev, tests: false }));
      }
    };

    const fetchCodes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/coding/get_allCodes');
        const formattedRows = response.data.codes.map(item => ({
          id: item._id,
          code_id: item.code_id,
          problem: item.code_problem_statement,
          testCases: (item.code_test_cases_id || []).join(', '),
          tags: (item.code_tags || []).join(', '),
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString(),
        }));
        setCodes(formattedRows);
        setLoading(prev => ({ ...prev, codes: false }));
      } catch (error) {
        console.error('Error fetching codes:', error);
        setLoading(prev => ({ ...prev, codes: false }));
      }
    };

    const fetchMcqs = async () => {
      try {
        const response = await fetchAllMcqs();
        setMcqs(response.data);
        setLoading(prev => ({ ...prev, mcqs: false }));
      } catch (error) {
        console.error('Error fetching MCQs:', error);
        setLoading(prev => ({ ...prev, mcqs: false }));
      }
    };

    fetchTests();
    fetchCodes();
    fetchMcqs();
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarOpen(true);
        setTimeout(() => setSnackbarOpen(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleViewDetails = (title, items) => {
    setDialogTitle(title);
    setDialogContent(items);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Test Columns
  const testColumns = [
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
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', blackSpace: 'nowrap', maxWidth: 'calc(100% - 30px)' }}>
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

  // Code Columns
  const codeColumns = [
    { field: 'code_id', headerName: 'Code ID', width: 200 },
    { field: 'problem', headerName: 'Problem Statement', width: 300 },
    { field: 'testCases', headerName: 'Test Cases ID', width: 250 },
    { field: 'tags', headerName: 'Tags', width: 200 },
    { field: 'createdAt', headerName: 'Created At', width: 180 },
    { field: 'updatedAt', headerName: 'Updated At', width: 180 },
  ];

  // MCQ Columns
  const mcqColumns = [
    { field: 'mcq_question', headerName: 'Question', width: 300 },
    { 
      field: 'mcq_options', 
      headerName: 'Options', 
      width: 250, 
      valueGetter: (params) => (params.value && Array.isArray(params.value) ? params.value.join(', ') : 'None') 
    },
    { field: 'mcq_answer', headerName: 'Answer', width: 150 },
    { 
      field: 'mcq_tag', 
      headerName: 'Tags', 
      width: 200, 
      valueGetter: (params) => (params.value && Array.isArray(params.value) ? params.value.join(', ') : 'None') 
    },
    { field: 'mcq_id', headerName: 'MCQ ID', width: 250 },
  ];

  return (
  <>
  <Admin_Dashboard />
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Test Management Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered sx={{ mb: 3 }}>
        <Tab label="Tests" />
        <Tab label="Coding Problems" />
        <Tab label="MCQs" />
      </Tabs>

      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          {activeTab === 0 && (
            <DataGrid
              rows={tests}
              columns={testColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.tests}
              getRowId={(row) => row._id}
              sx={{
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'black', fontWeight: 'bold', fontSize: '16px' },
                '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                borderRadius: '12px',
              }}
            />
          )}
          {activeTab === 1 && (
            <DataGrid
              rows={codes}
              columns={codeColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.codes}
              getRowId={(row) => row.id}
              sx={{
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'black', fontWeight: 'bold', fontSize: '16px' },
                '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                borderRadius: '12px',
              }}
            />
          )}
          {activeTab === 2 && (
            <DataGrid
              rows={mcqs}
              columns={mcqColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading.mcqs}
              getRowId={(row) => row._id}
              sx={{
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'black', fontWeight: 'bold', fontSize: '16px' },
                '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                borderRadius: '12px',
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Dialog for showing MCQ or Coding IDs */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          {dialogTitle}
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ maxHeight: '400px', overflow: 'auto', fontFamily: 'monospace', backgroundColor: '#f9f9f9', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
            {dialogContent.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: index < dialogContent.length - 1 ? '1px solid #eee' : 'none', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                <Typography variant="body2">{item}</Typography>
                <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="textSecondary">{dialogContent.length} items</Typography>
          <Box>
            <Button onClick={() => handleCopyToClipboard(dialogContent.join('\n'))} variant="outlined" startIcon={<ContentCopyIcon />} sx={{ mr: 1 }}>
              Copy All
            </Button>
            <Button onClick={handleCloseDialog} variant="contained">Close</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification */}
      {snackbarOpen && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: 'rgba(0, 150, 0, 0.9)', color: 'black', padding: '8px 16px', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 9999 }}>
          Copied to clipboard!
        </Box>
      )}
    </Box>
  </>
  );
};

export default UpdateTestModule;