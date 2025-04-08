// certificate.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import dayjs from "dayjs";
import { getUserById, getResultsByUserId, getModuleById } from "../axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const CertificateTemplate = ({ forwardedRef }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [userResults, setUserResults] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = sessionStorage.getItem("true");
      if (!storedUser) return;

      try {
        const user = JSON.parse(storedUser);
        const userId = user?.user?.user_id;
        const modId = user?.user?.mod_poc_id?.mod_id;

        if (userId) {
          const userData = await getUserById(userId);
          setUserDetails(userData);

          const resultsData = await getResultsByUserId(userId);
          setUserResults(resultsData);
        }

        if (modId) {
          const moduleData = await getModuleById(modId);
          setModuleDetails(moduleData);
        }
      } catch (error) {
        console.error("Error fetching certificate data:", error);
      }
    };

    fetchData();
  }, []);

  if (!userDetails || !moduleDetails || !userResults) {
    return null;
  }

  const formatCertificateId = (id) => {
    const idStr = String(id);
    if (idStr.length > 10) {
      return idStr.slice(-10);
    }
    return idStr.padStart(10, "0");
  };

  return (
    <div
      ref={forwardedRef}
      style={{
        width: "1000px",
        height: "700px",
        position: "relative",
        textAlign: "center",
        backgroundColor: "white",
      }}
    >
      <img
        src="/WhatsApp Image 2025-03-27 at 22.59.49_c96602a3.jpg"
        alt="Certificate Template"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
      <p style={{ position: "absolute", top: "26%", left: "80%", transform: "translateX(-50%)", fontSize: "22px", fontWeight: "bold", color: "#000" }}>
        {formatCertificateId(userResults[0]?.result_id)}
      </p>
      <h2 style={{ position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%)", fontSize: "30px", fontWeight: "bold", color: "#0d47a1" }}>
        {userDetails.full_name} ({userDetails.rollno})
      </h2>
      <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translateX(-50%)", fontSize: "22px", fontFamily: "Times New Roman", color: "#000" }}>
        Department of {userDetails.department} from {userDetails.college} on{" "}
        <span style={{ fontWeight: "bold" }}>{moduleDetails.mod_name}</span> in
        the technology of{" "}
        <span style={{ fontWeight: "bold" }}>{moduleDetails.mod_tech}</span>.
        Obtained a mark of{" "}
        <span style={{ fontWeight: "bold" }}>
          {((userResults[0]?.result_score / userResults[0]?.result_total_score) * 100).toFixed(2)}%
        </span>.
        <br />
        Duration: {moduleDetails.mod_duration}.
      </p>
      <p style={{ position: "absolute", bottom: "13%", left: "28%", transform: "translateX(-50%)", fontSize: "20px", fontWeight: "bold", color: "#000" }}>
        {userResults[0]?.created_at
          ? dayjs(userResults[0].created_at).format("DD-MM-YYYY")
          : dayjs().format("DD-MM-YYYY")}
      </p>
    </div>
  );
};

const generateCertificate = async (setProgress) => {
  let certificateRef = { current: null };
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  try {
    const root = createRoot(container);
    root.render(
      <CertificateTemplate forwardedRef={(el) => (certificateRef.current = el)} />
    );

    setProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    if (!certificateRef.current) {
      throw new Error("Certificate rendering failed");
    }

    setProgress(40);
    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 3,
    });

    setProgress(60);
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    setProgress(80);
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);

    const storedUser = sessionStorage.getItem("true");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const filename = user?.user?.full_name 
      ? `${user.user.full_name}_Certificate.pdf` 
      : "Certificate.pdf";

    pdf.save(filename);

    setProgress(90);
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    URL.revokeObjectURL(pdfUrl);
    setProgress(100);
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
};

// Define styled components
const StyledButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  margin: theme.spacing(1),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
}));

const PrimaryButton = styled(StyledButton)({
  backgroundColor: "#0c83c8",
  "&:hover": {
    backgroundColor: "#0a6eaa",
  },
});

const CertificateGenerator = () => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleDownloadCertificate = async () => {
    setOpen(true);
    setProgress(0);
    setError(null);

    try {
      await generateCertificate(setProgress);
    } catch (err) {
      setError("Failed to generate certificate. Please try again.");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setProgress(0);
    setError(null);
  };

  return (
    <>
      <PrimaryButton 
        variant="contained" 
        onClick={handleDownloadCertificate}
      >
        Download Certificate
      </PrimaryButton>

      <Dialog
        open={open}
        onClose={progress === 100 || error ? handleClose : undefined}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#0c83c8", color: "white" }}>
          Certificate Generation
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: 2,
            mt: 2 
          }}>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
                <LinearProgress 
                  variant="determinate" 
                  value={progress}
                  sx={{ 
                    width: "100%", 
                    height: 10,
                    borderRadius: 5,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#fc7a46"
                    }
                  }}
                />
                <Typography sx={{ color: "#0c83c8" }}>
                  {progress === 100 
                    ? "Certificate generated successfully!" 
                    : `Generating certificate: ${progress}%`}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificateGenerator;