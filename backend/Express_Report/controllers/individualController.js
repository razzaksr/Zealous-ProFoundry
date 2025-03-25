const express = require("express");
const Report = require("../models/report");

const router = express.Router();

// Create a new report
router.post("/", async (req, res) => {
    try {
        const newReport = new Report(req.body);
        await newReport.save();
        res.status(201).json(newReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all reports
router.get("/", async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/analytics", async (req, res) => {
  try {
      const analyticsData = await Report.find({}, "reportModule studentId studentName day mcqScore testCase1Score testCase2Score ");
      res.json(analyticsData);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Single report by ID (should be after /analytics)
router.get("/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ error: "Report not found" });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get single report by ID
router.get("/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ error: "Report not found" });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a report
router.put("/:id", async (req, res) => {
    try {
        const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReport) return res.status(404).json({ error: "Report not found" });
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Delete a report
router.delete("/:id", async (req, res) => {
    try {
        const deletedReport = await Report.findByIdAndDelete(req.params.id);
        if (!deletedReport) return res.status(404).json({ error: "Report not found" });
        res.json({ message: "Report deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





module.exports = router;