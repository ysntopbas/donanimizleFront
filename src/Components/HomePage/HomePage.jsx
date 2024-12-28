import React, { useState } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  Snackbar,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import axios from "axios";
import MiniDrawer from "../drawer/MiniDrawer";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [deviceID, setDeviceID] = useState(""); // Device ID state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "",
  });

  // Kullanıcı adını localStorage'dan alıyoruz
  const username = localStorage.getItem("username");

  // Token'ı localStorage'dan alıyoruz
  const token = localStorage.getItem("token");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setDeviceID(""); // Close modal and reset device ID
  };

  const handleAddComputer = () => {
    if (!deviceID) {
      setSnackbar({
        open: true,
        message: "Device ID cannot be empty",
        color: "red",
      });
      return;
    }

    const data = {
      username: username, // localStorage'dan aldığımız kullanıcı adı
      deviceID: deviceID,
    };

    // Authorization başlığını ekliyoruz
    axios
      .post(
        `https://donanimapi.onrender.com/api/Device/AddDevice`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token'ı Authorization başlığı olarak ekliyoruz
          },
        }
      )
      .then((response) => {
        setSnackbar({
          open: true,
          message: "Device added successfully",
          color: "green",
        });
        handleClose(); // Close modal on success
      })
      .catch((error) => {
        console.error("Error adding computer:", error);
        console.log("Error response:", error.response); // Hata mesajını burada daha detaylı alabilirsiniz
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to add device",
          color: "red",
        });
      });
  };

  return (
    <MiniDrawer>
      <Button
        onClick={handleOpen}
        variant="contained"
        sx={{ width: "10vw", marginBottom: 2 }}
      >
        BILGISAYAR EKLE
      </Button>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>
            Bilgisayar Ekle
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Bilgisayar İkonu */}
            <ComputerIcon sx={{ fontSize: 50, color: "gray" }} />

            {/* TextField */}
            <TextField
              label="Device ID"
              placeholder="Enter Device ID"
              variant="outlined"
              fullWidth
              value={deviceID}
              onChange={(e) => setDeviceID(e.target.value)}
              error={!deviceID} // If empty, show error
              helperText={!deviceID ? "Device ID is required" : ""}
            />

            {/* Ekle Butonu */}
            <Button
              onClick={handleAddComputer}
              variant="contained"
              sx={{ marginTop: 2 }}
            >
              EKLE
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: snackbar.color,
            color: "white",
          },
        }}
      />
    </MiniDrawer>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: "white",
  padding: 3,
  boxShadow: 24,
  borderRadius: 2,
};
