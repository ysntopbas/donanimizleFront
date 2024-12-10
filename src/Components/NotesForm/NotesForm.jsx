import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Grid,
  TextField,
  IconButton,
} from "@mui/material";
import { Edit, Send } from "@mui/icons-material";
import axios from "axios";
import MiniDrawer from "../drawer/MiniDrawer";

export default function NotesForm() {
  const [deviceIDs, setDeviceIDs] = useState([]);
  const [notes, setNotes] = useState({});
  const [editableNotes, setEditableNotes] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "",
  });

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Cihaz ID'lerini API'den alma
  useEffect(() => {
    if (username) {
      axios
        .get(
          `https://donanimeasyleapi.azurewebsites.net/api/Device/GetDevices/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          const ids = response.data;
          setDeviceIDs(ids);
        })
        .catch((error) => {
          console.error("Error fetching device IDs:", error);
        });
    }
  }, [username, token]);

  // Her cihazın notlarını çekme
  useEffect(() => {
    deviceIDs.forEach((deviceID) => {
      if (deviceID) {
        axios
          .get(
            `https://donanimeasyleapi.azurewebsites.net/api/Donanim/GetNote/${deviceID}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((response) => {
            const notesData = Array.isArray(response.data)
              ? response.data
              : [response.data];
            setNotes((prevNotes) => ({
              ...prevNotes,
              [deviceID]: notesData,
            }));
          })
          .catch((error) => {
            console.error(
              `Error fetching notes for device ${deviceID}:`,
              error
            );
          });
      }
    });
  }, [deviceIDs, token]);

  // Notları düzenlenebilir hale getirme
  const handleEditClick = (deviceID) => {
    setEditableNotes((prev) => ({
      ...prev,
      [deviceID]: true,
    }));
  };

  // Düzenlenmiş notları kaydetme
  const handleSendClick = (deviceID) => {
    const updatedNote = notes[deviceID][0];
    const payload = {
      id: {}, // API'ye gönderilmesi gerektiği belirtilmiş.
      deviceID,
      note: updatedNote,
      dateCreated: new Date().toISOString(),
    };

    axios
      .post(
        "https://donanimeasyleapi.azurewebsites.net/api/Donanim/SaveNote",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setSnackbar({
          open: true,
          message: "Note updated successfully",
          color: "green",
        });
        setEditableNotes((prev) => ({
          ...prev,
          [deviceID]: false,
        }));
      })
      .catch((error) => {
        console.error(`Error saving note for device ${deviceID}:`, error);
        setSnackbar({
          open: true,
          message: "Error updating note",
          color: "red",
        });
      });
  };

  // Not değişikliğini işleme
  const handleNoteChange = (deviceID, value) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [deviceID]: [value],
    }));
  };

  return (
    <MiniDrawer>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          {deviceIDs.map((deviceID) => (
            <Grid item xs={12} md={6} key={deviceID}>
              <Card sx={{ marginBottom: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Device ID: {deviceID}
                    </Typography>
                    {notes[deviceID] ? (
                      notes[deviceID].length === 0 ? (
                        <Typography>No notes found for this device</Typography>
                      ) : (
                        <Box sx={{ position: "relative" }}>
                          <TextField
                            multiline
                            fullWidth
                            variant="outlined"
                            value={notes[deviceID][0] || ""}
                            onChange={(e) =>
                              handleNoteChange(deviceID, e.target.value)
                            }
                            disabled={!editableNotes[deviceID]}
                          />
                          <IconButton
                            onClick={() =>
                              editableNotes[deviceID]
                                ? handleSendClick(deviceID)
                                : handleEditClick(deviceID)
                            }
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                            }}
                          >
                            {editableNotes[deviceID] ? <Send /> : <Edit />}
                          </IconButton>
                        </Box>
                      )
                    ) : (
                      <Typography>Loading notes...</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

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
      </Box>
    </MiniDrawer>
  );
}
