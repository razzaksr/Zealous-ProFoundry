const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Subdocument schema for tests
const testSchema = new mongoose.Schema({
  result_test_id: { type: String, required: false },
  date: { type: String, required: true },
  result_mcq_score: { type: Number, default: 0 },
  result_coding_score: { type: Number, default: 0 },
  scored_mark: { type: Number, default: 0 },
  total_mark: { type: Number, default: 0 }
}, { _id: false });

// Subdocument schema for details
const detailsSchema = new mongoose.Schema({
  aggregate_score: { type: Number, default: 0 },
  total_days: { type: Number, default: 0 },
  attend_test_days: { type: Number, default: 0 },
  not_attend_test_days: { type: Number, default: 0 }
}, { _id: false });

const individualSchema = new mongoose.Schema({
  report_id: { type: String, default: uuidv4 },
  college_name: { type: String, required: false },
  org_id:{ type: String, required: false },
  user_name: { type: String, required: false },
  module_name: { type: String, required: false },
  module_id: { type: String, required: false },
  module_poc_name: { type: String, required: false },
  module_poc_id: { type: String, required: false },
  module_duration: { type: String, required: false },
  user_id: { type: String, required: false, unique: true },
  tests: [testSchema],
  details: detailsSchema
});

// Pre-save hook for aggregate_score validation and calculation
individualSchema.pre("save", function (next) {
  if (this.tests.length > 0) {
    const expectedTotalMark = this.tests[0].total_mark;

    const isValid = this.tests.every(test => test.total_mark === expectedTotalMark);
    if (!isValid) {
      return next(new Error(`All tests must have the same total_mark as the first test (${expectedTotalMark})`));
    }

    this.details.aggregate_score = expectedTotalMark;
  }
  next();
});

const Individual = mongoose.model("individual", individualSchema);
module.exports = Individual;
