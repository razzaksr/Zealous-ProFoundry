import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Clock, CheckCircle, Book, Code } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Dash from "../components/dash";
import TestModule from "../pages/TestModules";

const LandingPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [coordinatorName, setCoordinatorName] = useState("Loading...");
  const [modId, setModId] = useState(null);
  const [expertName, setExpertName] = useState("Loading...");
  const [moduleName, setModuleName] = useState("Loading...");
  const [orgName, setOrgName] = useState("Loading...");
  const [testIds, setTestIds] = useState([]);
  
  const navigate = useNavigate(); // Initialize useNavigate hook

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("User from session:", user);
        if (user && user.user && user.user.user_id) {
          fetchModuleAndPoc(user.user.user_id);
        } else {
          console.warn("User ID not found in session storage");
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
      }
    } else {
      console.warn("No user found in session storage");
    }
  }, []);

  const fetchModuleAndPoc = async (userId) => {
    try {
        const response = await axios.get(
            `http://localhost:4000/poc_gateway/poc/mod_and_poc/${userId}`
        );
        
        const fetchedData = response.data;

        // Store values in separate variables
        const coordinatorName = fetchedData.mod_poc_name || "Not Found";
        const modId = fetchedData.mod_id;
        const modPocId = fetchedData.mod_poc_id;
        const testIds = fetchedData.test_ids || []; // Ensure testIds is always an array

        console.log("Fetched Data:", fetchedData);
        console.log("Coordinator Name:", coordinatorName);
        console.log("Module ID:", modId);
        console.log("Module POC ID:", modPocId);
        console.log("Test IDs:", testIds);

        // Set state values if needed
        setCoordinatorName(coordinatorName);
        setModId(modId);
        setTestIds(testIds); 

        if (modId) {
            fetchExpertName(modId);
            fetchModuleName(modId);
            fetchOrgName(modId); 
        }
    } catch (error) {
        console.error("Error fetching module data:", error);
        setCoordinatorName("Not Found");
    }
};

  const fetchExpertName = async (modId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/expert_gateway/expert/get_expert_name/${modId}`
      );
      setExpertName(response.data.mod_expert_name || "Not Found");
    } catch (error) {
      console.error("Error fetching expert name:", error);
      setExpertName("Not Found");
    }
  };

  const fetchModuleName = async (modId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/modules_gateway/modules/get_module_name_by_id/${modId}`
      );
      setModuleName(response.data.mod_name || "Not Found");
    } catch (error) {
      console.error("Error fetching module name:", error);
      setModuleName("Not Found");
    }
  };

  const fetchOrgName = async (modId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/organization_gateway/organization/get_org_name_by_id/${modId}`
      );
      setOrgName(response.data.org_name || "Not Found");
    } catch (error) {
      console.error("Error fetching organisation name:", error);
      setOrgName("Not Found");
    }
  };

  const stats = [
    { icon: <Clock size={28} />, label: "ORGANISATION", value: orgName, color: "#D6E4FF" },
    { icon: <CheckCircle size={28} />, label: "MODULE", value: moduleName, color: "#DFFFD6" },
    { icon: <Book size={28} />, label: "EXPERT", value: expertName, color: "#F5E6FF" },
    { icon: <Code size={28} />, label: "CO-ORDINATOR", value: coordinatorName, color: "#FFE4D6" },
  ];

  const handleTestModuleClick = () => {
    // Pass the necessary data to the TestModules component using navigate
    navigate(`/testmodule/${modId}`, {
      state: {
        modId,
        modPocId: "3fcfeeae-653a-410c-b54c-4030210b0c15", // Example POC ID
        modPocName: coordinatorName,
        testIds,
      },
    });
  };

  return (
    <>
      <Dash />
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "#F5F5F5" }}>
        <AppBar position="fixed" sx={{ display: { sm: "none" }, bgcolor: "#121826" }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Selvarasan's Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, padding: { xs: 2, sm: 3 }, mt: { xs: 7, sm: 0 }, overflowY: "auto" }}>
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    bgcolor: stat.color,
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  {stat.icon}
                  <Box>
                    <Typography variant="body2" sx={{ color: "#333" }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, ml: { xs: 0, sm: 1 }, transition: "margin-left 0.3s ease-in-out" }}>
            <TestModule onClick={handleTestModuleClick} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LandingPage;
