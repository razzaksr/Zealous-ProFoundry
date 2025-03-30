import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Logo from "../assests/Zealous.png";

const Dash = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user from session storage
    const storedData = sessionStorage.getItem("true"); // Retrieve stored data
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData); // Parse JSON
        if (parsedData.user && parsedData.user.full_name) {
          setUserName(parsedData.user.full_name); // Set full_name correctly
        }
      } catch (error) {
        console.error("Error parsing session data:", error);
      }
    }
  }, []);
  

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget); 
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "white",
          borderRadius: "15px",
          margin: "10px",
          padding: "5px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar sx={{ minHeight: "56px", display: "flex", justifyContent: "space-between" }}>
          {/* Left-aligned Logo */}
          <img src={Logo} alt="Logo" style={{ width: "150px", height: "80px" }} />

          {/* Right-aligned User */}
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="primary"
            >
              <AccountCircle />
            </IconButton>
            <Menu
  id="menu-appbar"
  anchorEl={anchorEl}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
  keepMounted
  transformOrigin={{ vertical: "top", horizontal: "right" }}
  open={Boolean(anchorEl)}
  onClose={handleClose}
>
  <MenuItem onClick={handleClose}>{userName || "User"}</MenuItem> {/* Display full name */}
  <MenuItem onClick={handleClose}>Logout</MenuItem>
</Menu>

          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Dash;
