const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    reportId: String,
    reportModule: String,
    reportPOC: String,
    studentId: String,
    studentName: String,
    day: Number,
    mcqScore: Number,
    testCase1Score: Number,
    testCase2Score: Number,
    totalScore: Number,
    percentageScore: Number
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;