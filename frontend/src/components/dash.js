import { useState, useEffect } from "react";
import Image from "../assests/Zealous.png";
import { Menu as MenuIcon, AccountCircle, ExitToApp } from "@mui/icons-material";
import { Avatar, IconButton, Menu, MenuItem, Typography, AppBar, Toolbar, Box } from "@mui/material";

export default function DashboardHeader() {
  const [userName, setUserName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Get user from session storage
    const storedData = sessionStorage.getItem("true");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.user && parsedData.user.full_name) {
          setUserName(parsedData.user.full_name);
        }
      } catch (error) {
        console.error("Error parsing session data:", error);
      }
    }
  }, []);

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {  
    sessionStorage.clear();
    window.location.assign('/');
    handleMenuClose();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#ffff",borderRadius: "36px" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Box display="flex" alignItems="center">
        <img src={Image} alt="Zealous Logo" width={150} height={67} />
                </Box>

        {/* User Menu */}
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
            <Avatar sx={{ bgcolor: "#0b78b9" }}>{getInitials(userName)}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled>
              <AccountCircle sx={{ mr: 1 }} />
              <Typography>{userName || "User"}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1, color: "#fc7a46" }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
