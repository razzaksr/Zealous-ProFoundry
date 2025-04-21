const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("./config/db");
const consul = require("./middleware/consul");

// ✅ Import Controllers
const attendanceRoutes = require("./controllers/attendanceController");
const resultRoutes = require("./controllers/resultsController");
const individualRoutes = require("./controllers/individualController");
const overallreportRoutes = require("./controllers/overallreportController");

// ✅ Initialize Express App
const app = express();



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health check endpoint for Consul
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ Register Routes
app.use("/attendance", attendanceRoutes);
app.use("/individual", individualRoutes);
app.use("/results", resultRoutes);
app.use("/overallreport", overallreportRoutes);




// ✅ Start Server & Register Service in Consul
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
