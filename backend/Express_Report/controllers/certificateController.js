const express = require("express");
const router = express.Router();
const StudentCertificate = require("../models/certificate");

// **GET - Fetch All Certificates**
router.get("/all-certificates", async (req, res) => {
  try {
    const certificates = await StudentCertificate.find();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificates", error });
  }
});

// **POST - Add a New Certificate**
router.post("/post-certificates", async (req, res) => {
  try {
    const {
      certificate_id,
      certificate_user_id,
      certificate_mod_id,
      certificate_poc_id,
      certificate_generated_date,
    } = req.body;

    const newCertificate = new StudentCertificate({
      certificate_id,
      certificate_user_id,
      certificate_mod_id,
      certificate_poc_id,
      certificate_generated_date,
      certificate_url: "",
    });

    await newCertificate.save();
    res.status(201).json({ message: "Certificate added successfully", certificate: newCertificate });
  } catch (error) {
    res.status(500).json({ message: "Error adding certificate", error });
  }
});

// Update certificate (PUT) - Now using req.body instead of req.params
router.put("/update-certificates", async (req, res) => {
  try {
    const { certificate_id, ...updateData } = req.body;

    const updatedCertificate = await StudentCertificate.findOneAndUpdate(
      { certificate_id },
      updateData,
      { new: true }
    );

    if (!updatedCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate updated successfully", certificate: updatedCertificate });
  } catch (error) {
    res.status(500).json({ message: "Error updating certificate", error });
  }
});

// **DELETE - Remove a Certificate**
router.delete("/delete-by-cert-user-id/:certificate_user_id", async (req, res) => {
  try {
    const { certificate_user_id } = req.params;

    const deletedCertificate = await StudentCertificate.findOneAndDelete({ certificate_user_id });

    if (!deletedCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate deleted successfully", certificate: deletedCertificate });
  } catch (error) {
    res.status(500).json({ message: "Error deleting certificate", error });
  }
});

module.exports = router;