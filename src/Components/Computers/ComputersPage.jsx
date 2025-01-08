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
  FormControl,
  InputLabel,
  Slider,
  Grid,
  Button,
} from "@mui/material";
import axios from "axios";
import MiniDrawer from "../drawer/MiniDrawer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from '@mui/icons-material/Warning';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';

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
  const [fixedProblems, setFixedProblems] = useState({});
  const defaultThresholds = {
    cpuTemp: 80,
    cpuUsage: 90,
    gpuTemp: 80,
    gpuUsage: 90,
    diskUsage: 85
  };
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [openSettings, setOpenSettings] = useState(false);
  const [tempHistory, setTempHistory] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);
  const [usageHistory, setUsageHistory] = useState({});

  // Threshold Modal Stili
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  };

  // Problem Fix butonu için işleyici
  const handleProblemFix = (deviceID) => {
    setFixedProblems(prev => ({
      ...prev,
      [deviceID]: true
    }));
  };

  // Sıralama fonksiyonunu güncelle
  const getSortedComputers = () => {
    return [...computers].sort((a, b) => {
      const aWarnings = !fixedProblems[a.deviceID] ? getWarnings(a).length : 0;
      const bWarnings = !fixedProblems[b.deviceID] ? getWarnings(b).length : 0;
      return bWarnings - aWarnings;
    });
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (username && token) {
      axios
        .get(
          `https://localhost:7117/api/Device/GetDeviceInfo/${username}`,
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

  const refreshData = async (deviceID) => {
    try {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://localhost:7117/api/Device/GetDeviceInfo/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response.data.find((c) => c.deviceID === deviceID);
      
      // Kullanım geçmişini güncelle
      setUsageHistory(prev => ({
        ...prev,
        [deviceID]: [
          ...(prev[deviceID] || []).slice(-3),
          updated
        ]
      }));

      // Mevcut max değerleri koru
      setComputers(prev =>
        prev.map(c => {
          if (c.deviceID === deviceID) {
            return {
              ...updated,
              maxCpuTemp: c.maxCpuTemp,
              maxCpuUsage: c.maxCpuUsage,
              maxGpuTemp: c.maxGpuTemp,
              maxGpuUsage: c.maxGpuUsage,
              maxRamUsage: c.maxRamUsage,
              maxDiskUsages: c.maxDiskUsages
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDevice = (deviceID) => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    axios
      .delete("https://localhost:7117/api/Device/DeleteDevice", {
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

  // Uyarı mesajlarını kontrol eden fonksiyon
  const getWarnings = (computer) => {
    if (fixedProblems[computer.deviceID]) return [];

    const warnings = [];
    
    // CPU kontrolleri
    if (computer.maxCpuTemp > thresholds.cpuTemp) {
      warnings.push(`CPU sıcaklığı çok yüksek: ${computer.maxCpuTemp}°C`);
    }
    if (computer.maxCpuUsage > thresholds.cpuUsage) {
      warnings.push(`CPU kullanımı çok yüksek: ${computer.maxCpuUsage}%`);
    }

    // GPU kontrolleri
    if (computer.maxGpuTemp > thresholds.gpuTemp) {
      warnings.push(`GPU sıcaklığı çok yüksek: ${computer.maxGpuTemp}°C`);
    }
    if (computer.maxGpuUsage > thresholds.gpuUsage) {
      warnings.push(`GPU kullanımı çok yüksek: ${computer.maxGpuUsage}%`);
    }

    // RAM kontrolü
    if (computer.maxRamUsage > thresholds.ramUsage) {
      warnings.push(`RAM kullanımı çok yüksek: ${computer.maxRamUsage}%`);
    }

    // Disk kontrolleri
    if (computer.maxDiskUsages) {
      Object.entries(computer.maxDiskUsages).forEach(([key, usage]) => {
        const diskName = key.split(" ")[0];
        if (usage > thresholds.diskUsage) {
          warnings.push(`${diskName} disk kullanımı çok yüksek: ${usage}%`);
        }
      });
    }

    return warnings;
  };

  // Settings Modal Bileşeni
  const SettingsModal = () => {
    // Geçici state için local state kullanalım
    const [tempThresholds, setTempThresholds] = useState(thresholds);

    const handleInputChange = (key, value) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setTempThresholds(prev => ({ ...prev, [key]: numValue }));
      }
    };

    const handleSave = () => {
      setThresholds(tempThresholds);
      setOpenSettings(false);
    };

    const handleReset = () => {
      setTempThresholds(defaultThresholds);
    };

    return (
      <Modal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Eşik Değerleri Ayarları
          </Typography>
          <Box sx={{ mt: 2 }}>
            {Object.entries(tempThresholds).map(([key, value]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  {key === 'cpuTemp' ? 'CPU Sıcaklığı' :
                   key === 'cpuUsage' ? 'CPU Kullanımı' :
                   key === 'gpuTemp' ? 'GPU Sıcaklığı' :
                   key === 'gpuUsage' ? 'GPU Kullanımı' :
                   'Disk Kullanımı'} Eşiği
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Slider
                    value={value}
                    onChange={(_, newValue) => handleInputChange(key, newValue)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    style={{
                      width: '60px',
                      padding: '5px',
                      marginLeft: '10px'
                    }}
                    min="0"
                    max="100"
                  />
                  <Typography>{key.includes('Temp') ? '°C' : '%'}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSave}
            >
              Kaydet
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleReset}
              color="warning"
            >
              Varsayılana Döndür
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setOpenSettings(false)}
              color="error"
            >
              İptal
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

  // Kullanım verilerini hesaplama fonksiyonu
  const calculateUsages = () => {
    const newComputerData = {};

    computers.forEach(computer => {
      const deviceHistory = usageHistory[computer.deviceID] || [];
      
      if (deviceHistory.length === 0) return;

      // CPU sıcaklıkları ve kullanımı
      const cpuData = deviceHistory.map(history => ({
        temps: history.cpuInfos.filter(info => info.isTemp).map(info => info.value),
        usage: history.cpuInfos.find(info => info.name === "CPU Total")?.value || 0
      }));

      // GPU sıcaklıkları ve kullanımı
      const gpuData = deviceHistory.map(history => ({
        temps: history.gpuInfos.filter(info => info.isTemp).map(info => info.value),
        usage: history.gpuInfos.find(info => !info.isTemp)?.value || 0
      }));

      // RAM kullanımı
      const ramUsage = deviceHistory.map(history => 
        history.ramInfo["Used RAM Percentage (%)"]
      );

      // Disk kullanımı
      const diskUsage = deviceHistory.map(history => {
        const usages = {};
        Object.entries(history.diskInfo).forEach(([key, value]) => {
          if (key.includes("Used Disk Percentage")) {
            usages[key] = parseFloat(value);
          }
        });
        return usages;
      });

      // Max değerleri hesapla
      const maxCpuTemp = Math.max(...cpuData.flatMap(data => data.temps));
      const maxCpuUsage = Math.max(...cpuData.map(data => parseFloat(data.usage)));
      const maxGpuTemp = Math.max(...gpuData.flatMap(data => data.temps));
      const maxGpuUsage = Math.max(...gpuData.map(data => parseFloat(data.usage)));
      const maxRamUsage = Math.max(...ramUsage.map(usage => parseFloat(usage)));

      // Disk kullanım maksimumlarını hesapla
      const maxDiskUsages = {};
      diskUsage.forEach(usage => {
        Object.entries(usage).forEach(([key, value]) => {
          if (!maxDiskUsages[key] || value > maxDiskUsages[key]) {
            maxDiskUsages[key] = value;
          }
        });
      });

      newComputerData[computer.deviceID] = {
        maxCpuTemp,
        maxCpuUsage,
        maxGpuTemp,
        maxGpuUsage,
        maxRamUsage,
        maxDiskUsages
      };
    });

    // Bilgisayar verilerini toplu güncelle
    setComputers(prev => prev.map(comp => ({
      ...comp,
      ...newComputerData[comp.deviceID]
    })));

    // Geçmişi temizle
    setUsageHistory({});
  };

  // Otomatik refresh için useEffect
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      computers.forEach(computer => {
        refreshData(computer.deviceID);
      });
      
      setRefreshCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 4) {
          calculateUsages();
          setFixedProblems({}); // Problem durumlarını sıfırla
          return 0;
        }
        return newCount;
      });
    }, 15000);

    return () => clearInterval(refreshInterval);
  }, [computers]);

  return (
    <MiniDrawer>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Button 
          variant="contained" 
          onClick={() => setOpenSettings(true)}
          sx={{ mb: 2 }}
        >
          Eşik Değerlerini Ayarla
        </Button>
        <SettingsModal />
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {getSortedComputers().map(computer => {
              const warnings = !fixedProblems[computer.deviceID] ? getWarnings(computer) : [];
              
              return (
                <Card key={computer.deviceID} sx={{ width: 300, position: 'relative' }}>
                  {warnings.length > 0 && (
                    <Tooltip title={warnings.join('\n')} placement="top">
                      <WarningIcon 
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          color: 'warning.main' 
                        }} 
                      />
                    </Tooltip>
                  )}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: "18px" }}>
                      {computer.deviceName}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: "16px" }}>
                      CPU's
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(getMaxMinTemp(computer.cpuInfos, "cpu").maxTemp),
                      }}
                    >
                      Max Temp : {getMaxMinTemp(computer.cpuInfos, "cpu").maxTemp}°C
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(getMaxMinTemp(computer.cpuInfos, "cpu").minTemp),
                      }}
                    >
                      Min Temp: {getMaxMinTemp(computer.cpuInfos, "cpu").minTemp}°C
                    </Typography>

                    <Typography variant="h6" sx={{ fontSize: "16px" }}>
                      GPU's
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(getMaxMinTemp(computer.gpuInfos, "gpu").maxTemp),
                      }}
                    >
                      Max Temp : {getMaxMinTemp(computer.gpuInfos, "gpu").maxTemp}°C
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "14px",
                        color: getTempColor(getMaxMinTemp(computer.gpuInfos, "gpu").minTemp),
                      }}
                    >
                      Min Temp: {getMaxMinTemp(computer.gpuInfos, "gpu").minTemp}°C
                    </Typography>

                    {/* CPU Section */}
                    <Section
                      label="CPU Info"
                      visible={visibleSections[computer.deviceID]?.cpu}
                      toggleVisibility={() => toggleVisibility("cpu", computer.deviceID)}
                      data={computer.cpuInfos}
                      renderItem={(cpu, i) => (
                        <Typography key={i} variant="body2">
                          {cpu.name}: {cpu.value} {cpu.isTemp ? "°C" : "%"}
                        </Typography>
                      )}
                    />
                    {/* GPU Section */}
                    <Section
                      label="GPU Info"
                      visible={visibleSections[computer.deviceID]?.gpu}
                      toggleVisibility={() => toggleVisibility("gpu", computer.deviceID)}
                      data={computer.gpuInfos}
                      renderItem={(gpu, i) => (
                        <Typography key={i} variant="body2">
                          {gpu.name}: {gpu.value} {gpu.isTemp ? "°C" : "%"}
                        </Typography>
                      )}
                    />

                    {/* RAM Section */}
                    <Section
                      label="RAM Info"
                      visible={visibleSections[computer.deviceID]?.ram}
                      toggleVisibility={() => toggleVisibility("ram", computer.deviceID)}
                      data={[
                        {
                          label: "Total",
                          value: `${computer.ramInfo["Total RAM (MB)"] / 1024} GB`,
                        },
                        {
                          label: "Available",
                          value: `${computer.ramInfo["Available RAM (MB)"] / 1024} GB`,
                        },
                        {
                          label: "Used",
                          value: `${computer.ramInfo["Used RAM Percentage (%)"]} %`,
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
                      visible={visibleSections[computer.deviceID]?.disk}
                      toggleVisibility={() =>
                        toggleVisibility("disk", computer.deviceID)
                      }
                      data={Object.entries(computer.diskInfo)}
                      renderItem={([diskKey, value], i) => (
                        <Typography key={i} variant="body2">
                          {diskKey}: {value} GB
                        </Typography>
                      )}
                    />

                    {/* Action Buttons */}
                    <Box sx={{ marginTop: 2 }}>
                      <IconButton
                        onClick={() => refreshData(computer.deviceID)}
                        color="primary"
                      >
                        <RefreshIcon />
                        <Typography sx={{ color: "green" }}>Refresh</Typography>
                      </IconButton>
                      <IconButton
                        onClick={() => deleteDevice(computer.deviceID)}
                        color="secondary"
                      >
                        <DeleteIcon />
                        <Typography sx={{ color: "red" }}>Delete</Typography>
                      </IconButton>
                    </Box>

                    {warnings.length > 0 && (
                      <Button
                        variant="contained"
                        color="warning"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleProblemFix(computer.deviceID)}
                      >
                        Problem Fixed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </MiniDrawer>
  );
}
