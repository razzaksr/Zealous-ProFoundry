import React from 'react';
import { Grid, Button, Typography, Box } from '@mui/material';
import { 
  Person, 
  Code, 
  LibraryBooks, 
  Business, 
  School, 
  ContactPhone, 
  Quiz, 
  BugReport 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Custom styled button
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

  const handleNavigation = (path) => {
    navigate(path);
  };

  const buttons = [
    { label: 'POC', icon: <ContactPhone />, path: '/poc' },
    { label: 'User', icon: <Person />, path: '/user' },
    { label: 'Coding', icon: <Code />, path: '/coding' },
    { label: 'Module', icon: <LibraryBooks />, path: '/module' },
    { label: 'Organization', icon: <Business />, path: '/organization' },
    { label: 'Expert', icon: <School />, path: '/expert' },
    { label: 'MCQ', icon: <Quiz />, path: '/mcq-admin' },
    { label: 'Test', icon: <BugReport />, path: '/test' },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {buttons.map((button, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${button.label}-${index}`}>
            <CustomButton
              variant="contained"
              startIcon={button.icon}
              onClick={() => handleNavigation(button.path)}
              fullWidth
            >
              <Typography variant="h6">{button.label}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Manage {button.label.toLowerCase()} settings
              </Typography>
            </CustomButton>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;