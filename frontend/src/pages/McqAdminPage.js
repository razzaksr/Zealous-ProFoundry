import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllMcqs } from '../axios';
import Admin_Dashboard from '../components/Admin_dash';

const McqAdminPage = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMcqs = async () => {
      try {
        const response = await fetchAllMcqs();
        setMcqs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching MCQs:', error);
        setLoading(false);
      }
    };
    getMcqs();
  }, []);

  const columns = [
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
        MCQ Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={mcqs}
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

export default McqAdminPage;