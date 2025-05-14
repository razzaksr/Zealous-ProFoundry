const express = require("express");
const Poc = require("../models/Poc");
const router = express.Router();
const admin = require("firebase-admin");
const consul = require("../middleware/consul");
const axios = require("axios");

console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("Private Key:", process.env.FIREBASE_PRIVATE_KEY);

// add_poc
router.post("/add_poc", async (req, res) => {
  try {
    const poc = new Poc(req.body);
    await poc.save();
    res.status(201).send(poc);
  } catch (error) {
    res.status(400).send(error);
  }
});

// read_all_poc
router.get('/read_all_poc', async (req, res) => {
  try {
    const pocs = await Poc.find();
    res.status(200).json(pocs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs", error: error.message });
  }
});

// get_poc_by_poc_id
router.get('/get_poc_by_poc_id/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });
    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });
    res.status(200).json(poc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC", error: error.message });
  }
});

// update_poc
router.put("/update_poc", async (req, res) => {
  try {
    const { mod_poc_id, ...updateData } = req.body;
    if (!mod_poc_id) return res.status(400).json({ message: "mod_poc_id is required" });

    const updatedPoc = await Poc.findOneAndUpdate({ mod_poc_id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    res.json(updatedPoc);
  } catch (error) { 
    res.status(400).json({ error: error.message }); 
  }
});

// Updated to handle array of test objects instead of just test_ids
router.put("/update_test", async (req, res) => {
  try {
    const { mod_poc_id, test_id } = req.body; // Changed from 'tests' to 'test_id' to match request

    if (!mod_poc_id || !Array.isArray(test_id) || test_id.length === 0) {
      return res.status(400).json({ 
        message: "mod_poc_id and test_id (non-empty array of {test_id, assigned_date}) are required" 
      });
    }

    // Validate test objects
    const invalidTests = test_id.some(test => !test.test_id || !test.assigned_date);
    if (invalidTests) {
      return res.status(400).json({ 
        message: "Each test must have test_id and assigned_date" 
      });
    }

    const existingPoc = await Poc.findOne({ mod_poc_id });
    if (!existingPoc) return res.status(404).json({ 
      message: "POC not found with the provided mod_poc_id" 
    });

    existingPoc.mod_tests = test_id; // Assign the array directly since it matches the schema
    await existingPoc.save();

    res.status(200).json({ 
      message: "POC tests updated successfully", 
      updated_tests: existingPoc.mod_tests 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
});

// No change needed - still clears the mod_tests array+

router.delete("/delete_test/:mod_poc_id", async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    poc.mod_tests = [];
    await poc.save();

    res.status(200).json({ message: "mod_tests deleted successfully", updatedPoc: poc });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mod_tests", error: error.message });
  }
});

// No change needed - already handles mod_tests as an array
router.put("/update_mod_field", async (req, res) => {
  try {
    const { mod_poc_id, mod_tests, mod_users } = req.body;
    if (!mod_poc_id) return res.status(400).json({ message: "mod_poc_id is required" });

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

// delete_poc
router.delete("/delete_poc/:mod_poc_id", async (req, res) => {
  try {
    const deletedPoc = await Poc.findOneAndDelete({ mod_poc_id: req.params.mod_poc_id });
    if (!deletedPoc) return res.status(404).send({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.send({ message: "POC deleted successfully", deletedPoc });
  } catch (error) {
    res.status(500).send(error);
  }
});

// mod_by_user
router.get("/mod_by_user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id");
    if (!module) return res.status(404).json({ error: `No module found for user with ID ${user_id}` });

    res.json({ mod_id: module.mod_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Updated to handle new mod_tests structure
router.get("/mod_and_poc/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id mod_poc_id mod_poc_name mod_tests");

    if (!module) return res.status(404).json({ error: `No module found for user with ID ${user_id}` });

    const tests = module.mod_tests || [];

    res.status(200).json({
      mod_id: module.mod_id,
      mod_poc_id: module.mod_poc_id,
      mod_poc_name: module.mod_poc_name,
      tests: tests // Return full test objects instead of just test_ids
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// mod_id_poc_id
router.get("/mod_id_poc_id/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id mod_poc_id");
    if (!module) return res.status(404).json({ error: `No module found for user with ID ${user_id}` });

    res.status(200).json({ mod_id: module.mod_id, mod_poc_id: module.mod_poc_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get_poc_certificate_by_mod_id
router.get('/get_poc_certificate_by_mod_id/:mod_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_id: req.params.mod_id });
    if (!poc) return res.status(404).json({ message: `POC with Module ID ${req.params.mod_id} not found` });

    res.status(200).json({ poc_certificate: poc.poc_certificate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching poc_certificate", error: error.message });
  }
});

// GET TEST BY TODAY'S DATE
router.get('/tests_today/:mod_poc_id', async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id }).lean();
    if (!poc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    // Create today's date based on UTC
    const today = new Date();
    const utcToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));

    const todayTests = poc.mod_tests.filter(test => {
      // Parse the DD/MM/YYYY format
      const [day, month, year] = test.assigned_date.split('/').map(Number);
      const testDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      return testDate.getTime() === utcToday.getTime();
    }).map(test => test.test_id);

    return res.status(200).json({
      mod_poc_id,
      date: utcToday.toISOString(),
      test_ids: todayTests
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// already handles new mod_tests structure correctly
router.get('/tests_till_today/:mod_poc_id', async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) return res.status(404).json({ message: "POC not found" });

    // Create today's date in UTC
    const today = new Date();
    const utcToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));

    const validTests = poc.mod_tests.filter(test => {
      // Parse the DD/MM/YYYY format
      const [day, month, year] = test.assigned_date.split('/').map(Number);
      const testDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      return testDate.getTime() <= utcToday.getTime();
    });

    res.status(200).json({ tests_till_today: validTests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
});

router.get('/get_all_tests/:mod_poc_id', async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    
    // Find POC by mod_poc_id and select only the mod_tests field
    const poc = await Poc.findOne({ mod_poc_id }, 'mod_tests');
    
    if (!poc) {
      return res.status(404).json({ 
        message: `POC with ID ${mod_poc_id} not found` 
      });
    }

    // Return the tests array, or empty array if none exist
    const tests = poc.mod_tests || [];

    res.status(200).json({
      mod_poc_id,
      tests
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching tests", 
      error: error.message 
    });
  }
});

// Initialize Firebase Admin SDK (should be done once, typically in a separate config file)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      
    }),
    
  });
}

const db = admin.firestore();

// Unified endpoint for single and bulk certificate generation
router.post("/generate-certificates", async (req, res) => {
  try {
    const { mod_poc_id, userIds } = req.body;

    // Validate input
    if (!mod_poc_id) {
      return res.status(400).json({ message: "mod_poc_id is required" });
    }

    // Normalize userIds to an array
    const userIdsArray = Array.isArray(userIds) ? userIds : typeof userIds === "string" ? [userIds] : [];
    if (userIdsArray.length === 0) {
      return res.status(400).json({ message: "userIds must be a non-empty string or array" });
    }

    // Find the Poc document using mod_poc_id
    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) {
      return res.status(404).json({ message: "Poc not found" });
    }

    // Fetch user details service via Consul
    const serviceName = "Express_User";
    const services = await consul.catalog.service.nodes(serviceName);

    if (!services || services.length === 0) {
      return res.status(500).json({ message: "No available service instances found in Consul" });
    }

    const { ServiceAddress, ServicePort } = services[0];

    if (!ServiceAddress || !ServicePort) {
      return res.status(500).json({ message: "Invalid service details from Consul" });
    }

    const results = [];
    const errors = [];

    // Process each userId
    for (const userId of userIdsArray) {
      try {
        // Check if user is part of mod_users
        if (!poc.mod_users.includes(userId)) {
          errors.push({ userId, message: "User not found in mod_users" });
          continue;
        }

        // Check if certificate already exists in MongoDB
        if (poc.certificates.has(userId)) {
          const existingCertificateId = poc.certificates.get(userId);
          results.push({
            userId,
            certificateId: existingCertificateId,
            message: "Certificate already generated for this user",
          });
          continue;
        }

        // Fetch user details
        const targetUrl = `http://${ServiceAddress}:${ServicePort}/user/get_user_by_id/${userId}`;
        const response = await axios.get(targetUrl);
        const user = response.data;

        if (!user || !user.full_name) {
          errors.push({ userId, message: "User details not found" });
          continue;
        }

        // Generate certificate ID with 5-digit number
        let newCertificateId;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          const certPrefix = poc.poc_certificate.cert_id; // e.g., "CET/WP/"
          const randomFiveDigit = Math.floor(10000 + Math.random() * 90000).toString();
          newCertificateId = `${certPrefix}${randomFiveDigit}`; // e.g., "CET/WP/12345"

          // Check for duplicate in Firestore
          const certificateRef = db.collection("certificates").doc(newCertificateId);
          const certificateDoc = await certificateRef.get();
          if (!certificateDoc.exists) {
            break;
          }
          attempts++;
        }

        if (attempts >= maxAttempts) {
          errors.push({ userId, message: "Failed to generate unique certificate ID after multiple attempts" });
          continue;
        }

        // Set certificate in MongoDB
        poc.certificates.set(userId, newCertificateId);

        // Save to Firebase Firestore
        const certificateRef = db.collection("certificates").doc(newCertificateId);
        await certificateRef.set({
          userId,
          certificateId: newCertificateId,
          mod_poc_id,
          full_name: user.full_name,
          rollno: user.rollno,
          department: user.department,
          college: user.college,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        results.push({
          userId,
          certificateId: newCertificateId,
          message: "Certificate generated and saved to Firebase",
        });
      } catch (error) {
        errors.push({ userId, message: error.message || "Error processing user" });
      }
    }

    // Save updated Poc document
    await poc.save();

    // Return response based on single or bulk request
    if (userIdsArray.length === 1) {
      // Single certificate response (compatible with /add-certificate)
      const result = results[0];
      const error = errors[0];
      if (result) {
        return res.status(200).json({
          message: result.message,
          certificateId: result.certificateId,
        });
      } else {
        return res.status(400).json({
          message: error.message,
        });
      }
    } else {
      // Bulk certificate response
      return res.status(200).json({
        message: "Certificate generation completed",
        results,
        errors,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

  // Retrieve Certificate ID using mod_poc_id
  router.get("/get-certificate/:pocId/:userId", async (req, res) => {
    try {
      const { pocId, userId } = req.params;

      // Use mod_poc_id instead of _id
      const poc = await Poc.findOne({ mod_poc_id: pocId });
      if (!poc) {
        return res.status(404).json({ message: "Poc not found" });
      }

      const certificateId = poc.certificates.get(userId);
      if (!certificateId) {
        return res.status(404).json({ message: "Certificate not found for this user" });
      }

      res.status(200).json({ certificateId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Remove only certificate ID using mod_poc_id
router.delete("/remove-user/:pocId/:userId", async (req, res) => {
  try {
    const { pocId, userId } = req.params;

    const poc = await Poc.findOne({ mod_poc_id: pocId });
    if (!poc) {
      return res.status(404).json({ message: "Poc not found" });
    }

    if (!poc.certificates.has(userId)) {
      return res.status(404).json({ message: "Certificate not found for this user" });
    }

    poc.certificates.delete(userId);

    await poc.save();
    res.status(200).json({ message: "Certificate removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a User's Certificate ID (if the certificate is generated later)
router.put("/update-certificate", async (req, res) => {
  try {
    const { pocId, userId } = req.body;

    const newCertificateId = generateRandomCertificateId(); // 10-digit

    const poc = await Poc.findOne({ mod_poc_id: pocId });
    if (!poc) return res.status(404).json({ message: "Poc not found" });

    if (!poc.mod_users.includes(userId)) {
      return res.status(404).json({ message: "User not found in this Poc" });
    }

    poc.certificates.set(userId, newCertificateId);
    await poc.save();

    res.status(200).json({ message: "Certificate updated", certificateId: newCertificateId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


function generateRandomCertificateId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}



module.exports = router;