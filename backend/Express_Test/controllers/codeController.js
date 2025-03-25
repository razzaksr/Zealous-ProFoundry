const express = require("express");
const Code = require("../models/Coding"); // Ensure this is the correct path to your schema
const { v4: uuidv4 } = require("uuid"); // ✅ Import UUID
const router = express.Router();

// 🟢 Create a new Code entry
router.post("/code", async (req, res) => {
  try {
    const { test_code_id, code_problem_statement, code_test_cases, code_tags } = req.body;

    if (!code_problem_statement) {
      return res.status(400).json({ message: "Code problem statement is required" });
    }

    // Ensure test_code_id is NOT coming from request (it will be auto-generated)
    const newCode = new Code({
      code_problem_statement,
      code_test_cases: code_test_cases || [],
      code_tags: code_tags || [],
    });

    const savedCode = await newCode.save();
    res.status(201).json({
      message: "Code document created successfully!",
      data: savedCode,
    });
  } catch (error) {
    console.error("Error creating code:", error);
    res.status(500).json({
      message: "Failed to create Code document",
      error: error.message,
    });
  }
});


// 🟡 Get all Code entries
router.get("/get_allCodes", async (req, res) => {
  try {
    const allCodes = await Code.find().populate("code_test_cases"); // Ensure test cases are populated
    res.status(200).json(allCodes);
  } catch (error) {
    console.error("Error fetching codes:", error);
    res.status(500).json({ error: error.message });
  }
});


/// 🟡 Get a Code entry by test_code_id
router.get("/get_code/:test_code_id", async (req, res) => {
  try {
    const { test_code_id } = req.params;

    // Find code by test_code_id
    const code = await Code.findOne({ test_code_id });

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    res.status(200).json(code);
  } catch (error) {
    console.error("Error fetching code:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


// 🔵 Update a Code entry
router.put("/update_code", async (req, res) => {
  try {
    const { test_code_id, code_test_cases, code_tags, ...updateData } = req.body;

    if (!test_code_id) {
      return res.status(400).json({ message: "test_code_id is required" });
    }

    const code = await Code.findOne({ test_code_id });
    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    // Append only unique test case IDs
    if (code_test_cases) {
      const newTestCases = Array.isArray(code_test_cases) ? code_test_cases : [code_test_cases];
      code.code_test_cases = [...new Set([...code.code_test_cases, ...newTestCases])];
    }

    // Append only unique tags
    if (code_tags) {
      const newTags = Array.isArray(code_tags) ? code_tags : [code_tags];
      code.code_tags = [...new Set([...code.code_tags, ...newTags])];
    }

    // Apply other updates
    Object.assign(code, updateData);

    await code.save();

    res.status(200).json({ message: "Code updated successfully", code });
  } catch (error) {
    console.error("Error updating code:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// 🔴 Delete a Code entry
router.delete("/delete_code/:test_code_id", async (req, res) => {
  try {
    const { test_code_id } = req.params;

    const deletedCode = await Code.findOneAndDelete({ test_code_id });

    if (!deletedCode) {
      return res.status(404).json({ message: "Code not found" });
    }

    res.status(200).json({ message: "Code deleted successfully" });
  } catch (error) {
    console.error("Error deleting code:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
