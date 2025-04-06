const express = require("express");
const Poc = require("../models/Poc");

const router = express.Router();

// Create a new POC
router.post("/add_poc", async (req, res) => {
  try {
    const poc = new Poc(req.body);
    await poc.save();
    res.status(201).send(poc);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all POCs
router.get('/read_all_poc', async (req, res) => {
  try {
    const pocs = await Poc.find();
    res.status(200).json(pocs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs", error: error.message });
  }
});

// Get POC by mod_poc_id
router.get('/get_poc_by_poc_id/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });

    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.status(200).json(poc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC", error: error.message });
  }
});

// Update POC details
router.put("/update_poc", async (req, res) => {
  try {
    const { mod_poc_id, ...updateData } = req.body;

    if (!mod_poc_id) {
      return res.status(400).json({ message: "mod_poc_id is required" });
    }

    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    res.json(updatedPoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a test to a POC
router.put("/update_test", async (req, res) => {
  try {
    const { mod_poc_id, test_id } = req.body;

    // Validation: Check required fields
    if (!mod_poc_id || !Array.isArray(test_id) || test_id.length === 0) {
      return res.status(400).json({ message: "mod_poc_id and test_id (non-empty array) are required." });
    }

    // Find the POC
    const existingPoc = await Poc.findOne({ mod_poc_id });

    if (!existingPoc) {
      return res.status(404).json({ message: "POC not found with the provided mod_poc_id." });
    }

    // Update mod_tests
    existingPoc.mod_tests = test_id;
    await existingPoc.save();

    res.status(200).json({ message: "POC test_id(s) updated successfully.", updated_tests: existingPoc.mod_tests });
  } catch (error) {
    console.error("Error updating test_id for POC:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



// Delete a test from a POC
router.delete("/delete_test/:mod_poc_id", async (req, res) => {
  try {
    const { mod_poc_id } = req.params;

    if (!mod_poc_id) {
      return res.status(400).json({ message: "mod_poc_id is required" });
    }

    const poc = await Poc.findOne({ mod_poc_id });

    if (!poc) {
      return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });
    }

    poc.mod_tests = {};
    await poc.save();

    res.status(200).json({ message: "mod_tests deleted successfully", updatedPoc: poc });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mod_tests", error: error.message });
  }
});

// Update only mod_tests and mod_users
router.put("/update_mod_field", async (req, res) => {
  try {
    const { mod_poc_id, mod_tests, mod_users } = req.body;

    if (!mod_poc_id) {
      return res.status(400).json({ message: "mod_poc_id is required" });
    }

    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id },
      { mod_tests, mod_users },
      { new: true, runValidators: true }
    );

    if (!updatedPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    res.json(updatedPoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a POC
router.delete("/delete_poc/:mod_poc_id", async (req, res) => {
  try {
    const deletedPoc = await Poc.findOneAndDelete({ mod_poc_id: req.params.mod_poc_id });

    if (!deletedPoc) return res.status(404).send({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.send({ message: "POC deleted successfully", deletedPoc });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Module ID by User ID
router.get("/mod_by_user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id");

    if (!module) {
      return res.status(404).json({ error: `No module found for user with ID ${user_id}` });
    }

    res.json({ mod_id: module.mod_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get Module and POC Name AND TEST ID by User ID
router.get("/mod_and_poc/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find the module where `mod_users` contains `user_id`
    const module = await Poc.findOne(
      { mod_users: user_id },
      "mod_id mod_poc_id mod_poc_name mod_tests"
    );

    if (!module) {
      return res.status(404).json({ error: `No module found for user with ID ${user_id}` });
    }

    // Extract test IDs from mod_tests object
    const test_ids = module.mod_tests ? Object.values(module.mod_tests) : [];

    res.status(200).json({
      mod_id: module.mod_id,
      mod_poc_id: module.mod_poc_id, // Added mod_poc_id
      mod_poc_name: module.mod_poc_name,
      test_ids, // Returning an array of test IDs
    });
  } catch (err) {
    console.error(" Error fetching module data:", err);
    res.status(500).json({ error: err.message });
  }
});


// Get poc_certificate by mod_id
router.get('/get_poc_certificate_by_mod_id/:mod_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_id: req.params.mod_id });

    if (!poc) {
      return res.status(404).json({ message: `POC with Module ID ${req.params.mod_id} not found` });
    }

    // Return the poc_certificate field
    res.status(200).json({ poc_certificate: poc.poc_certificate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching poc_certificate", error: error.message });
  }
});





module.exports = router;
