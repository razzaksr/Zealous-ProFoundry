const express = require("express");
const router = express.Router();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Consul = require("consul");
const consul = new Consul(); // ✅ Correct initialization

router.post("/submit_result", async (req, res) => {
  try {
    const { result_user_id, result_test_id, result_score, result_poc_id, result_id } = req.body;

    // Fetch service details from Consul
    const serviceName = "Express_Report";
    const services = await consul.catalog.service.nodes(serviceName);
    
    console.log("🔍 Retrieved services from Consul:", services); // Log Consul services

    if (!services || services.length === 0) {
      console.error("❌ No available service instances found in Consul");
      return res.status(500).json({ message: "No available service instances found in Consul" });
    }

    // Use the first available service instance
    const { ServiceAddress, ServicePort } = services[0];

    console.log(`📡 Target Service: ${ServiceAddress}:${ServicePort}`); // Log target URL

    if (!ServiceAddress || !ServicePort) {
      console.error("❌ Invalid service details from Consul:", services[0]);
      return res.status(500).json({ message: "Invalid service details from Consul" });
    }

    const targetUrl = `http://${ServiceAddress}:${ServicePort}/results/post-result`;
    console.log(`🚀 Sending request to: ${targetUrl}`); // Log the exact request URL

    // Send the result data to the external service
    const response = await axios.post(targetUrl, {
      result_id: result_id || uuidv4(),
      result_user_id,
      result_test_id,
      result_score,
      result_poc_id,
    });

    console.log("✅ Response from external service:", response.data); // Log response

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
      error: error.message 
    });
  }
});

module.exports = router;
