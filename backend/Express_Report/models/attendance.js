const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  mod_id: String,
  class_name: String,
  poc_id: String,
  date: Date,
  present_count: Number,  // ✅ Add this field
  total_students: Number  // ✅ Add this field
});

// Use the correct collection name: student_attendance
module.exports = mongoose.model("Attendance", AttendanceSchema, "student_attendance");