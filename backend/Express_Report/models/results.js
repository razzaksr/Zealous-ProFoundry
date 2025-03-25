const mongoose = require("mongoose");

// ✅ Define Mongoose Schema
const resultSchema = new mongoose.Schema({
  result_id: { type: String, required: true, unique: true },
  result_user_id: { type: String, required: true },
  result_test_id: { type: String, required: true },
  result_score: { type: Number, required: true },
  result_poc_id: { type: String, required: true },
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result; // Exporting the model for reuse