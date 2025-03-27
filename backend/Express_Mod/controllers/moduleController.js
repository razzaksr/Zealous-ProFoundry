const express = require("express");
const router = express.Router();
const Module = require("../models/Module");

// Create Module
router.post("/add_module", async (req, res) => {
  try {
    const module = new Module(req.body);
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Modules
router.get("/get_all_module", async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Module by ID
router.get("/get_module_by_id/:id", async (req, res) => {
  try {
    const module = await Module.findOne({ mod_id: req.params.id });
    if (!module) return res.status(404).json({ message: "Not Found" });
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Module
router.put("/update_module/:id", async (req, res) => {
  try {
    const module = await Module.findOneAndUpdate(
      { mod_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Module
router.delete("/delete_module/:id", async (req, res) => {
  try {
    const module = await Module.findOneAndDelete({ mod_id: req.params.id });

    if (!module) {
      return res.status(404).json({ message: "Module not found for deletion." });
    }

    res.json({ message: "Module deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Module name by mod_ID
router.get("/get_module_name_by_id/:id", async (req, res) => {
  try {
    const module = await Module.findOne({ mod_id: req.params.id });
    if (!module) return res.status(404).json({ message: "Not Found" });
    res.json({mod_name: module.mod_name});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
