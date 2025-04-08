import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";

import BackgroundImg from "../assests/cert_bg.jpg.jpg";
import DigiSign from "../assests/DigiSign.png";
import { getUserById, getResultsByUserId, getModuleById } from "../axios";

const CertificateTemplate = React.forwardRef((props, ref) => {
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

  if (!userDetails || !moduleDetails || !userResults) return null;

  const formatCertificateId = (id) => {
    const idStr = String(id);
    return idStr.length > 10 ? idStr.slice(-10) : idStr.padStart(10, "0");
  };

  return (
    <div
      ref={ref}
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
      <h2 style={{ fontSize: "46px", margin: "20px 0 10px", marginTop: "130px" }}>
        CERTIFICATE OF COMPLETION
      </h2>
      <p style={{ fontSize: "16px", fontStyle: "italic" }}>
        Certificate ID : CET/WP/{formatCertificateId(userResults[0]?.result_id)}
      </p>

      <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "30px" }}>
        WE ARE PROUDLY PRESENT THIS SKILL WORKSHOP
      </p>
      <p style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "30px" }}>
        CERTIFICATE TO
      </p>

      <div style={{ display: "inline-block", textAlign: "center" }}>
        <h3 style={{ fontSize: "26px", color: "#35b5ff", marginBottom: "5px" }}>
          {userDetails.full_name?.toUpperCase()} ({userDetails.rollno})
        </h3>
        <div
          style={{
            height: "2px",
            backgroundColor: "#35b5ff",
            width: "100%",
          }}
        />
      </div>

      <p style={{ fontSize: "18px", margin: "30px auto", width: "80%" }}>
        Department of <strong>{userDetails.department}</strong> from{" "}
        <strong>{userDetails.college}</strong> on
        <strong> Web Development </strong> in the technology of{" "}
        <strong>{moduleDetails.mod_tech}</strong>. Obtained a mark of{" "}
        <strong>
          {(
            (userResults[0]?.result_score / userResults[0]?.result_total_score) *
            100
          ).toFixed(2)}
          %
        </strong>
        .<br />
        Duration: {dayjs(moduleDetails.mod_start_date).format("DD/MM/YYYY")} -{" "}
        {dayjs(moduleDetails.mod_end_date).format("DD/MM/YYYY")}.
      </p>

      {/* Date of Issue */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "60px",
          textAlign: "center",
          fontSize: "1.3rem",
          marginLeft: "200px",
          marginTop: "-50px",
        }}
      >
        <strong>{dayjs(userResults[0]?.created_at).format("DD-MM-YYYY")}</strong>
        <div
          style={{
            height: "2px",
            backgroundColor: "#35b5ff",
            width: "140px",
            margin: "5px auto 0",
          }}
        />
        <span style={{ fontWeight: "bold" }}>Date of Issue</span>
      </div>

      {/* Signature */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "60px",
          textAlign: "center",
          fontSize: "1.3rem",
          marginTop: "-50px",
        }}
      >
        <img
          src={DigiSign}
          alt="stamp"
          style={{ height: "90px", width: "90px", marginBottom: "5px" }}
        />
        <div
          style={{
            height: "2px",
            backgroundColor: "#35b5ff",
            width: "200px",
            margin: "5px auto 0",
          }}
        />
        <span style={{ fontWeight: "bold" }}>Head - Technology & Training</span>
      </div>
    </div>
  );
});

// Exportable function to generate certificate
export const generateCertificate = async () => {
  const certificateRef = { current: null };
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  try {
    const root = createRoot(container);
    root.render(
      <CertificateTemplate ref={(el) => (certificateRef.current = el)} />
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (!certificateRef.current) throw new Error("Certificate rendering failed");

    const background = new Image();
    background.src = BackgroundImg;
    await new Promise((resolve, reject) => {
      background.onload = resolve;
      background.onerror = reject;
    });

    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      backgroundColor: "transparent",
      scale: 3,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    pdf.addImage(background, "JPEG", 0, 0, 297, 210);
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);

    const storedUser = sessionStorage.getItem("true");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const filename = user?.user?.full_name
      ? `${user.user.full_name}_Certificate.pdf`
      : "Certificate.pdf";

    pdf.save(filename);

    return true;
  } catch (error) {
    console.error("Error generating certificate:", error);
    return false;
  } finally {
    document.body.removeChild(container);
  }
};

export default CertificateTemplate;
