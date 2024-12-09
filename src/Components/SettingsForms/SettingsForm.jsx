import { useState } from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import MiniDrawer from "../drawer/MiniDrawer";

const themes = ["Light", "Dark"];
const notificationOptions = ["Enabled", "Disabled"];

// Varsayılan addSettings fonksiyonu
const addSettings = async (settings) => {
  // Örnek bir simülasyon. Gerçek API çağrısı burada yapılabilir.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: true,
        message: "Settings updated successfully",
      });
    }, 1000);
  });
};

const SettingsForm = ({
  themeData = "Light",
  notificationsData = "Enabled",
}) => {
  const [theme, setTheme] = useState(themeData);
  const [notifications, setNotifications] = useState(notificationsData);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isFormValid()) {
      try {
        const settingsInfo = await addSettings({ theme, notifications });
        if (settingsInfo.status) {
          console.log(settingsInfo);
        } else {
          alert("Settings update failed: " + settingsInfo.message);
        }
      } catch (error) {
        alert("Settings update failed: " + error.message);
      }
    }
  };

  const isFormValid = () => {
    return theme && notifications;
  };

  const toggleTheme = () => {
    const newTheme = theme === "Dark" ? "Light" : "Dark";
    localStorage.setItem("theme", newTheme);
    window.location.reload();
  };

  return (
    <MiniDrawer>
      <Card></Card>
    </MiniDrawer>
  );
};

export default SettingsForm;
