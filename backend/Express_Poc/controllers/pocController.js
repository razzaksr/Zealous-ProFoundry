const express = require("express");
const axios = require("axios");
const Poc = require("../models/Poc");
const consul = require("../interservices/consul");

const router = express.Router();

const TEST_SERVICE_NAME = process.env.TEST_SERVICE_NAME || "Express_Test";
const USER_SERVICE_NAME = process.env.USER_SERVICE_NAME || "Express_User";

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

        if (!poc) return res.status(404).json({ message: "POC not found" });

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
  
      if (!updatedPoc) return res.status(404).json({ message: "POC not found" });
  
      res.json(updatedPoc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Add a test to a POC
  router.put("/update_test", async (req, res) => {
    try {
        const { mod_poc_id, test_id } = req.body;

        if (!mod_poc_id || !test_id) {
            return res.status(400).json({ message: "mod_poc_id and test_id are required" });
        }

        // Find the existing POC
        const poc = await Poc.findOne({ mod_poc_id });

        if (!poc) {
            return res.status(404).json({ message: "POC not found" });
        }

        // Ensure mod_tests is an object, not an array
        if (!poc.mod_tests || typeof poc.mod_tests !== 'object' || Array.isArray(poc.mod_tests)) {
            poc.mod_tests = {};  // Convert to an empty object if needed
        }

        // Check if the test_id already exists in mod_tests
        const testExists = Object.values(poc.mod_tests).includes(test_id);
        if (testExists) {
            return res.status(400).json({ message: "Test ID already exists for another day" });
        }

        // Determine the next "Day N" key
        const dayNumbers = Object.keys(poc.mod_tests)
            .map(day => parseInt(day.replace("Day ", ""), 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);

        const nextDayNumber = (dayNumbers.length > 0 ? Math.max(...dayNumbers) : 0) + 1;
        const newDayKey = `Day ${nextDayNumber}`;

        // Update mod_tests dynamically
        const updatedPoc = await Poc.findOneAndUpdate(
            { mod_poc_id },
            { $set: { [`mod_tests.${newDayKey}`]: test_id } }, // Dot notation to update mod_tests
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Test added successfully", updatedPoc });
    } catch (error) {
        res.status(500).json({ message: "Error updating mod_tests", error: error.message });
    }
});

// Delete a test from a POC
router.delete("/delete_test/:mod_poc_id", async (req, res) => {
  try {
      const { mod_poc_id } = req.params;

      if (!mod_poc_id) {
          return res.status(400).json({ message: "mod_poc_id is required" });
      }

      // Find the existing POC
      const poc = await Poc.findOne({ mod_poc_id });

      if (!poc) {
          return res.status(404).json({ message: "POC not found" });
      }

      // Delete the mod_tests field entirely
      poc.mod_tests = {}; // Reset the mod_tests to an empty object

      // Save the updated POC
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
  
      if (!updatedPoc) return res.status(404).json({ message: "POC not found" });
  
      res.json(updatedPoc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  

// Delete a POC
router.delete("/delete_poc/:mod_poc_id", async (req, res) => {
  try {
    const deletedPoc = await Poc.findOneAndDelete({ mod_poc_id: req.params.mod_poc_id });

    if (!deletedPoc) return res.status(404).send({ message: "POC not found" });

    res.send({ message: "POC deleted successfully", deletedPoc });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
