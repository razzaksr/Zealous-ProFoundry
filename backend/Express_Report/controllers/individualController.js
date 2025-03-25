const express = require("express");
const mongoose = require("mongoose");
const Individual = require("../models/individual");

const router = express.Router();

// 📝 Create a new report
router.post("/post-individual", async (req, res) => {
    try {
        const { report_id, report_module, report_poc, student_id, student_name, day, mcq_score, coding_score } = req.body;
        const total_score = (mcq_score || 0) + (coding_score || 0); // Auto-calculate total_score

        const newReport = new Individual({
            report_id,
            report_module,
            report_poc,
            student_id,
            student_name,
            day,
            mcq_score,
            coding_score,
            total_score
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 📌 Get all reports
router.get("/get-all-individual", async (req, res) => {
    try {
        const reports = await Individual.find();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Get a single report by student ID
router.get("/get-by-id-individual/:student_id", async (req, res) => {
    try {
        const reports = await Individual.find({ student_id: req.params.student_id }).sort({ day: 1 });
        if (reports.length === 0) return res.status(404).json({ error: "No reports found for this student" });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🛠️ Update a report
router.put("/update-individual", async (req, res) => {
    try {
        const { student_id, student_name, day, mcq_score, coding_score, report_id, report_module, report_poc } = req.body;

        if (!student_id || !day) {
            return res.status(400).json({ error: "student_id and day are required" });
        }

        const total_score = (mcq_score || 0) + (coding_score || 0); // Recalculate total_score

        const updatedReport = await Individual.findOneAndUpdate(
            { student_id, day }, // Find by student_id and day
            { $set: { mcq_score, coding_score, total_score, report_id, report_module, report_poc, student_name } },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ error: "Report not found for this student on this day" });
        }

        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ❌ Delete a report
router.delete("/delete-individual-by-stuid-day/:student_id/:day", async (req, res) => {
    try {
        const deletedReport = await Individual.findOneAndDelete({ 
            student_id: req.params.student_id, 
            day: req.params.day 
        });

        if (!deletedReport) {
            return res.status(404).json({ error: "Report not found for this student on this day" });
        }

        res.json({ message: "Report deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
