import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  InputBase, 
  Container,
  Tabs, 
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Add,
  Visibility,
  Edit,
  Search,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import AdminDash from '../components/AdminDash';

// Custom styled components
const StyledSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '0.75rem',
  boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-0.5rem)',
    boxShadow: '0 1rem 2rem rgba(0, 0, 0, 0.15)',
  },
}));

const CardHeaderCustom = styled(Box)(({ theme, color }) => ({
  backgroundColor: color,
  color: '#ffffff',
  padding: '1.5rem',
  textAlign: 'center',
  borderRadius: '0.75rem 0.75rem 0 0',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '4rem',
  height: '4rem',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem',
  '& i': {
    fontSize: '1.5rem',
    color: '#ffffff',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '0.5rem',
  padding: '0.75rem 1.25rem',
  display: 'flex',
  alignItems: 'center',
  textTransform: 'none',
  fontWeight: 600,
  color: '#333',
  justifyContent: 'space-between',
  transition: 'background-color 0.2s, color 0.2s, transform 0.2s',
  '&:hover': {
    backgroundColor: ({ color }) => 
      color === '#0c83c8' ? '#fc7a46' : color === '#fc7a46' ? '#0c83c8' : color,
    color: ({ color }) => 
      color === '#0c83c8' ? '#0c83c8' : color === '#fc7a46' ? '#fc7a46' : '#333',
    transform: 'translateX(0.5rem)',
    '& i': {
      color: ({ color }) => 
        color === '#0c83c8' ? '#0c83c8' : color === '#fc7a46' ? '#fc7a46' : '#333',
    },
  },
  '& i:first-child': {
    marginRight: '0.75rem',
  },
  '& .action-arrow': {
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  '&:hover .action-arrow': {
    opacity: 1,
  },
}));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const actionTypes = ['All', 'View', 'Add', 'Update'];

  // Routes from Admin_Dash
  const menuItems = [
    {
      text: 'POC',
      icon: 'fas fa-clipboard-list',
      color: '#0c83c8',
      routes: [
        { text: 'View POC', path: '/poc', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add POC', path: '/add_poc', icon: 'fas fa-plus', type: 'Add' },
        { text: 'Update POC', path: '/update_poc', icon: 'fas fa-edit', type: 'Update' },
      ],
    },
    {
      text: 'Organization',
      icon: 'fas fa-building',
      color: '#fc7a46',
      routes: [
        { text: 'View Organization', path: '/organization', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add Organization', path: '/add_organisation', icon: 'fas fa-plus', type: 'Add' },
        { text: 'Update Organization', path: '/update_organization', icon: 'fas fa-edit', type: 'Update' },
      ],
    },
    {
      text: 'Module',
      icon: 'fas fa-book',
      color: '#0c83c8',
      routes: [
        { text: 'View Module', path: '/module', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add Module', path: '/add_module', icon: 'fas fa-plus', type: 'Add' },
        { text: 'Update Module', path: '/update_testmodule', icon: 'fas fa-edit', type: 'Update' },
      ],
    },
    {
      text: 'Test',
      icon: 'fas fa-question-circle',
      color: '#fc7a46',
      routes: [
        { text: 'View Test', path: '/test', icon: 'fas fa-eye', type: 'View' },
      ],
    },
    {
      text: 'User',
      icon: 'fas fa-user',
      color: '#0c83c8',
      routes: [
        { text: 'View User', path: '/user', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add User', path: '/add_user', icon: 'fas fa-plus', type: 'Add' },
      ],
    },
    {
      text: 'Expert',
      icon: 'fas fa-users',
      color: '#fc7a46',
      routes: [
        { text: 'View Expert', path: '/expert', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add Expert', path: '/add_expert', icon: 'fas fa-plus', type: 'Add' },
        { text: 'Update Expert', path: '/update_expert', icon: 'fas fa-edit', type: 'Update' },
      ],
    },
    {
      text: 'MCQ',
      icon: 'fas fa-question-circle',
      color: '#0c83c8',
      routes: [
        { text: 'View MCQ', path: '/mcq-admin', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add MCQ', path: '/add_mcq', icon: 'fas fa-plus', type: 'Add' },
      ],
    },
    {
      text: 'Coding',
      icon: 'fas fa-code',
      color: '#fc7a46',
      routes: [
        { text: 'View Coding', path: '/codingpage', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add Coding', path: '/add_coding', icon: 'fas fa-plus', type: 'Add' },
        { text: 'Update Coding', path: '/update_coding', icon: 'fas fa-edit', type: 'Update' },
      ],
    },
    {
      text: 'Testcase',
      icon: 'fas fa-bug',
      color: '#0c83c8',
      routes: [
        { text: 'View Testcase', path: '/testcasepage', icon: 'fas fa-eye', type: 'View' },
        { text: 'Add Testcase', path: '/add_testcase', icon: 'fas fa-plus', type: 'Add' },
      ],
    },
  ];

  // Filter items based on search and active tab
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = 
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.routes.some(route => 
        route.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesTab = 
      activeTab === 0 || 
      item.routes.some(route => actionTypes[activeTab] === route.type);
    return matchesSearch && matchesTab;
  });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <AdminDash />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Tabs for filtering */}
          <Paper sx={{ mb: 4 }}>
            <StyledSearch>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search actions…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </StyledSearch>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              {actionTypes.map((type, index) => (
                <Tab 
                  key={type} 
                  label={type} 
                  icon={
                    index > 0 ? (
                      type === 'View' ? <Visibility /> :
                      type === 'Add' ? <Add /> :
                      type === 'Update' ? <Edit /> : null
                    ) : <DashboardIcon />
                  } 
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>

          {/* Dashboard grid */}
          <Grid container spacing={4}>
            {filteredMenuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`${item.text}-${index}`}>
                <DashboardCard>
                  <CardHeaderCustom color={item.color}>
                    <IconWrapper>
                      <i className={item.icon}></i>
                    </IconWrapper>
                    <Typography variant="h5" component="h2">
                      {item.text}
                    </Typography>
                  </CardHeaderCustom>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {item.routes.map((route) => (
                        (activeTab === 0 || route.type === actionTypes[activeTab]) && (
                          <ActionButton
                            key={route.text}
                            fullWidth
                            onClick={() => handleNavigation(route.path)}
                            color={item.color}
                          >
                            <i className={route.icon}></i>
                            <span>{route.text}</span>
                            <i className="fas fa-arrow-right action-arrow"></i>
                          </ActionButton>
                        )
                      ))}
                    </Box>
                  </CardContent>
                </DashboardCard>
              </Grid>
            ))}
          </Grid>
          
          {filteredMenuItems.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No dashboard items match your search.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}