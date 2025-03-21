const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CodeSchema = new mongoose.Schema(
  {
    code_id00: { type: String, default: uuidv4, unique: true },
    code_problem_statement: { type: String, require:true },
    code_test_cases: [{ type: String}], // Store test cases as ObjectIds
    code_tags: [{ type: String }], // Store tags as an array of strings
  },
  { timestamps: true }
);

module.exports = mongoose.model("Code", CodeSchema);
