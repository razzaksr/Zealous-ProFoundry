import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { createRoot } from "react-dom/client";
import BackgroundImg from "../assests/cert_bg.jpg.jpg"; // Fixed typo
import DigiSign from "../assests/DigiSign.png"; // Adjust path
import { getUserById, getModuleById, fetchAggregateScores, fetchOrGenerateCertificates } from "../axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { QRCodeCanvas } from "qrcode.react";

// Certificate template
const CertificateTemplate = ({ forwardedRef, certificateId }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [aggregateScore, setAggregateScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("true");
      if (!storedUser) return;

      try {
        const user = JSON.parse(storedUser);
        const userId = user?.user?.user_id;
        const modId = user?.user?.mod_poc_id?.mod_id;
        const pocId = user?.user?.mod_poc_id?.mod_poc_id;

        if (userId) {
          const userData = await getUserById(userId);
          setUserDetails(userData);
        }

        if (modId) {
          const moduleData = await getModuleById(modId);
          setModuleDetails(moduleData);
        }

        if (userId && pocId) {
          const scoreData = await fetchAggregateScores(pocId, userId);
          setAggregateScore(scoreData.response);
        }
      } catch (error) {
        console.error("Error fetching certificate data:", error);
      }
    };

    fetchData();
  }, []);

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
      {/* Temporary inline background for debugging */}
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
        onError={(e) => console.error("Failed to load inline background image:", e, BackgroundImg)}
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

// Generate PDF
const generateCertificate = async (certificateId, setProgress, setError) => {
  const certificateRef = { current: null };
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(<CertificateTemplate forwardedRef={(el) => (certificateRef.current = el)} certificateId={certificateId} />);

    setProgress(20);
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

    setProgress(40);
    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: "transparent",
      scale: 2, // Optimized scale
    });

    setProgress(60);
    const imgData = canvas.toDataURL("image/jpeg", 0.8); // JPEG for compression
    console.log(`Canvas data URL size: ${(imgData.length * 0.75 / 1024 / 1024).toFixed(2)} MB`); // Debug canvas size

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    console.log("Adding background to PDF:", background.src); // Debug
    pdf.addImage(background, "JPEG", 0, 0, 297, 210); // Removed FAST for testing
    pdf.addImage(imgData, "JPEG", 0, 0, 297, 210); // Removed FAST for testing

    const storedUser = localStorage.getItem("true");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const filename = user?.user?.full_name ? `${user.user.full_name}_Certificate.pdf` : "Certificate.pdf";

    pdf.save(filename);

    setProgress(90);
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    URL.revokeObjectURL(pdfUrl);
    setProgress(100);
  } catch (error) {
    console.error("Error generating certificate:", error);
    setError(error.message || "Failed to generate certificate PDF");
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};

// Styled Components
const StyledButton = styled("div")(({ theme }) => ({
  transition: "all 0.3s ease",
  margin: theme.spacing(1),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
}));

const AnimatedLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#fc7a46",
  },
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 2px 8px rgba(252, 122, 70, 0.4)",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
      animation: "shimmer 1.5s infinite",
    },
  },
  "@keyframes shimmer": {
    "0%": {
      transform: "translateX(-100%)",
    },
    "100%": {
      transform: "translateX(100%)",
    },
  },
}));

// Exported Certificate Generator component
const CertificateGenerator = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [certificateId, setCertificateId] = useState(null);

  useImperativeHandle(ref, () => ({
    handleDownloadCertificate,
  }));

  const handleDownloadCertificate = async () => {
    setOpen(true);
    setProgress(0);
    setError(null);

    try {
      const storedUser = localStorage.getItem("true");
      if (!storedUser) {
        throw new Error("User data not found in localStorage");
      }

      const user = JSON.parse(storedUser);
      const userId = user?.user?.user_id;
      const pocId = user?.user?.mod_poc_id?.mod_poc_id;

      if (!userId || !pocId) {
        throw new Error("Invalid userId or pocId");
      }

      const certId = await fetchOrGenerateCertificates(pocId, userId);
      setCertificateId(certId);

      await generateCertificate(certId, setProgress, setError);
    } catch (err) {
      console.error("Error in certificate generation:", err);
      const errorMessage = err.message || "Failed to generate certificate. Please try again.";
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setProgress(0);
    setError(null);
    setCertificateId(null);
  };

  return (
    <Dialog open={open} onClose={progress === 100 || error ? handleClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: "#0c83c8", color: "white" }}>Certificate Generation</DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <AnimatedLinearProgress variant="determinate" value={progress} sx={{ width: "100%" }} />
              <Typography
                sx={{
                  color: "#0c83c8",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                  animation: progress === 100 ? "pulse 1.5s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.8 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.8 },
                  },
                }}
              >
                {progress === 100 ? "Certificate generated successfully!" : `Generating certificate: ${progress}%`}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export default CertificateGenerator;