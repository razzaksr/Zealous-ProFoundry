const express = require('express');
const MCQ = require('../models/MCQ');
const Consul = require("consul");
const consul = new Consul();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Add multiple MCQs
router.post('/add_mcq', async (req, res) => {
    try {
        let mcqs = req.body; // Expecting an array of MCQs or a single object

        // Convert to an array if a single object is received
        if (!Array.isArray(mcqs)) {
            mcqs = [mcqs];
        }

        // Extract all questions to check for duplicates
        const mcqQuestions = mcqs.map(mcq => mcq.mcq_question);

        // Check if any of the questions already exist
        const existingMcqs = await MCQ.find({ mcq_question: { $in: mcqQuestions } });
        const existingQuestions = existingMcqs.map(mcq => mcq.mcq_question);

        // Filter out duplicates
        const newMcqs = mcqs.filter(mcq => !existingQuestions.includes(mcq.mcq_question));

        if (newMcqs.length === 0) {
            return res.status(400).json({ error: "All questions already exist. No new MCQs added." });
        }

        // Insert non-duplicate MCQs
        const savedMcqs = await MCQ.insertMany(newMcqs);

        res.status(201).json({
            message: `${savedMcqs.length} MCQ(s) added successfully`,
            mcqs: savedMcqs
        });

    } catch (error) {
        console.error("Error adding MCQs:", error);
        res.status(500).json({ error: error.message });
    }
});


// Get all MCQs
router.get('/get_all_mcqs', async (req, res) => {
    try {
        const mcqs = await MCQ.find({});
        res.status(200).json(mcqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single MCQ by ID
router.get('/get_mcq/:mcq_id', async (req, res) => {
    try {
        const { mcq_id } = req.params;
        const mcq = await MCQ.findOne({ mcq_id });

        if (!mcq) {
            return res.status(404).json({ message: `No MCQ found with mcq_id: ${mcq_id}` });
        }

        res.status(200).json(mcq);
    } catch (error) {
        console.error("Error fetching MCQ:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update an MCQ by ID
router.put('/update_mcq', async (req, res) => {
    try {
        const { mcq_id, ...updatedData } = req.body; // Extracting mcq_id and update fields

        if (!mcq_id) {
            return res.status(400).json({ error: "mcq_id is required" });
        }

        const updatedMcq = await MCQ.findOneAndUpdate(
            { mcq_id }, // Matching by mcq_id
            { $set: updatedData }, // Updating fields dynamically
            { new: true } // Return the updated document
        );

        if (!updatedMcq) {
            return res.status(404).json({ message: "MCQ not found" });
        }

        res.status(200).json({ message: "MCQ updated successfully", mcq: updatedMcq });
    } catch (error) {
        console.error("Error updating MCQ:", error);
        res.status(500).json({ error: error.message });
    }
});


// Delete an MCQ by ID
router.delete('/remove_mcq/:mcq_id', async (req, res) => {
    try {
        const { mcq_id } = req.params;

        const deletedMcq = await MCQ.findOneAndDelete({ mcq_id });

        if (!deletedMcq) {
            return res.status(404).json({ message: "MCQ not found" });
        }

        res.status(200).json({ message: "MCQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// router.post("/submit_result", async (req, res) => {
//   try {
//     const { result_user_id, result_test_id, result_score, result_poc_id, result_id } = req.body;

//     // Fetch service details from Consul
//     const serviceName = "Express_Report";
//     const services = await consul.catalog.service.nodes(serviceName);
    
//     console.log("🔍 Retrieved services from Consul:", services); // Log Consul services

//     if (!services || services.length === 0) {
//       console.error("❌ No available service instances found in Consul");
//       return res.status(500).json({ message: "No available service instances found in Consul" });
//     }

//     // Use the first available service instance
//     const { ServiceAddress, ServicePort } = services[0];

//     console.log(`📡 Target Service: ${ServiceAddress}:${ServicePort}`); // Log target URL

//     if (!ServiceAddress || !ServicePort) {
//       console.error("❌ Invalid service details from Consul:", services[0]);
//       return res.status(500).json({ message: "Invalid service details from Consul" });
//     }

//     const targetUrl = `http://${ServiceAddress}:${ServicePort}/results/post-result`;
//     console.log(`🚀 Sending request to: ${targetUrl}`); // Log the exact request URL

//     // Send the result data to the external service
//     const response = await axios.post(targetUrl, {
//       result_id: result_id || uuidv4(),
//       result_user_id,
//       result_test_id,
//       result_score,
//       result_poc_id,
//     });

//     console.log("✅ Response from external service:", response.data); // Log response

//     res.status(200).json({
//       message: "✅ Result sent successfully to external service",
//       response: response.data,
//     });

//   } catch (error) {
//     console.error("❌ Error sending result to external service:", error.message);

//     if (error.response) {
//       console.error("⚠️ Response Data:", error.response.data);
//       console.error("⚠️ Response Status:", error.response.status);
//     }

//     res.status(500).json({ 
//       message: "Error sending result", 
//       error: error.message 
//     });
//   }
// });

router.post("/submit_result", async (req, res) => {
    try {
      let { result_user_id, result_test_id, result_score, result_poc_id, result_id } = req.body;
  
      // Set default values if missing
      result_id = result_id || uuidv4();
      result_user_id = result_user_id || "unknown_user";
      result_test_id = result_test_id || "unknown_test";
      result_score = result_score !== undefined ? result_score : 0; // If missing, set score to 0
      result_poc_id = result_poc_id || "unknown_poc";
  
      console.log("📨 Received result data:", {
        result_id,
        result_user_id,
        result_test_id,
        result_score,
        result_poc_id,
      });
  
      // Fetch service details from Consul
      const serviceName = "Express_Report";
      const services = await consul.catalog.service.nodes(serviceName);
  
      console.log("🔍 Retrieved services from Consul:", services);
  
      if (!services || services.length === 0) {
        console.error("❌ No available service instances found in Consul");
        return res.status(500).json({ message: "No available service instances found in Consul" });
      }
  
      // Use the first available service instance
      const { ServiceAddress, ServicePort } = services[0];
  
      console.log(`📡 Target Service: ${ServiceAddress}:${ServicePort}`);
  
      if (!ServiceAddress || !ServicePort) {
        console.error("❌ Invalid service details from Consul:", services[0]);
        return res.status(500).json({ message: "Invalid service details from Consul" });
      }
  
      const targetUrl = `http://${ServiceAddress}:${ServicePort}/results/post-result`;
      console.log(`🚀 Sending request to: ${targetUrl}`);
  
      // Send the result data to the external service
      const response = await axios.post(targetUrl, {
        result_id,
        result_user_id,
        result_test_id,
        result_score,
        result_poc_id,
      });
  
      console.log("✅ Response from external service:", response.data);
  
      res.status(200).json({
        message: "✅ Result sent successfully to external service",
        response: response.data,
      });
  
    } catch (error) {
      console.error("❌ Error sending result to external service:", error.message);
  
      if (error.response) {
        console.error("⚠️ Response Data:", error.response.data);
        console.error("⚠️ Response Status:", error.response.status);
      }
  
      res.status(500).json({
        message: "Error sending result",
        error: error.message,
      });
    }
  });
  



module.exports = router;
