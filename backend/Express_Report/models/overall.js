const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  report_id: String,
  report_mod: String,
  report_poc: String,
  studentName: String,
  studentId: String,
  totalMarks: Number,
  scoredMarks: Number,
  percentage: {
    type: Number,
    default: function () {
      return this.scoredMarks && this.totalMarks
        ? (this.scoredMarks / this.totalMarks) * 100
        : 0;
    },
  },
});

const Performance = mongoose.model("Performance", performanceSchema);

module.exports = Performance;   