import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  AppBar,
  Toolbar,
  Box,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import Image from "../assests/Zealous.png";
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Download,
} from "@mui/icons-material";
import CertificateGenerator from "./certificate";
import { getResultsByUserId } from "../axios";

export default function Admin_Dashboard() {
  const [userName, setUserName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [userId, setUserId] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.full_name) setUserName(user.user.full_name);
        if (user?.user?.user_id) {
          const id = user.user.user_id;
          setUserId(id);
        }
      } catch (err) {
        console.error("Error parsing user session:", err);
      }
    }
  }, []);


  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "U";

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.assign("/landing");
    handleMenuClose();
  };


  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#fff", borderRadius: "36px" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={Image} alt="Zealous Logo" width={150} height={67} />
          </Box>

          <Box display="flex" alignItems="center">
            <IconButton onClick={handleMenuOpen}>
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

      <CertificateGenerator ref={certificateRef} />
    </>
  );
}