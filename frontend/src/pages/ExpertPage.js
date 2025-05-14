import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllExperts } from '../axios';
import Admin_Dashboard from '../components/Admin_dash';

const ExpertPage = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getExperts = async () => {
      try {
        const response = await fetchAllExperts();
        setExperts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching experts:', error);
        setLoading(false);
      }
    };
    getExperts();
  }, []);

  const columns = [
    { field: 'mod_expert_name', headerName: 'Expert Name', width: 200 },
    { field: 'mod_expert_role', headerName: 'Role', width: 150 },
    { field: 'mod_expert_mobile', headerName: 'Mobile', width: 150 },
    { field: 'mod_expert_id', headerName: 'Expert ID', width: 250 },
    { 
      field: 'mod_id', 
      headerName: 'Module IDs', 
      width: 250, 
      valueGetter: (params) => (params.value && Array.isArray(params.value) ? params.value.join(', ') : 'None') 
    },
    { 
      field: 'poc_id', 
      headerName: 'POC IDs', 
      width: 250, 
      valueGetter: (params) => (params.value && Array.isArray(params.value) ? params.value.join(', ') : 'None') 
    },
  ];

  return (
   <>
   <Admin_Dashboard />
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Expert Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={experts}
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
   </>
  );
};

export default ExpertPage;