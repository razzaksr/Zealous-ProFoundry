import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs } from '../axios';

const PocPage = () => {
  const [pocs, setPocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        setPocs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching POCs:', error);
        setLoading(false);
      }
    };
    getPocs();
  }, []);

  const columns = [
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
          {params.value.map((test, index) => (
            <Typography key={index} variant="body2">
              {`Test ID: ${test.test_id}, Assigned: ${test.assigned_date}`}
            </Typography>
          ))}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        POC Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={pocs}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#1565c0', // Darker blue for better contrast
                color: 'black', // White text for visibility
                fontWeight: 'bold',
                fontSize: '16px', // Slightly larger text for clarity
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

export default PocPage;