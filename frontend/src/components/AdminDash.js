import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import Image from "../assests/Zealous.png";
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  ExpandLess,
  ExpandMore,
  People,
  Business,
  Book,
  Quiz,
  Person,
  Code,
  BugReport,
  Assignment,
  Add,
  Edit,
  Visibility,
} from "@mui/icons-material";
import CertificateGenerator from "./certificate";
import { useNavigate } from "react-router-dom";

export default function Admin_Dash() {
  const [userName, setUserName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [userId, setUserId] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const certificateRef = useRef(null);
  const navigate = useNavigate();

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

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleMenuToggle = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      text: "POC",
      icon: <Assignment />,
      routes: [
        { text: "View POC", path: "/poc", icon: <Visibility /> },
        { text: "Add POC", path: "/add_poc", icon: <Add /> },
        { text: "Update POC", path: "/update_poc", icon: <Edit /> },
      ],
    },
    {
      text: "Organization",
      icon: <Business />,
      routes: [
        { text: "View Organization", path: "/organization", icon: <Visibility /> },
        { text: "Add Organization", path: "/add_organisation", icon: <Add /> },
        {
          text: "Update Organization",
          path: "/update_organization",
          icon: <Edit />,
        },
      ],
    },
    {
      text: "Module",
      icon: <Book />,
      routes: [
        { text: "View Module", path: "/module", icon: <Visibility /> },
        { text: "Add Module", path: "/add_module", icon: <Add /> },
        { text: "Update Module", path: "/update_testmodule", icon: <Edit /> },
      ],
    },
    {
      text: "Test",
      icon: <Quiz />,
      routes: [{ text: "View Test", path: "/test", icon: <Visibility /> }],
    },
    {
      text: "User",
      icon: <Person />,
      routes: [
        { text: "View User", path: "/user", icon: <Visibility /> },
        { text: "Add User", path: "/add_user", icon: <Add /> },
      ],
    },
    {
      text: "Expert",
      icon: <People />,
      routes: [
        { text: "View Expert", path: "/expert", icon: <Visibility /> },
        { text: "Add Expert", path: "/add_expert", icon: <Add /> },
        { text: "Update Expert", path: "/update_expert", icon: <Edit /> },
      ],
    },
    {
      text: "MCQ",
      icon: <Quiz />,
      routes: [
        { text: "View MCQ", path: "/mcq-admin", icon: <Visibility /> },
        { text: "Add MCQ", path: "/add_mcq", icon: <Add /> },
      ],
    },
    {
      text: "Coding",
      icon: <Code />,
      routes: [
        { text: "View Coding", path: "/codingpage", icon: <Visibility /> },
        { text: "Add Coding", path: "/add_coding", icon: <Add /> },
        { text: "Update Coding", path: "/update_coding", icon: <Edit /> },
      ],
    },
    {
      text: "Testcase",
      icon: <BugReport />,
      routes: [
        { text: "View Testcase", path: "/testcasepage", icon: <Visibility /> },
        { text: "Add Testcase", path: "/add_testcase", icon: <Add /> },
      ],
    },
  ];

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          <div key={item.text}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMenuToggle(item.text)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.routes.map((route) => (
                  <ListItem key={route.text} disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => navigate(route.path)}
                    >
                      <ListItemIcon>{route.icon}</ListItemIcon>
                      <ListItemText primary={route.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "#fff", borderRadius: "36px" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon sx={{ color: "#0b78b9" }} />
            </IconButton>
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

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      <CertificateGenerator ref={certificateRef} />
    </>
  );
}