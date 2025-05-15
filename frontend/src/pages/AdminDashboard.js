import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  InputBase, 
  IconButton, 
  Avatar, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  CardActions, 
  Chip,
  AppBar,
  Toolbar,
  Container,
  Badge
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Person,
  Code,
  MenuBook,
  Business,
  School,
  AccountCircle,
  Quiz,
  BugReport,
  Add,
  Visibility,
  Edit,
  Search,
  Notifications,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import Admin_Dashboard from '../components/Admin_dash.js';

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
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const CardIconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  backgroundColor: color || theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
}));

// Main Dashboard Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const actionTypes = ['All', 'View', 'Add', 'Update'];
  
  // Get appropriate icon for each item
  const getIcon = (label) => {
    switch(label.toLowerCase()) {
      case 'poc': return <AccountCircle fontSize="large" />;
      case 'user': return <Person fontSize="large" />;
      case 'coding': return <Code fontSize="large" />;
      case 'testcase': return <BugReport fontSize="large" />;
      case 'module': 
      case 'test module': return <MenuBook fontSize="large" />;
      case 'organization':
      case 'organisation': return <Business fontSize="large" />;
      case 'expert': return <School fontSize="large" />;
      case 'mcq': return <Quiz fontSize="large" />;
      case 'test': return <BugReport fontSize="large" />;
      default: return <DashboardIcon fontSize="large" />;
    }
  };

  // Get color for cards based on label
  const getColor = (label) => {
    switch(label.toLowerCase()) {
      case 'poc': return '#1976d2'; // blue
      case 'user': return '#9c27b0'; // purple
      case 'coding': return '#2e7d32'; // green
      case 'testcase': return '#ff9800'; // amber
      case 'module': 
      case 'test module': return '#d32f2f'; // red
      case 'organization':
      case 'organisation': return '#3f51b5'; // indigo
      case 'expert': return '#009688'; // teal
      case 'mcq': return '#e91e63'; // pink
      case 'test': return '#ffc107'; // yellow
      default: return '#607d8b'; // blue-grey
    }
  };
  
  // Get description for each item
  const getDescription = (label, type) => {
    const action = type === 'View' ? 'Access and view' : 
                  type === 'Add' ? 'Create new' : 'Modify existing';
    
    switch(label.toLowerCase()) {
      case 'poc': return `${action} point of contact information`;
      case 'user': return `${action} user accounts`;
      case 'coding': return `${action} programming challenges`;
      case 'testcase': return `${action} test scenarios and cases`;
      case 'module': return `${action} learning modules`;
      case 'test module': return `${action} test module configurations`;
      case 'organization':
      case 'organisation': return `${action} organizations`;
      case 'expert': return `${action} domain experts`;
      case 'mcq': return `${action} multiple choice questions`;
      case 'test': return `${action} assessment tests`;
      default: return `${action} ${label}`;
    }
  };

  // Get icon for action type
  const getActionIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'view': return <Visibility />;
      case 'add': return <Add />;
      case 'update': return <Edit />;
      default: return null;
    }
  };

  // Original buttons data with Add User added
  const allButtons = [
    { label: 'POC', path: '/poc', type: 'View' },
    { label: 'User', path: '/user', type: 'View' },
    { label: 'Coding', path: '/codingpage', type: 'View' },
    { label: 'Testcase', path: '/testcasepage', type: 'View' },
    { label: 'Module', path: '/module', type: 'View' },
    { label: 'Organization', path: '/organization', type: 'View' },
    { label: 'Expert', path: '/expert', type: 'View' },
    { label: 'MCQ', path: '/mcq-admin', type: 'View' },
    { label: 'Test', path: '/test', type: 'View' },
  
    // ADD action items
    { label: 'MCQ', path: '/add_mcq', type: 'Add' },
    { label: 'Module', path: '/add_module', type: 'Add' },
    { label: 'Organisation', path: '/add_organisation', type: 'Add' },
    { label: 'TestCase', path: '/add_testcase', type: 'Add' },
    { label: 'Coding', path: '/add_coding', type: 'Add' },
    { label: 'POC', path: '/add_poc', type: 'Add' },
    { label: 'Expert', path: '/add_expert', type: 'Add' },
    { label: 'User', path: '/add_user', type: 'Add' }, // New Add User action
  
    // UPDATE action items
    { label: 'Coding', path: '/update_coding', type: 'Update' },
    { label: 'Test Module', path: '/update_testmodule', type: 'Update' },
    { label: 'POC', path: '/update_poc', type: 'Update' },
    { label: 'Expert', path: '/update_expert', type: 'Update' },
    { label: 'Organization', path: '/update_organization', type: 'Update' }, 
  ];
  

  // Filter items based on search and active tab
  const filteredButtons = allButtons.filter(button => {
    const matchesSearch = button.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          getDescription(button.label, button.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 0 || actionTypes[activeTab] === button.type;
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
   <Admin_Dashboard />
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
                icon={index > 0 ? getActionIcon(type) : <DashboardIcon />} 
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {/* Dashboard grid */}
        <Grid container spacing={4}>
          {filteredButtons.map((button, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`${button.type}-${button.label}-${index}`} >
              <DashboardCard>
                <CardIconWrapper color={getColor(button.label)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {getIcon(button.label)}
                    <Chip 
                      icon={getActionIcon(button.type)} 
                      label={button.type} 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '& .MuiChip-icon': { color: 'white' } 
                      }}
                    />
                  </Box>
                </CardIconWrapper>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {button.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getDescription(button.label, button.type)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <ActionButton 
                    variant="contained" 
                    fullWidth
                    onClick={() => handleNavigation(button.path)}
                    sx={{ bgcolor: getColor(button.label) ,borderRadius:3}}
                  >
                    {button.type === 'View' ? 'View Details' : button.type === 'Add' ? 'Create New' : 'Modify'}
                  </ActionButton>
                </CardActions>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
        
        {filteredButtons.length === 0 && (
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