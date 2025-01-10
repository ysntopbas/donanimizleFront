import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Send,
  Mail,
  MailOutline,
  Delete,
  Refresh,
} from "@mui/icons-material";
import axios from "axios";
import MiniDrawer from "../drawer/MiniDrawer";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";

// Axios instance'ı düzenle
const axiosInstance = axios.create({
  baseURL: 'https://donanimapi.onrender.com/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  },
  // Hata mesajlarını bastırmak için
  validateStatus: function (status) {
    return status >= 200 && status < 500; // 404'ü de geçerli durum olarak kabul et
  }
});

// Axios interceptor ekle
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Hata mesajlarını konsola yazdırmayı engelle
    return Promise.resolve({ data: [] });
  }
);

export default function Messages() {
  const [deviceIDs, setDeviceIDs] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState({});
  const [expandedDevices, setExpandedDevices] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [messageCountByDevice, setMessageCountByDevice] = useState({});
  const [previousMessageCount, setPreviousMessageCount] = useState({});

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Cihaz ID'lerini getir
  useEffect(() => {
    if (username) {
      fetchDevices();
    }
  }, [username, token]);

  // Başlangıçta localStorage'dan önceki mesaj sayılarını al
  useEffect(() => {
    const savedCounts = localStorage.getItem('previousMessageCounts');
    if (savedCounts) {
      setPreviousMessageCount(JSON.parse(savedCounts));
    }
  }, []);

  // Refresh fonksiyonu
  const handleRefresh = () => {
    deviceIDs.forEach(device => {
      fetchMessages(device.deviceID);
    });
    // Refresh yapıldığında tüm sayıları localStorage'a kaydet
    const newCounts = {};
    deviceIDs.forEach(device => {
      newCounts[device.deviceID] = messageCountByDevice[device.deviceID] || 0;
    });
    localStorage.setItem('previousMessageCounts', JSON.stringify(newCounts));
  };

  const fetchDevices = () => {
    axiosInstance
      .get(`/Device/GetDeviceInfo/${username}`)
      .then((response) => {
        const devices = Array.isArray(response.data)
          ? response.data.map((device) => ({
              deviceID: device.deviceID,
              deviceName: device.deviceName,
            }))
          : [{ deviceID: response.data.deviceID, deviceName: response.data.deviceName }];
        setDeviceIDs(devices);
        // Her cihaz için expanded durumunu false olarak başlat
        const initialExpanded = {};
        devices.forEach(device => {
          initialExpanded[device.deviceID] = false;
        });
        setExpandedDevices(initialExpanded);
      })
      .catch(() => {
        setDeviceIDs([]);
        setExpandedDevices({});
      });
  };

  // Mesajları göster/gizle ve sayaçları güncelle
  const toggleMessages = (deviceID) => {
    const isExpanding = !expandedDevices[deviceID];
    
    setExpandedDevices(prev => ({
      ...prev,
      [deviceID]: isExpanding
    }));

    // Card açıldığında mevcut sayıyı previousCount'a kaydet
    if (isExpanding) {
      const newCount = messageCountByDevice[deviceID] || 0;
      setPreviousMessageCount(prev => {
        const newCounts = {
          ...prev,
          [deviceID]: newCount
        };
        // localStorage'a kaydet
        localStorage.setItem('previousMessageCounts', JSON.stringify(newCounts));
        return newCounts;
      });
    }
  };

  const fetchMessages = (deviceID) => {
    axios
      .get(`https://donanimapi.onrender.com/api/messages/${deviceID}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const deviceMessages = response.data || [];
        setMessages(prev => ({
          ...prev,
          [deviceID]: deviceMessages
        }));
        
        // Kullanıcı mesajlarını say (isMessageIT: false olanlar)
        const userMessageCount = deviceMessages.filter(m => !m.isMessageIT).length;
        
        // localStorage'dan önceki sayıyı al
        const savedCounts = JSON.parse(localStorage.getItem('previousMessageCounts') || '{}');
        const previousCount = savedCounts[deviceID] || 0;
        
        // Eğer yeni mesaj varsa ve kart kapalıysa
        if (userMessageCount > previousCount && !expandedDevices[deviceID]) {
          setMessageCountByDevice(prev => ({
            ...prev,
            [deviceID]: userMessageCount
          }));
        }
      })
      .catch(() => {
        setMessages(prev => ({
          ...prev,
          [deviceID]: []
        }));
        setMessageCountByDevice(prev => ({
          ...prev,
          [deviceID]: 0
        }));
      });
  };

  const handleSendMessage = (deviceID, deviceName) => {
    const messageContent = newMessage[deviceID];
    if (!messageContent?.trim()) {
      setSnackbar({
        open: true,
        message: "Mesaj boş olamaz",
        severity: "error",
      });
      return;
    }

    const messageData = {
      deviceID: deviceID,
      deviceName: deviceName,
      content: messageContent,
      messageDate: new Date().toISOString(),
      isMessageIT: true
    };

    axiosInstance
      .post("/messages", messageData)
      .then(() => {
        setSnackbar({
          open: true,
          message: "Mesaj gönderildi",
          severity: "success",
        });
        setNewMessage((prev) => ({ ...prev, [deviceID]: "" }));
        fetchMessages(deviceID);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "Mesaj gönderilemedi",
          severity: "error",
        });
      });
  };

  const handleDeleteMessages = (device, event) => {
    event.stopPropagation(); // Card'ın açılmasını engelle
    setSelectedDevice(device);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDevice) {
      try {
        await axios.delete(`https://donanimapi.onrender.com/api/messages/${selectedDevice.deviceID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(prev => ({...prev, [selectedDevice.deviceID]: []}));
        // Tüm sayaçları sıfırla
        setMessageCountByDevice(prev => ({...prev, [selectedDevice.deviceID]: 0}));
        setPreviousMessageCount(prev => ({...prev, [selectedDevice.deviceID]: 0}));
        setSnackbar({
          open: true,
          message: "Mesajlar başarıyla silindi",
          severity: "success"
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Mesajlar silinirken bir hata oluştu",
          severity: "error"
        });
      }
      setDeleteDialogOpen(false);
    }
  };

  return (
    <MiniDrawer>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 2 
        }}>
          <Tooltip title="Mesajları Yenile">
            <IconButton 
              onClick={handleRefresh}
              sx={{ 
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {deviceIDs
            .sort((a, b) => {
              const aHasNewMessages = messageCountByDevice[a.deviceID] > (previousMessageCount[a.deviceID] || 0);
              const bHasNewMessages = messageCountByDevice[b.deviceID] > (previousMessageCount[b.deviceID] || 0);
              
              if (aHasNewMessages && !bHasNewMessages) return -1;
              if (!aHasNewMessages && bHasNewMessages) return 1;
              return 0;
            })
            .map((device) => (
              <Grid item xs={12} md={6} lg={4} key={device.deviceID}>
                <Card 
                  sx={{ 
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    maxWidth: "100%"
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box 
                      onClick={() => toggleMessages(device.deviceID)}
                      sx={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          borderRadius: "8px"
                        }
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: "500",
                            fontSize: "1rem",
                            color: "#2c3e50"
                          }}
                        >
                          {device.deviceName}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "#7f8c8d",
                            fontSize: "0.75rem"
                          }}
                        >
                          {device.deviceID}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {messageCountByDevice[device.deviceID] > (previousMessageCount[device.deviceID] || 0) && (
                          <Tooltip title={`${messageCountByDevice[device.deviceID] - (previousMessageCount[device.deviceID] || 0)} yeni mesaj`}>
                            <Box>
                              {expandedDevices[device.deviceID] ? 
                                <Mail color="primary" /> : 
                                <MailOutline color="primary" />
                              }
                            </Box>
                          </Tooltip>
                        )}
                        <Tooltip title="Kullanıcı ile olan mesajlaşmaları sil">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteMessages(device, e)}
                            sx={{ color: '#ff4444' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        {expandedDevices[device.deviceID] ? 
                          <ExpandLess sx={{ color: "#7f8c8d" }} /> : 
                          <ExpandMore sx={{ color: "#7f8c8d" }} />
                        }
                      </Box>
                    </Box>
                    
                    {expandedDevices[device.deviceID] && (
                      <Box 
                        sx={{ 
                          mt: 2,
                          borderTop: "1px solid #e0e0e0",
                          pt: 2
                        }}
                      >
                        <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
                          {messages[device.deviceID]?.map((message, index) => (
                            <Card
                              key={index}
                              sx={{
                                mb: 1,
                                backgroundColor: message.isMessageIT ? "#f5f5f5" : "#ffffff",
                                borderLeft: message.isMessageIT ? "4px solid #1976d2" : "none",
                                boxShadow: message.isMessageIT 
                                  ? "0 2px 4px rgba(0,0,0,0.1)" 
                                  : "0 1px 3px rgba(0,0,0,0.05)",
                              }}
                            >
                              <CardContent>
                                <Typography 
                                  variant="body2" 
                                  color="textSecondary"
                                  sx={{ 
                                    display: "flex", 
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1
                                  }}
                                >
                                  <span>{message.isMessageIT ? "IT Ekibi" : "Kullanıcı"}</span>
                                  <span>{new Date(message.messageDate).toLocaleString()}</span>
                                </Typography>
                                <Typography 
                                  variant="body1"
                                  sx={{
                                    color: message.isMessageIT ? "#1976d2" : "#000000"
                                  }}
                                >
                                  {message.content}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Mesajınızı yazın..."
                            value={newMessage[device.deviceID] || ""}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                [device.deviceID]: e.target.value,
                              }))
                            }
                          />
                          <IconButton
                            color="primary"
                            onClick={() => handleSendMessage(device.deviceID, device.deviceName)}
                          >
                            <Send />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Mesajları Sil</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedDevice && `${selectedDevice.deviceName} (${selectedDevice.deviceID}) ile olan tüm mesajlaşmaları silmek istediğinize emin misiniz?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button onClick={confirmDelete} color="error">
              Evet, Sil
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Box>
    </MiniDrawer>
  );
} 