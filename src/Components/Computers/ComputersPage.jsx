import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Collapse,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import axios from "axios";
import MiniDrawer from "../drawer/MiniDrawer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";

// Reusable section component for collapsible data
const Section = ({ label, visible, toggleVisibility, data, renderItem }) => (
  <Box>
    <FormControlLabel
      control={
        <Checkbox
          checked={visible}
          onChange={toggleVisibility}
          icon={<ExpandMoreIcon />}
          checkedIcon={<ExpandMoreIcon />}
        />
      }
      label={label}
    />
    <Collapse in={visible}>{data.map(renderItem)}</Collapse>
  </Box>
);

export default function ComputersPage() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (username && token) {
      axios
        .get(
          `https://donanimeasyleapi.azurewebsites.net/api/Device/GetDeviceInfo/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          const devices = response.data || [];
          setComputers(devices);
          setVisibleSections(
            devices.reduce(
              (acc, { deviceID }) => ({
                ...acc,
                [deviceID]: { cpu: false, gpu: false, ram: false, disk: false },
              }),
              {}
            )
          );
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Something went wrong.");
          setLoading(false);
        });
    } else {
      setError("Username or token not found in localStorage.");
      setLoading(false);
    }
  }, []);

  const toggleVisibility = (section, deviceID) => {
    setVisibleSections((prev) => ({
      ...prev,
      [deviceID]: { ...prev[deviceID], [section]: !prev[deviceID][section] },
    }));
  };

  const refreshData = (deviceID) => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    axios
      .get(`https://donanimeasyleapi.azurewebsites.net/api/Device/GetDeviceInfo/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const updated = response.data.find((c) => c.deviceID === deviceID);
        setComputers((prev) =>
          prev.map((c) => (c.deviceID === deviceID ? updated : c))
        );
      })
      .catch(console.error);
  };

  const deleteDevice = (deviceID) => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    axios
      .delete("https://donanimeasyleapi.azurewebsites.net/api/Device/DeleteDevice", {
        headers: { Authorization: `Bearer ${token}` },
        data: { username, deviceID },
      })
      .then(() => {
        setComputers((prev) => prev.filter((c) => c.deviceID !== deviceID));
      })
      .catch(console.error);
  };

  const getMaxMinTemp = (data, type) => {
    let maxTemp = -Infinity;
    let minTemp = Infinity;

    data.forEach((item) => {
      if (item.isTemp) {
        const temp = item.value;
        if (temp > maxTemp) maxTemp = temp;
        if (temp < minTemp) minTemp = temp;
      }
    });

    // Round to two decimal places
    maxTemp = maxTemp.toFixed(2);
    minTemp = minTemp.toFixed(2);

    // Store the max and min temperatures in localStorage for each device
    const storedMaxMin = JSON.parse(localStorage.getItem(type)) || {};
    storedMaxMin[type] = { maxTemp, minTemp };
    localStorage.setItem(type, JSON.stringify(storedMaxMin));

    return { maxTemp, minTemp };
  };
  const getTempColor = (temp) => {
    if (temp < 50) return "blue"; // 50'den düşük, mavi
    if (temp >= 50 && temp < 60) return "green"; // 50-60 arası, yeşil
    if (temp >= 60 && temp < 70) return "purple"; // 60-70 arası, sarı
    if (temp >= 70 && temp < 80) return "orange"; // 70-80 arası, turuncu
    return "red"; // 80 ve üstü, kırmızı
  };
  if (loading) {
    return (
      <MiniDrawer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </MiniDrawer>
    );
  }

  if (error) {
    return (
      <MiniDrawer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      </MiniDrawer>
    );
  }

  return (
    <MiniDrawer>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 2 }}>
        {computers.length === 0 ? (
          <Typography>No devices found</Typography>
        ) : (
          computers.map(
            ({
              deviceID,
              deviceName,
              cpuInfos,
              gpuInfos,
              ramInfo,
              diskInfo,
            }) => {
              const cpuTemps = getMaxMinTemp(cpuInfos, "cpu");
              const gpuTemps = getMaxMinTemp(gpuInfos, "gpu");

              return (
                <Card key={deviceID} sx={{ width: 300 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: "18px" }}>
                      {deviceName}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: "16px" }}>
                      CPU's
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(cpuTemps.maxTemp),
                      }}
                    >
                      Max Temp : {cpuTemps.maxTemp}°C
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(cpuTemps.minTemp),
                      }}
                    >
                      Min Temp: {cpuTemps.minTemp}°C
                    </Typography>

                    <Typography variant="h6" sx={{ fontSize: "16px" }}>
                      GPU's
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(gpuTemps.maxTemp),
                      }}
                    >
                      Max Temp : {gpuTemps.maxTemp}°C
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(gpuTemps.minTemp),
                      }}
                    >
                      Min Temp: {gpuTemps.minTemp}°C
                    </Typography>

                    {/* CPU Section */}
                    <Section
                      label="CPU Info"
                      visible={visibleSections[deviceID]?.cpu}
                      toggleVisibility={() => toggleVisibility("cpu", deviceID)}
                      data={cpuInfos}
                      renderItem={(cpu, i) => (
                        <Typography key={i} variant="body2">
                          {cpu.name}: {cpu.value} {cpu.isTemp ? "°C" : "%"}
                        </Typography>
                      )}
                    />
                    {/* GPU Section */}
                    <Section
                      label="GPU Info"
                      visible={visibleSections[deviceID]?.gpu}
                      toggleVisibility={() => toggleVisibility("gpu", deviceID)}
                      data={gpuInfos}
                      renderItem={(gpu, i) => (
                        <Typography key={i} variant="body2">
                          {gpu.name}: {gpu.value} {gpu.isTemp ? "°C" : "%"}
                        </Typography>
                      )}
                    />

                    {/* RAM Section */}
                    <Section
                      label="RAM Info"
                      visible={visibleSections[deviceID]?.ram}
                      toggleVisibility={() => toggleVisibility("ram", deviceID)}
                      data={[
                        {
                          label: "Total",
                          value: `${ramInfo["Total RAM (MB)"] / 1024} GB`,
                        },
                        {
                          label: "Available",
                          value: `${ramInfo["Available RAM (MB)"] / 1024} GB`,
                        },
                        {
                          label: "Used",
                          value: `${ramInfo["Used RAM Percentage (%)"]} %`,
                        },
                      ]}
                      renderItem={(ram, i) => (
                        <Typography key={i} variant="body2">
                          {ram.label}: {ram.value}
                        </Typography>
                      )}
                    />

                    {/* Disk Section */}
                    <Section
                      label="Disk Info"
                      visible={visibleSections[deviceID]?.disk}
                      toggleVisibility={() =>
                        toggleVisibility("disk", deviceID)
                      }
                      data={Object.entries(diskInfo)}
                      renderItem={([diskKey, value], i) => (
                        <Typography key={i} variant="body2">
                          {diskKey}: {value} GB
                        </Typography>
                      )}
                    />

                    {/* Action Buttons */}
                    <Box sx={{ marginTop: 2 }}>
                      <IconButton
                        onClick={() => refreshData(deviceID)}
                        color="primary"
                      >
                        <RefreshIcon />
                        <Typography sx={{ color: "green" }}>Refresh</Typography>
                      </IconButton>
                      <IconButton
                        onClick={() => deleteDevice(deviceID)}
                        color="secondary"
                      >
                        <DeleteIcon />
                        <Typography sx={{ color: "red" }}>Delete</Typography>
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            }
          )
        )}
      </Box>
    </MiniDrawer>
  );
}
