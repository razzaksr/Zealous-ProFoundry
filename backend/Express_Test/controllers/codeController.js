const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Code = require("../models/Coding"); // Assuming the schema is in models/Code.js

const router = express.Router();


router.post("/code", async (req, res) => {
  try {
    const { code_problem_statement, code_test_cases, code_tags } = req.body;

    // Create a new Code document
    const newCode = new Code({
      code_problem_statement,
      code_test_cases,
      code_tags,

    });

    // Save the new document to the database
    const savedCode = await newCode.save();
    res.status(201).json({
      message: "Code document created successfully!",
      data: savedCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create Code document",
      error: error.message,
    });
  }
});



// Get all Code entries
router.get("/get_allCodes", async (req, res) => {
    try {
        const create_code = await Code.find().populate("code_test_cases");
        res.status(200).json(create_code);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Code entry
router.put("/update_code", async (req, res) => {
  try {
      const { code_id, code_test_cases, code_tags, ...updateData } = req.body;

      if (!code_id) {
          return res.status(400).json({ message: "code_id is required" });
      }

      const code = await Code.findOne({ code_id });
      if (!code) {
          return res.status(404).json({ message: "Code not found" });
      }

      // Append only new test case IDs
      if (code_test_cases) {
          const newTestCases = Array.isArray(code_test_cases) ? code_test_cases : [code_test_cases];
          code.code_test_cases.push(...newTestCases.filter(id => !code.code_test_cases.includes(id)));
      }

      // Append only new tags
      if (code_tags) {
          const newTags = Array.isArray(code_tags) ? code_tags : [code_tags];
          code.code_tags.push(...newTags.filter(tag => !code.code_tags.includes(tag)));
      }

      // Apply other updates
      Object.assign(code, updateData);

      await code.save();

      res.status(200).json({ message: "Code updated successfully", code });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


// Delete a Code entry
router.delete("/delete_code/:code_id", async (req, res) => {
  try {
      const { code_id } = req.params;

      const deletedCode = await Code.findOneAndDelete({ code_id }); // Find by `code_id` and delete

      if (!deletedCode) {
          return res.status(404).json({ message: "Code not found" });
      }

      res.status(200).json({ message: "Code deleted successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


module.exports = router;