const express = require("express");
const Code = require("../models/Coding");

const router = express.Router();

// Utility function for handling errors
const handleError = (res, error, customMessage = "Server Error") => {
    console.error("Error:", error);
    res.status(500).json({ success: false, msg: customMessage });
};

router.post("/code", async (req, res) => {
  const { code_problem_statement, code_test_cases_id, code_tags } = req.body;

  if (!code_problem_statement || !Array.isArray(code_test_cases_id) || code_test_cases_id.length === 0) {
    return res.status(400).json({
      success: false,
      msg: "Invalid input: Problem statement and test cases are required",
    });
  }

  try {
    // Check if `code_problem_statement` already exists
    const existingCode = await Code.findOne({ code_problem_statement });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        msg: "Problem statement already exists",
      });
    }

    const newCode = new Code({
      code_problem_statement,
      code_test_cases_id, // Can have duplicate test case IDs
      code_tags: code_tags || [], // Can have duplicate tags
    });

    const savedCode = await newCode.save();
    res.status(201).json({
      success: true,
      msg: "Code created successfully",
      data: savedCode,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Duplicate code_id detected, please try again.",
      });
    }
    handleError(res, error);
  }
});


router.get("/get_allCodes", async (req, res) => {
    try {
        const codes = await Code.find();
        res.status(200).json({ success: true, codes });
    } catch (error) {
        handleError(res, error);
    }
});


router.get("/get_code_by_id/:code_id", async (req, res) => {
  const { code_id } = req.params;

  if (!code_id) {
      return res.status(400).json({ success: false, msg: "code_id is required" });
  }

  try {
      const code = await Code.findOne({ code_id });

      if (!code) {
          return res.status(404).json({ success: false, msg: "Code not found" });
      }

      res.status(200).json({ success: true, data: code });
  } catch (error) {
      console.error("Fetch Error:", error); // ✅ Log actual error
      res.status(500).json({ success: false, msg: "Server Error", error: error.message });
  }
});


router.put("/update_code", async (req, res) => {
  const { code_id, code_test_cases_id, code_tags, ...updateData } = req.body;

  if (!code_id) {
      return res.status(400).json({ success: false, msg: "code_id is required" });
  }

  try {
      const code = await Code.findOne({ code_id });
      if (!code) {
          return res.status(404).json({ success: false, msg: "Code not found" });
      }

      // ✅ Update test cases if provided
      if (code_test_cases_id) {
          const newTestCases = Array.isArray(code_test_cases_id) ? code_test_cases_id : [code_test_cases_id];
          code.code_test_cases_id = [...new Set([...code.code_test_cases_id, ...newTestCases])]; // Prevent duplicates
      }

      // ✅ Update tags if provided
      if (code_tags) {
          const newTags = Array.isArray(code_tags) ? code_tags : [code_tags];
          code.code_tags = [...new Set([...code.code_tags, ...newTags])]; // Prevent duplicates
      }

      Object.assign(code, updateData);
      await code.save();

      res.status(200).json({ success: true, msg: "Code updated successfully", code });
  } catch (error) {
      console.error("Update Error:", error); // ✅ Log the actual error
      res.status(500).json({ success: false, msg: "Server Error", error: error.message });
  }
});


router.delete("/delete_code/:code_id", async (req, res) => {
    const { code_id } = req.params;

    if (!code_id) {
        return res.status(400).json({ success: false, msg: "code_id is required" });
    }

    try {
        const deletedCode = await Code.findOneAndDelete({ code_id });

        if (!deletedCode) {
            return res.status(404).json({ success: false, msg: "Code not found" });
        }

        res.status(200).json({ success: true, msg: "Code deleted successfully" });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
