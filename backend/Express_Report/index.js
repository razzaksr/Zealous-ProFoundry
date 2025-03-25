const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("./config/db");
const consul = require("./interservices/consul");

// ✅ Import Controllers
const attendanceRoutes = require("./controllers/attendanceController");
const certificateRoutes = require("./controllers/certificateController");
const resultRoutes = require("./controllers/resultsController");
const reportRoutes = require("./controllers/individualController");

// ✅ Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Register Routes
app.use("/attendance", attendanceRoutes);
app.use("/certificates", certificateRoutes);
app.use("/reports", reportRoutes);
app.use("/results", resultRoutes);

// ✅ Start Server & Register Service in Consul
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});