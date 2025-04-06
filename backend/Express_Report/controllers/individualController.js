const express = require("express");
const Individual = require("../models/individual");

const router = express.Router();

// 📝 Create or Update Individual Report
router.post("/post-individual", async (req, res) => {
  try {
    const {
      module_name,
      module_id,
      module_poc_name,
      module_poc_id,
      user_id,
      result_test_id,
      result_mcq_score,
      result_coding_score,
      total_mark
    } = req.body;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const date = req.body.date || today;

    const scored_mark = (Number(result_mcq_score) || 0) + (Number(result_coding_score) || 0);

    const newTest = {
      result_test_id,
      date,
      result_mcq_score: String(result_mcq_score || 0),
      result_coding_score: String(result_coding_score || 0),
      scored_mark: String(scored_mark),
      total_mark: String(total_mark || 100)
    };

    let individual = await Individual.findOne({ user_id });

    if (!individual) {
      // 🆕 New user — create fresh record
      individual = new Individual({
        module_name,
        module_id,
        module_poc_name,
        module_poc_id,
        user_id,
        tests: [newTest]
      });
    } else {
      // 🚫 Don't allow duplicate date entries
      const alreadyExists = individual.tests.some(test => test.date === date);

      if (alreadyExists) {
        return res.status(400).json({
          message: `⚠️ Test already exists for user on ${date}`
        });
      }

      individual.tests.push(newTest);
    }

    await individual.save();
    res.status(201).json(individual);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 📌 Get all reports
router.get("/get-all-individual", async (req, res) => {
  try {
    const reports = await Individual.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get report(s) by user_id
router.get("/get-by-id-individual/:user_id", async (req, res) => {
  try {
    const report = await Individual.findOne({ user_id: req.params.user_id });
    if (!report) return res.status(404).json({ error: "No reports found for this user." });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛠 Update a specific test by result_test_id
router.put("/update-individual", async (req, res) => {
  try {
    const {
      user_id,
      result_test_id,
      date,
      result_mcq_score,
      result_coding_score,
      total_mark,
      module_name,
      module_id,
      module_poc_name,
      module_poc_id
    } = req.body;

    const scored_mark = (result_mcq_score || 0) + (result_coding_score || 0);

    const individual = await Individual.findOne({ user_id });

    if (!individual) return res.status(404).json({ error: "User not found" });

    const test = individual.tests.find(t => t.result_test_id === result_test_id);

    if (!test) return res.status(404).json({ error: "Test not found" });

    // Update test values
    test.date = date || test.date;
    test.result_mcq_score = result_mcq_score ?? test.result_mcq_score;
    test.result_coding_score = result_coding_score ?? test.result_coding_score;
    test.total_mark = total_mark ?? test.total_mark;
    test.scored_mark = scored_mark;

    // Optional top-level update
    if (module_name) individual.module_name = module_name;
    if (module_id) individual.module_id = module_id;
    if (module_poc_name) individual.module_poc_name = module_poc_name;
    if (module_poc_id) individual.module_poc_id = module_poc_id;

    await individual.save();
    res.json(individual);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete a test by user_id and result_test_id
router.delete("/delete-test/:user_id/:result_test_id", async (req, res) => {
  try {
    const { user_id, result_test_id } = req.params;

    const individual = await Individual.findOne({ user_id });

    if (!individual) return res.status(404).json({ error: "User not found" });

    const initialLength = individual.tests.length;

    individual.tests = individual.tests.filter(t => t.result_test_id !== result_test_id);

    if (individual.tests.length === initialLength) {
      return res.status(404).json({ error: "Test not found" });
    }

    await individual.save();
    res.json({ message: "Test deleted successfully", updatedReport: individual });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;