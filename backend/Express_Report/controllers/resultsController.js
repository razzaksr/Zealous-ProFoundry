const express = require("express");
const router = express.Router();
const Result = require("../models/results");
const { v4: uuidv4 } = require("uuid");

// **GET - Fetch All Results**
router.get("/get-result", async (req, res) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error });
  }
});

// **POST - Add a New Result**
router.post("/post-result", async (req, res) => {
  try {
    const { result_id, result_user_id, result_test_id, result_score, result_total_score, result_poc_id } = req.body;

    if (!result_id || !result_user_id || !result_test_id || result_score == null || result_total_score == null || !result_poc_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if result_id already exists to prevent duplication
    const existingResult = await Result.findOne({ result_id });
    if (existingResult) {
      return res.status(400).json({ message: "Result ID already exists" });
    }

    // Store in database
    const newResult = new Result({
      result_id,
      result_user_id,
      result_test_id,
      result_score,
      result_total_score,
      result_poc_id,
    });

    await newResult.save();

    res.status(201).json({ message: "✅ Result stored successfully", result: newResult });
  } catch (error) {
    console.error("❌ Error saving result:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// ✅ Helper function to fetch service URL from Consul
const getServiceUrl = async (serviceName) => {
  try {
    console.log(`🔍 Fetching service URL for: ${serviceName}`);

    const services = await consul.agent.service.list();
    if (!services[serviceName]) {
      console.error(`❌ Service ${serviceName} not found`);
      return null;
    }

    const { Address, Port } = services[serviceName];
    const serviceUrl = `http://${Address}:${Port}`;
    console.log(`✅ Found ${serviceName} at ${serviceUrl}`);
    return serviceUrl;
  } catch (err) {
    console.error(`❌ Error fetching ${serviceName} service URL:`, err.message);
    return null;
  }
};


// ✅ PUT - Update an existing result
router.put("/update-result", async (req, res) => {
  try {
    const { result_id, ...updateData } = req.body;

    if (!result_id) {
      return res.status(400).json({ message: "result_id is required for update" });
    }

    const updatedResult = await Result.findOneAndUpdate(
      { result_id },
      updateData,
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "✅ Result updated successfully", result: updatedResult });
  } catch (error) {
    res.status(500).json({ message: "Error updating result", error });
  }
});



// **DELETE - Remove a Result**
router.delete("/delete-by-result-id/:result_id", async (req, res) => {
  try {
    const { result_id } = req.params;

    const deletedResult = await Result.findOneAndDelete({ result_id });

    if (!deletedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "✅ Result deleted successfully", result: deletedResult });
  } catch (error) {
    res.status(500).json({ message: "Error deleting result", error });
  }
});


// **GET - Fetch Result Scores by result_user_id**
router.get("/get-result-by-user/:result_user_id", async (req, res) => {
  try {
    const { result_user_id } = req.params;
    const MAX_TOTAL_SCORE = 25; // Define total possible score

    // Find all results where result_user_id matches
    const results = await Result.find({ result_user_id }, "result_score");

    if (results.length === 0) {
      return res.status(404).json({ message: "No results found for this user" });
    }

    // Extract scores
    const scores = results.map((r) => r.result_score);

    // Compute total score
    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    // Compute percentage
    const percentage = ((totalScore / MAX_TOTAL_SCORE) * 100).toFixed(2);

    // Return response
    res.json({
      result_user_id,
      scores,
      total_score: totalScore,
      percentage: `${percentage}`
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching result scores", error });
  }
});


router.get('/results/check', async (req, res) => {
  try {
    const { user_id, test_id } = req.query;

    // Query your database to see if the result already exists
    const existingResult = await Result.findOne({
      result_user_id: user_id,
      result_test_id: test_id,
    });

    res.json({ exists: !!existingResult }); // true or false
  } catch (err) {
    console.error("Error checking for existing result:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;