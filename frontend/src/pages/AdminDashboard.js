import React, { useState } from 'react';
import { Grid2, Button, Typography, Box, Stack } from '@mui/material';
import {
  Person,
  Code,
  LibraryBooks,
  Business,
  School,
  ContactPhone,
  Quiz,
  BugReport,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Custom styled dashboard button
const CustomButton = styled(Button)(({ theme }) => ({
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '16px',
  textTransform: 'none',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  '& .MuiButton-startIcon': {
    fontSize: '48px',
    marginBottom: theme.spacing(2),
  },
}));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('view'); // 'view' or 'post'

  const handleNavigation = (path) => {
    navigate(path);
  };

  const viewButtons = [
    { label: 'POC', icon: <ContactPhone />, path: '/poc' },
    { label: 'User', icon: <Person />, path: '/user' },
    { label: 'Coding', icon: <Code />, path: '/coding' },
    { label: 'Module', icon: <LibraryBooks />, path: '/module' },
    { label: 'Organization', icon: <Business />, path: '/organization' },
    { label: 'Expert', icon: <School />, path: '/expert' },
    { label: 'MCQ', icon: <Quiz />, path: '/mcq-admin' },
    { label: 'Test', icon: <BugReport />, path: '/test' },
  ];

  const postButtons = [
    { label: 'Add MCQ', icon: <BugReport />, path: '/add_mcq' },
    { label: 'Add Module', icon: <BugReport />, path: '/add_module' },
    { label: 'Add Organisation', icon: <BugReport />, path: '/add_organisation' },
    { label: 'Add TestCase', icon: <BugReport />, path: '/add_testcase' },
    { label: 'Add Coding', icon: <BugReport />, path: '/add_coding' },
    { label: 'Add POC', icon: <BugReport />, path: '/add_poc' },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      {/* Toggle View/Post Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
        <Button
          variant={viewMode === 'view' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('view')}
        >
          View Details
        </Button>
        <Button
          variant={viewMode === 'post' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('post')}
        >
          Post Details
        </Button>
      </Stack>

      {/* Dashboard Buttons */}
      <Grid2 container spacing={4} justifyContent="center">
        {(viewMode === 'view' ? viewButtons : postButtons).map((button, index) => (
          <Grid2 item xs={12} sm={6} md={4} key={`${button.label}-${index}`}>
            <CustomButton
              variant="contained"
              startIcon={button.icon}
              onClick={() => handleNavigation(button.path)}
              fullWidth
            >
              <Typography variant="h6">{button.label}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {viewMode === 'view' ? `View ${button.label}` : `Add ${button.label.split(' ')[1]}`}
              </Typography>
            </CustomButton>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default AdminDashboard;