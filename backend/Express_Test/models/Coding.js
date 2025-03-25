const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CodeSchema = new mongoose.Schema(
  {
    test_code_id: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4(), // ✅ Ensure UUID is generated
    },
    code_problem_statement: { type: String, required: true },
    code_test_cases: [{ type: String }],
    code_tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Code", CodeSchema);
