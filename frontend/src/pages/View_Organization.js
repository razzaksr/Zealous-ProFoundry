import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllOrganizations } from '../axios';
import Admin_Dashboard from '../components/AdminDash';

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const response = await fetchAllOrganizations();
        setOrganizations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setLoading(false);
      }
    };
    getOrganizations();
  }, []);

  const columns = [
    { field: 'org_name', headerName: 'Organization Name', width: 250 },
    { field: 'org_address', headerName: 'Address', width: 150 },
    { field: 'org_email', headerName: 'Email', width: 200 },
    { field: 'org_contact', headerName: 'Contact', width: 150 },
    { 
      field: 'org_associated_date', 
      headerName: 'Associated Date', 
      width: 200, 
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() 
    },
    { field: 'org_id', headerName: 'Organization ID', width: 250 },
  ];

  return (
   <>
   <Admin_Dashboard />
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Organization Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={organizations}
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

export default OrganizationPage;