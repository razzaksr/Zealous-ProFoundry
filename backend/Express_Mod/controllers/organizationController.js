const express = require("express");
const router = express.Router();
const Organization = require("../models/Oraganization");

// Create Organization
router.post("/", async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();
    res.status(201).json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Organizations
router.get("/", async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Organization by ID
router.get("/:id", async (req, res) => {
  try {
    const organization = await Organization.findOne({ org_id: req.params.id });
    if (!organization) return res.status(404).json({ message: "Not Found" });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Organization
router.put("/:id", async (req, res) => {
  try {
    const organization = await Organization.findOneAndUpdate(
      { org_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Organization
router.delete("/:id", async (req, res) => {
  try {
    await Organization.findOneAndDelete({ org_id: req.params.id });
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
