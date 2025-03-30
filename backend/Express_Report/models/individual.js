const mongoose = require("mongoose");

const individualSchema = new mongoose.Schema({
    report_id :{type: String, required:true},
    report_module:{type: String, required:true},
    report_poc:{type: String, required:true},
    student_id: { type: String, required: true }, // NOT UNIQUE
    student_name: { type: String, required: true },
    day: { type: String, required: true }, // Store the date (YYYY-MM-DD)
    mcq_score: { type: Number, default: 0 },
    coding_score: { type: Number, default: 0 },
    total_score: { type: Number, default: 0 }
});

// Create a unique index on studentId + day
individualSchema.index({ studentId: 1, day: 1 }, { unique: true });

const individual = mongoose.model("individual", individualSchema);
module.exports = individual;