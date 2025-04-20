import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllTests } from '../axios';

const TestAdminPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTests = async () => {
      try {
        const response = await fetchAllTests();
        setTests(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
      }
    };
    getTests();
  }, []);

  const columns = [
    { field: 'test_name', headerName: 'Test Name', width: 200 },
    { field: 'test_language', headerName: 'Language', width: 150 },
    { field: 'test_total_score', headerName: 'Total Score', width: 120 },
    { 
      field: 'test_mcq_id', 
      headerName: 'MCQ IDs', 
      width: 250, 
      valueGetter: (params) => (params.value && Array.isArray(params.value) ? params.value.join(', ') : 'None') 
    },
    { 
      field: 'test_coding_id', 
      headerName: 'Coding IDs', 
      width: 250, 
      valueGetter: (params) => (params.value && Array.isArray(params.value) ? params.value.join(', ') : 'None') 
    },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'test_id', headerName: 'Test ID', width: 250 },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Test Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={tests}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#1565c0', // Dark blue header
                color: 'black', // White text for visibility
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
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TestAdminPage;