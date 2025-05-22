import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { createRoot } from "react-dom/client";
import { QRCodeCanvas } from "qrcode.react";
import BackgroundImg from "../assests/cert_bg.jpg.jpg"; // Fixed typo in path
import DigiSign from "../assests/DigiSign.png"; // Adjust path
import { getUserById, getModuleById, fetchAggregateScores, fetchOrGenerateCertificates, fetchAllPocs, fetchPocById } from "../axios";

// Certificate template
const CertificateTemplate = ({ forwardedRef, certificateId, userDetails, moduleDetails, aggregateScore }) => {
  if (!userDetails || !moduleDetails || !aggregateScore || !certificateId) return null;

  const percentage = aggregateScore?.average_percentage?.toFixed(2) || "0.00";
  const issueDate = dayjs().format("DD-MM-YYYY");
  const verificationUrl = `https://zealoustechcorp.com/verify?certificateId=${encodeURIComponent(certificateId)}`;

  return (
    <div
      ref={forwardedRef}
      style={{
        width: "1123px",
        height: "794px",
        background: "transparent",
        position: "relative",
        fontFamily: "Georgia, serif",
        padding: "60px",
        boxSizing: "border-box",
        color: "#000",
        textAlign: "center",
      }}
    >
      <img
        src={BackgroundImg}
        alt="Background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          objectFit: "cover",
        }}
        onError={(e) => console.error("Failed to load background image:", e, BackgroundImg)}
      />
      <h2 style={{ fontSize: "46px", marginTop: "130px" }}>CERTIFICATE OF COMPLETION</h2>
      <p style={{ fontSize: "16px", fontStyle: "italic" }}>
        Certificate ID: {certificateId}
      </p>

      <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "30px" }}>
        WE ARE PROUDLY PRESENT THIS SKILL WORKSHOP
      </p>
      <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "30px" }}>CERTIFICATE TO</p>

      <div style={{ display: "inline-block", textAlign: "center", marginTop: "-50px" }}>
        <h3 style={{ fontSize: "26px", color: "#35b5ff", marginBottom: "5px" }}>
          {userDetails.full_name?.toUpperCase()} ({userDetails.rollno})
        </h3>
        <div style={{ height: "2px", backgroundColor: "#35b5ff", width: "100%" }} />
      </div>

      <p style={{ fontSize: "18px", margin: "30px auto", width: "80%" }}>
        Department of <strong>{userDetails.department}</strong> from <strong>{userDetails.college}</strong> on
        <strong> {moduleDetails.mod_name}</strong>. Obtained a mark of <strong>{percentage}%</strong>.<br />
        Duration: {moduleDetails.mod_duration}.
      </p>

      <div
        style={{
          position: "absolute",
          bottom: "90px",
          left: "220px",
          textAlign: "center",
        }}
      >
        <QRCodeCanvas
          value={verificationUrl}
          size={100}
          level="H"
          style={{ marginBottom: "10px" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "200px",
          textAlign: "center",
          fontSize: "1.3rem",
        }}
      >
        <strong>{issueDate}</strong>
        <div style={{ height: "2px", backgroundColor: "#35b5ff", width: "140px", margin: "5px auto 0" }} />
        <span style={{ fontWeight: "bold" }}>Date of Issue</span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "60px",
          textAlign: "center",
          fontSize: "1.3rem",
        }}
      >
        <img
          src={DigiSign || "/placeholder.svg"}
          alt="Digital Signature"
          style={{ height: "90px", width: "90px", marginBottom: "5px" }}
        />
        <div style={{ height: "2px", backgroundColor: "#35b5ff", width: "200px", margin: "5px auto 0" }} />
        <span style={{ fontWeight: "bold" }}>Head - Technology & Training</span>
      </div>
    </div>
  );
};

// Generate single certificate canvas
const generateCertificateCanvas = async (certificateId, userDetails, moduleDetails, aggregateScore) => {
  const certificateRef = { current: null };
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(
      <CertificateTemplate
        forwardedRef={(el) => (certificateRef.current = el)}
        certificateId={certificateId}
        userDetails={userDetails}
        moduleDetails={moduleDetails}
        aggregateScore={aggregateScore}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for rendering
    if (!certificateRef.current) {
      throw new Error("Failed to render certificate template");
    }

    console.log("Loading background image from:", BackgroundImg); // Debug path
    const background = new Image();
    background.src = BackgroundImg;
    await new Promise((resolve, reject) => {
      background.onload = () => {
        console.log("Background image loaded successfully:", background.src, background.width, background.height); // Debug
        resolve();
      };
      background.onerror = (error) => {
        console.error("Failed to load background image:", error, BackgroundImg);
        reject(new Error(`Failed to load background image: ${BackgroundImg}`));
      };
    });

    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: "transparent",
      scale: 2, // Optimized scale
    });

    return { canvas, background };
  } catch (error) {
    throw new Error(`Failed to generate certificate for ${certificateId}: ${error.message}`);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};

// Bulk certificate generator component
const BulkCertificateGenerator = () => {
  const [pocs, setPocs] = useState([]);
  const [selectedPocId, setSelectedPocId] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [error, setError] = useState(null);
  const [certificateErrors, setCertificateErrors] = useState([]);

  // Fetch all POCs on mount
  useEffect(() => {
    const fetchPocs = async () => {
      try {
        const pocData = await fetchAllPocs();
        console.log("Fetched POCs:", pocData.data); // Debug
        setPocs(Array.isArray(pocData.data) ? pocData.data : []);
      } catch (error) {
        console.error("Failed to fetch POCs:", error);
        setError("Failed to fetch POCs: " + error.message);
        setPocs([]);
      }
    };
    fetchPocs();
  }, []);

  // Fetch POC details, users, and aggregate scores when POC is selected
  useEffect(() => {
    if (!selectedPocId) {
      setUsers([]);
      setSelectedUserIds([]);
      return;
    }

    const fetchPocDetails = async () => {
      try {
        setLoading(true);
        const pocData = await fetchPocById(selectedPocId);
        console.log("Fetched POC details:", pocData); // Debug
        const userIds = pocData.mod_users || [];
        const userPromises = userIds.map(async (userId) => {
          try {
            const userDetails = await getUserById(userId);
            const scoreData = await fetchAggregateScores(selectedPocId, userId);
            return {
              id: userId,
              full_name: userDetails.full_name || "Unknown",
              rollno: userDetails.rollno || "Unknown",
              department: userDetails.department || "Unknown",
              college: userDetails.college || "Unknown",
              aggregate_score: scoreData.response?.average_percentage?.toFixed(2) || "0.00",
            };
          } catch (error) {
            console.error(`Failed to fetch data for user ${userId}:`, error);
            return {
              id: userId,
              full_name: "Unknown",
              rollno: "Unknown",
              department: "Unknown",
              college: "Unknown",
              aggregate_score: "0.00",
              error: `Failed to fetch user or score data: ${error.message}`,
            };
          }
        });
        const userData = await Promise.all(userPromises);
        const errors = userData.filter(u => u.error).map(u => ({ userId: u.id, message: u.error }));
        if (errors.length > 0) {
          setCertificateErrors(errors);
        }
        setUsers(userData.filter(u => !u.error));
      } catch (error) {
        console.error("Failed to fetch POC users:", error);
        setError("Failed to fetch POC users: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPocDetails();
  }, [selectedPocId]);

  // DataGrid columns
  const columns = [
    { field: "full_name", headerName: "Full Name", width: 200 },
    { field: "rollno", headerName: "Roll Number", width: 150 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "college", headerName: "College", width: 200 },
    { field: "aggregate_score", headerName: "Aggregate Score (%)", width: 150 },
  ];

  // Generate bulk certificates in a single PDF
  const handleGenerateCertificates = async () => {
    if (selectedUserIds.length === 0) {
      setError("Please select at least one user.");
      return;
    }

    setLoading(true);
    setDialogOpen(true);
    setDialogMessage("Generating certificates...");
    setError(null);
    setCertificateErrors([]);

    try {
      console.log("Generating certificates for POC:", selectedPocId, "Users:", selectedUserIds); // Debug
      const { results, errors } = await fetchOrGenerateCertificates(selectedPocId, selectedUserIds);
      console.log("Certificate results:", results, "Errors:", errors); // Debug
      if (errors.length > 0) {
        setCertificateErrors(errors);
        throw new Error("Some certificates failed to generate");
      }
      if (results.length === 0) {
        throw new Error("No certificates generated for the selected users");
      }

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });

      for (let i = 0; i < results.length; i++) {
        const { userId, certificateId } = results[i];
        const user = users.find(u => u.id === userId);
        const modId = pocs.find(p => p.mod_poc_id === selectedPocId)?.mod_id;
        const pocId = selectedPocId;

        if (!user || !modId) {
          setCertificateErrors(prev => [...prev, {
            userId,
            message: `Missing user or module data for user ${userId}`,
          }]);
          continue;
        }

        const moduleDetails = await getModuleById(modId);
        const scoreData = await fetchAggregateScores(pocId, userId);

        const { canvas, background } = await generateCertificateCanvas(
          certificateId,
          user,
          moduleDetails,
          scoreData.response
        );

        const imgData = canvas.toDataURL("image/jpeg", 0.8); // JPEG with 80% quality
        console.log(`Canvas data URL size for ${certificateId}: ${(imgData.length * 0.75 / 1024 / 1024).toFixed(2)} MB`); // Debug
        if (i > 0) {
          pdf.addPage();
        }
        console.log("Adding background to PDF:", background.src); // Debug
        pdf.addImage(background, "JPEG", 0, 0, 297, 210, undefined, "FAST");
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
      }

      if (certificateErrors.length > 0) {
        throw new Error("Some certificates failed to generate");
      }

      const filename = `Certificates_${selectedPocId}.pdf`;
      pdf.save(filename);
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      URL.revokeObjectURL(pdfUrl);

      setDialogMessage("Certificates generated successfully!");
    } catch (error) {
      console.error("Error generating certificates:", error);
      setError(error.message || "Failed to generate certificates");
      setDialogMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogMessage("");
    setError(null);
    setCertificateErrors([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Bulk Certificate Generator
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select POC</InputLabel>
          <Select
            value={selectedPocId}
            onChange={(e) => setSelectedPocId(e.target.value)}
            label="Select POC"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {pocs.map((poc) => (
              <MenuItem key={poc.mod_poc_id} value={poc.mod_poc_id}>
                {poc.mod_poc_name} ({poc.mod_poc_id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedPocId && (
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={users}
              columns={columns}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedUserIds(newSelection)}
              rowSelectionModel={selectedUserIds}
              loading={loading}
              pageSizeOptions={[5, 10, 20]}
            />
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateCertificates}
          disabled={loading || selectedUserIds.length === 0}
        >
          Generate Certificates
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Certificate Generation</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {dialogMessage && <Typography>{dialogMessage}</Typography>}
              {certificateErrors.length > 0 && (
                <>
                  <Typography color="error" sx={{ mt: 2 }}>
                    Errors occurred for some users:
                  </Typography>
                  <List>
                    {certificateErrors.map(({ userId, message }, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`User ID: ${userId}`}
                          secondary={`Error: ${message}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {!dialogMessage && certificateErrors.length === 0 && error && (
                <Typography color="error">{error}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkCertificateGenerator;