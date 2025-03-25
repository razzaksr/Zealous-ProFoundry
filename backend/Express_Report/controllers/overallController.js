const express = require("express");
const Performance = require("../models/overall");

const router = express.Router();

// Add Student Performance Data
router.post("/post-overall", async (req, res) => {
    try {
        const { report_id, report_mod, report_poc, studentName, studentId, totalMarks, scoredMarks } = req.body;
        const percentage = ((scoredMarks / totalMarks) * 100).toFixed(2); // Calculate Percentage
        
        const newPerformance = new Performance({ 
            report_id, 
            report_mod, 
            report_poc, 
            studentName, 
            studentId, 
            totalMarks, 
            scoredMarks, 
            percentage 
        });

        await newPerformance.save();
        res.status(201).json(newPerformance);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update Student Performance Data (using studentId from req.body)
router.put("/update-overall", async (req, res) => {
    try {
        const { report_id, report_mod, report_poc, studentId, scoredMarks, totalMarks } = req.body;
        if (!studentId) return res.status(400).json({ error: "Student ID is required" });

        const percentage = ((scoredMarks / totalMarks) * 100).toFixed(2); // Recalculate percentage

        const updatedPerformance = await Performance.findOneAndUpdate(
            { studentId },
            { $set: { report_id, report_mod, report_poc, scoredMarks, totalMarks, percentage } },
            { new: true }
        );

        if (!updatedPerformance) return res.status(404).json({ error: "Performance data not found for this student" });
        res.json(updatedPerformance);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get All Student Performance Data
router.get("/get-all-overall", async (req, res) => {
    try {
        const data = await Performance.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/total-marks/:module", async (req, res) => {
    try {
      const { module } = req.params;
      const record = await Performance.findOne({ report_mod: module });
  
      if (!record) {
        return res.status(404).json({ error: "Module not found" });
      }
  
      res.json({ totalMarks: record.totalMarks });
    } catch (error) {
      console.error("Error fetching total marks:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

// Get Performance by Student ID
router.get("/:studentId", async (req, res) => {
    try {
        const studentPerformance = await Performance.find({ studentId: req.params.studentId });
        if (studentPerformance.length === 0) {
            return res.status(404).json({ error: "No performance data found for this student" });
        }
        res.json(studentPerformance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Student Performance Data


// Delete Student Performance Data
router.delete("/delete-overall-by-stu-id/:studentId", async (req, res) => {
    try {
        const deletedPerformance = await Performance.findOneAndDelete({ studentId: req.params.studentId });

        if (!deletedPerformance) {
            return res.status(404).json({ error: "Performance data not found for this student" });
        }

        res.json({ message: "Performance data deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;