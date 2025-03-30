import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Container,
} from "@mui/material";
import { User, Book, BarChart } from "lucide-react";
import dayjs from "dayjs";
import Dash from "./dash";

// API Base URL
const API_BASE_URL = "http://localhost:4000";

// Certificate Template Component
const CertificateTemplate = React.forwardRef(
  ({ userDetails, moduleDetails, userResults }, ref) => {
    if (!userDetails || !moduleDetails || !userResults) {
      return null;
    }

    return (
      <div
        ref={ref}
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
        <p
          style={{
            position: "absolute",
            top: "26%",
            left: "77%",
            transform: "translateX(-50%)",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {userResults.certificate_id}
        </p>
        <h2
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "30px",
            fontWeight: "bold",
            color: "#0d47a1",
          }}
        >
          {userDetails.full_name} ({userDetails.rollno})
        </h2>
        <p
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "22px",
            fontFamily: "Times New Roman",
            color: "#000",
          }}
        >
          Department of {userDetails.department} from {userDetails.college} on{" "}
          <span style={{ fontWeight: "bold" }}>{moduleDetails.mod_name}</span> in
          the technology of{" "}
          <span style={{ fontWeight: "bold" }}>{moduleDetails.mod_tech}</span>.
          Obtained a mark of{" "}
          <span style={{ fontWeight: "bold" }}>{userResults.percentage}%</span>.
          <br />
          Duration: {moduleDetails.mod_duration}.
        </p>
        <p
          style={{
            position: "absolute",
            bottom: "13%",
            left: "28%",
            transform: "translateX(-50%)",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {userResults?.certificate_generated_date
            ? dayjs(userResults.certificate_generated_date).format("DD-MM-YYYY")
            : dayjs().format("DD-MM-YYYY")}
        </p>
      </div>
    );
  }
);

// Main User Details and Certificate Component
const CertificateApp = () => {
  const [userId, setUserId] = useState(null);
  const [modId, setModId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [userResults, setUserResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const certificateRef = useRef();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("true");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.user?.user_id) {
          setUserId(user.user.user_id);
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
      }
    }

    const storedModId = sessionStorage.getItem("mod_id");
    if (storedModId) {
      setModId(storedModId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
      fetchUserResults(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (modId) {
      fetchModuleDetails(modId);
    }
  }, [modId]);

  const fetchUserDetails = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/user_gateway/user/get_user_by_id/${id}`);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to fetch user details");
    }
    setLoading(false);
  };

  const fetchModuleDetails = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/modules_gateway/modules/get_module_by_id/${id}`);
      setModuleDetails(response.data);
    } catch (err) {
      console.error("Error fetching module details:", err);
      setError("Failed to fetch module details");
    }
    setLoading(false);
  };

  const fetchUserResults = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/results_gateway/results/get-result-by-user/${id}`);
      setUserResults(response.data);
    } catch (err) {
      console.error("Error fetching user results:", err);
      setError("Failed to fetch user results");
    }
    setLoading(false);
  };

  // Download Certificate as PDF
  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 3,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    pdf.addImage(imgData, "PNG", 0, 0, 297, 210, "", "FAST");
    pdf.save(`Zealous.pdf`);
  };

  return (
    <>
    <Dash />
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: "center", color: "#2C3E50" }}
        >
          User, Module & Results
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            {userDetails && (
              <Card
                sx={{
                  p: 2,
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                  background: "linear-gradient(135deg, #6DD5FA, #2980B9)",
                  color: "#fff",
                  mb: 2,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <User size={24} color="#F1C40F" />
                    <Typography variant="h6" fontWeight="bold">
                      User Details
                    </Typography>
                  </Box>

                  <Typography variant="body1">Full Name: {userDetails.full_name}</Typography>
                  <Typography variant="body1">Department: {userDetails.department}</Typography>
                  <Typography variant="body1">College: {userDetails.college}</Typography>
                  <Typography variant="body1">Roll Number: {userDetails.rollno}</Typography>
                </CardContent>
              </Card>
            )}

            {moduleDetails && (
              <Card
                sx={{
                  p: 2,
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                  background: "linear-gradient(135deg, #8E44AD, #3498DB)",
                  color: "#fff",
                  mb: 2,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Book size={24} color="#F1C40F" />
                    <Typography variant="h6" fontWeight="bold">
                      Module Details
                    </Typography>
                  </Box>

                  <Typography variant="body1">Module Name: {moduleDetails.mod_name}</Typography>
                  <Typography variant="body1">Technology: {moduleDetails.mod_tech}</Typography>
                  <Typography variant="body1">Duration Between: {moduleDetails.mod_duration}</Typography>
                </CardContent>
              </Card>
            )}

            {userResults && (
              <Card
                sx={{
                  p: 2,
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                  background: "linear-gradient(135deg, #E67E22, #D35400)",
                  color: "#fff",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BarChart size={24} color="#F1C40F" />
                    <Typography variant="h6" fontWeight="bold">
                      Test Results
                    </Typography>
                  </Box>

                  <Typography variant="body1">
                    Scores: {userResults.scores ? userResults.scores.join(", ") : "N/A"}
                  </Typography>
                  <Typography variant="body1">Total Score: {userResults.total_score}</Typography>
                  <Typography variant="body1">Percentage: {userResults.percentage}%</Typography>
                </CardContent>
              </Card>
            )}

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleDownloadCertificate}>
                Generate Certificate
              </Button>
            </Box>
          </>
        )}
      </Container>

      {/* Hidden certificate for capture */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {userDetails && moduleDetails && userResults && (
          <CertificateTemplate
            ref={certificateRef}
            userDetails={userDetails}
            moduleDetails={moduleDetails}
            userResults={userResults}
          />
        )}
      </div>
    </>
  );
};

export default CertificateApp;
