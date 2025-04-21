const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const mongoose = require("mongoose");
const Consul = require("consul");
const consul = new Consul();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");



 router.get("/get-by-mod-id_for_attendance/:module_id", async (req, res) => {
  const { module_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Mod');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/modules/get_module_by_id/${module_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching module by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

router.get("/get_poc_by_poc_id_for_attendance/:module_poc_id", async (req, res) => {
  const { module_poc_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Poc');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }

    const service = result[0]; // 👈 safer to use 0
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/poc/get_poc_by_poc_id/${module_poc_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching poc by module ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});






router.get("/get-all-attendance", async (req, res) => {
  try {
    const records = await Attendance.find();

    if (!records.length) {
      return res.status(404).json({ message: "❌ No records found" });
    }

    const groupedData = records.map(record => {
      const formattedAttendance = record.daily_attendance.map(att => ({
        date: att.date,
        present_count: att.present_count,
        total_students: att.total_students,
        attendanceRate: ((att.present_count / (att.total_students || 1)) * 100).toFixed(2) + "%"
      }));

      return {
        module_id: record.module_id,
        module_poc_id :record.module_poc_id,
        attendance_report_id: record.attendance_report_id,
        mod_name: record.mod_name,
        class_name: record.class_name,
        poc_name: record.poc_name,
        daily_attendance: formattedAttendance
      };
    });

    res.json(groupedData);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: Fetch by module and class
router.post("/get-by-module-id-and-module-poc-id", async (req, res) => {
  try {
    let { module_id, module_poc_id } = req.body;

    if (!module_id || !module_poc_id) {
      return res.status(400).json({
        success: false,
        message: "❌ Both 'module_id' and 'module_poc_id' are required."
      });
    }

    module_id = module_id.trim();
    module_poc_id = module_poc_id.trim();

    const records = await Attendance.find({ module_id, module_poc_id });

    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: `❌ No attendance records found for '${module_id}' and '${module_poc_id}'.`
      });
    }

    const formattedData = records.map(record => ({
      attendance_report_id: record.attendance_report_id,
      mod_name: record.mod_name,
      class_name: record.class_name,
      poc_name: record.poc_name,
      daily_attendance: record.daily_attendance.map(att => ({
        date: att.date,
        present_count: att.present_count,
        total_students: att.total_students,
        attendanceRate: ((att.present_count / (att.total_students || 1)) * 100).toFixed(2) + "%"
      }))
    }));

    return res.status(200).json({
      success: true,
      message: "✅ Attendance records fetched successfully.",
      data: formattedData
    });

  } catch (error) {
    console.error("❌ Error while fetching attendance:", error);
    return res.status(500).json({ success: false, message: "❌ Internal server error." });
  }
});


// ✅ POST: Create/update attendance
router.post("/post-attendance", async (req, res) => {
  console.log("📥 Received POST request:", req.body);

  let { module_id, module_poc_id, mod_name, poc_name, class_name, date, present_count, total_students } = req.body;

  if (![module_id, module_poc_id, class_name, date, present_count, total_students].every(Boolean)) {
    return res.status(400).json({ error: "❌ All required fields are not provided" });
  }

  try {
    // 🔍 Fetch mod_name
    if (!mod_name) {
      const modService = await consul.catalog.service.nodes("Express_Mod");
      if (!modService?.length)
        return res.status(404).json({ error: "❌ Module service not found in Consul" });

      const { Address, ServicePort } = modService[0];
      const modResponse = await axios.get(`http://${Address}:${ServicePort}/modules/get_module_by_id/${module_id}`);
      mod_name = modResponse.data?.mod_name;
      if (!mod_name) return res.status(404).json({ error: "❌ Module name not found" });
    }

    // 🔍 Fetch poc_name
    if (!poc_name) {
      const pocService = await consul.catalog.service.nodes("Express_Poc");
      if (!pocService?.length)
        return res.status(404).json({ error: "❌ POC service not found in Consul" });

      const { Address, ServicePort } = pocService[0];
      const pocResponse = await axios.get(`http://${Address}:${ServicePort}/poc/get_poc_by_poc_id/${module_poc_id}`);
      poc_name = pocResponse.data?.mod_poc_name;
      if (!poc_name) return res.status(404).json({ error: "❌ POC name not found" });
    }

    const attendanceData = {
      date: new Date(date),
      present_count: Number(present_count),
      total_students: Number(total_students)
    };

    let record = await Attendance.findOne({ mod_name, class_name, poc_name });

    if (!record) {
      const newRecord = new Attendance({
        module_id,
        module_poc_id,
        attendance_report_id: uuidv4(),
        mod_name,
        class_name,
        poc_name,
        daily_attendance: [attendanceData]
      });

      await newRecord.save();
      return res.status(201).json({ message: "✅ New attendance entry created" });
    }

    const dateExists = record.daily_attendance.some(
      entry => new Date(entry.date).toDateString() === new Date(date).toDateString()
    );

    if (dateExists) {
      return res.status(409).json({ error: "❌ Attendance for this date already exists" });
    }

    record.daily_attendance.push(attendanceData);
    await record.save();

    res.status(200).json({ message: "✅ Attendance updated for existing record" });

  } catch (err) {
    console.error("❌ Error in POST /post-attendance:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ PUT: Update by date
router.put("/update-attendance-by-date", async (req, res) => {
  const { mod_name, class_name, poc_name, date, present_count, total_students } = req.body;

  if (![mod_name, class_name, poc_name, date].every(Boolean)) {
    return res.status(400).json({ error: "❌ All fields are required" });
  }

  try {
    const record = await Attendance.findOne({ mod_name, class_name, poc_name });
    if (!record) {
      return res.status(404).json({ error: "❌ Record not found" });
    }

    const day = record.daily_attendance.find(
      d => new Date(d.date).toDateString() === new Date(date).toDateString()
    );

    if (!day) {
      return res.status(404).json({ error: "❌ No attendance found for the given date" });
    }

    if (present_count !== undefined) day.present_count = Number(present_count);
    if (total_students !== undefined) day.total_students = Number(total_students);

    await record.save();

    res.json({ message: "✅ Attendance updated for the date", updatedRecord: record });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE by class_name
router.delete("/delete-attendance-class", async (req, res) => {
  const { class_name } = req.body;

  if (!class_name) {
    return res.status(400).json({ error: "❌ class_name is required" });
  }

  try {
    const deleted = await Attendance.findOneAndDelete({ class_name });

    if (!deleted) {
      return res.status(404).json({ error: `❌ No attendance record found for class: ${class_name}` });
    }

    res.json({ message: `✅ Attendance record for class "${class_name}" deleted successfully.` });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;