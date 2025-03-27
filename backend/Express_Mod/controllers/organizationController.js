const express = require("express");
const router = express.Router();
const Organization = require("../models/Oraganization");

// Create Organization
router.post("/create_org", async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();
    res.status(201).json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Organizations
router.get("/get_all_org", async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Organization by ID
router.get("/get_org_by_id/:id", async (req, res) => {
  try {
    const organization = await Organization.findOne({ org_id: req.params.id });
    if (!organization) return res.status(404).json({ message: "Not Found" });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Organization
router.put("/update_org_by_id/:id", async (req, res) => {
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

router.delete("/delete_org_by_id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Organization ID is required" });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: "Invalid Organization ID format" });
    }

    const organization = await Organization.findOne({ org_id: id });
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    await Organization.findOneAndDelete({ org_id: id });

    res.status(200).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get Organization name by mod_id
router.get("/get_org_name_by_id/:mod_id", async (req, res) => {
  try {
    const organization = await Organization.findOne({ mod_id: req.params.mod_id });
    if (!organization) return res.status(404).json({ message: "Not Found" });
    res.json({org_name: organization.org_name});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
