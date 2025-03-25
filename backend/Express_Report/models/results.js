const mongoose = require("mongoose");

// ✅ Define Mongoose Schema
const resultSchema = new mongoose.Schema({
  result_id: { type: String,  unique: true },
  result_user_id: { type: String},
  result_test_id: { type: String},
  result_score: { type: Number,require: true },
  result_poc_id: { type: String},
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result; // Exporting the model for reuse