import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllModules } from '../axios';
import Admin_Dashboard from '../components/AdminDash';

const ModulePage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        console.log('Full API Response:', response); // Log entire response for debugging
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            console.log('Fetched modules:', response.data);
            setModules(response.data);
          } else {
            console.error('Expected an array, got:', response.data);
            setError('Invalid data format received from server');
            setModules([]);
          }
        } else {
          console.error('Response or response.data is undefined:', response);
          setError('No data received from server');
          setModules([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching modules:', error.message, error.response || error);
        setError('Failed to fetch modules: ' + (error.message || 'Unknown error'));
        setModules([]);
        setLoading(false);
      }
    };
    getModules();
  }, []);

  // Columns updated to match the API response fields
  const columns = [
    { field: 'mod_name', headerName: 'Module Name', width: 200 },
    { field: 'mod_tech', headerName: 'Technology', width: 150 },
    { field: 'mod_duration', headerName: 'Duration', width: 200 },
    { field: 'mod_id', headerName: 'Module ID', width: 250 },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Admin_Dashboard wrapper */}
      <Box sx={{ position: 'relative', zIndex: 1200 }}>
        <Admin_Dashboard />
      </Box>
      {/* Main content */}
      <Box
        sx={{
          padding: 4,
          backgroundColor: '#f5f5f5',
          flexGrow: 1,
          mt: 10, // Increased to account for AppBar height (67px) + extra space
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 4, fontWeight: 'bold', mt: 2 }}
        >
          Module Management
        </Typography>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ height: 'auto', width: '100%' }}>
            <DataGrid
              rows={modules}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id} // Use _id as it's present in the data
              autoHeight
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#1565c0',
                  color: 'black',
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
    </Box>
  );
};

export default ModulePage;