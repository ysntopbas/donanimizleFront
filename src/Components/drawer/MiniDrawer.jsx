import { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router DOM navigasyonu
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import ComputerIcon from "@mui/icons-material/Computer";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MonitorIcon from "@mui/icons-material/Monitor";
import DescriptionIcon from "@mui/icons-material/Description";

const iconList = [
  {
    label: "Bilgisayarlar",
    title: "Computers",
    icon: <ComputerIcon />,
    path: "/computers",
  },
  {
    label: "Notlar",
    title: "Notes",
    icon: <DescriptionIcon />,
    path: "/notes",
  },
];

const drawerWidth = 240;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function MiniDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // React Router için navigasyon
  const [username, setUsername] = useState(""); // Kullanıcı adını saklamak için state

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Logout işlemi
  const handleLogout = () => {
    // Token'ı local storage'dan sil
    localStorage.removeItem("token");

    // Kullanıcıyı giriş sayfasına yönlendir
    navigate("/login");
  };

  const handleLogin = (user) => {
    setUsername(user); // Giriş yaptıktan sonra kullanıcı adı set edilir
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MonitorIcon fontSize="large" />
          </IconButton>
          <Typography className="no-select" variant="h6" noWrap component="div">
            Hardware-EasyLe
          </Typography>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={() => handleNavigation("/home")}>
            <HomeIcon fontSize="large" /> Ana Sayfa
          </IconButton>
          <IconButton onClick={handleDrawerClose}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {iconList.map((data) => (
            <ListItem key={data.title} disablePadding>
              <ListItemButton onClick={() => handleNavigation(data.path)}>
                <ListItemIcon>{data.icon}</ListItemIcon>
                <ListItemText primary={data.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ marginTop: "auto", padding: 2, width: "100%" }}>
          <Button
            onClick={handleLogout}
            variant="outlined"
            endIcon={<LogoutIcon />}
            sx={{ color: "red", width: "200px", borderColor: "red" }} //Cikis butonu
          >
            Çıkış Yap
          </Button>
        </Box>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
