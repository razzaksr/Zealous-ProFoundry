const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

// ✅ GET: Fetch attendance records
router.get("/", async (req, res) => {
  try {
    let { mod_id, class_name, poc_id } = req.query;

    if (class_name) class_name = decodeURIComponent(class_name);

    let query = {};
    if (mod_id) query.mod_id = mod_id;
    if (class_name) query.class_name = { $regex: `^${class_name}$`, $options: "i" };
    if (poc_id) query.poc_id = poc_id;

    console.log("🔍 Query:", query);

    const attendanceRecords = await Attendance.find(query);

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: "❌ No attendance records found" });
    }

    const formattedRecords = attendanceRecords.map(record => {
      const presentCount = record.present_count ?? 0;
      const totalStudents = record.total_students ?? 1;

      const attendanceRate = ((presentCount / totalStudents) * 100).toFixed(2) + "%";

      return {
        date: record.date,
        presentCount,
        totalStudents,
        attendanceRate,
      };
    });

    res.json(formattedRecords);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST: Add new attendance record
router.post("/", async (req, res) => {
  console.log("📥 Received POST request:", req.body);

  let { mod_id, class_name, poc_id, date, present_count, total_students } = req.body;

  if (![mod_id, class_name, poc_id, date, present_count, total_students].every(Boolean)) {
    return res.status(400).json({ error: "❌ All fields are required" });
  }

  try {
    const newRecord = new Attendance({
      mod_id,
      class_name,
      poc_id,
      date: new Date(date),
      present_count: Number(present_count),
      total_students: Number(total_students),
    });

    await newRecord.save();
    res.status(201).json({ message: "✅ Attendance recorded successfully" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT: Update attendance record
router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // ✅ Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "❌ Invalid ID format" });
      }
  
      const updateData = req.body;
  
      // ✅ Check if request body is empty
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "❌ No fields provided for update" });
      }
  
      // ✅ Ensure fields are updated correctly
      const updatedRecord = await Attendance.findByIdAndUpdate(
        id,
        { $set: updateData }, 
        { new: true, runValidators: true }
      );
  
      if (!updatedRecord) {
        return res.status(404).json({ error: "❌ Attendance record not found" });
      }
  
      res.json({ message: "✅ Attendance updated successfully", updatedRecord });
    } catch (err) {
      console.error("❌ Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
// ✅ DELETE: Remove attendance record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await Attendance.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ error: "❌ Record not found" });
    }

    res.json({ message: "✅ Attendance deleted successfully" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;