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

router.get("/read_all_poc", async (req, res) => {
    try {
        const allPocs = await Poc.find();

        if (!allPocs || allPocs.length === 0) {
            return res.status(404).json({ message: "No POCs found" });
        }

        // Get test service details from Consul
        const services = await consul.agent.service.list();
        const testService = Object.values(services).find(service => service.Service === TEST_SERVICE_NAME);
        const userService = Object.values(services).find(service => service.Service === USER_SERVICE_NAME);

        if (!testService) {
            return res.status(500).json({ message: "Test service not registered in Consul" });
        }
        if (!userService) {
            return res.status(500).json({ message: "User service not registered in Consul" });
        }

        // Fetch test details and user details for each POC
        const enrichedPocs = await Promise.all(
            allPocs.map(async (poc) => {
                // Fetch test details
                let testDetails = [];
                if (poc.mod_tests && poc.mod_tests.length > 0) {
                    const testRequests = poc.mod_tests.map(async (testId) => {
                        try {
                            const response = await axios.get(`http://${testService.Address}:${testService.Port}/test/get_by_test_id/${testId}`);
                            return response.data;
                        } catch (error) {
                            console.error(`Error fetching test ${testId}:`, error.message);
                            return null;
                        }
                    });

                    const testResults = await Promise.allSettled(testRequests);
                    testDetails = testResults
                        .filter(result => result.status === "fulfilled" && result.value)
                        .map(result => result.value);
                }

                // Fetch user details
                let userDetails = [];
                if (poc.mod_users && poc.mod_users.length > 0) {
                    const userRequests = poc.mod_users.map(async (userId) => {
                        try {
                            const response = await axios.get(`http://${userService.Address}:${userService.Port}/user/get_user_by_id/${userId}`);
                            return response.data;
                        } catch (error) {
                            console.error(`Error fetching user ${userId}:`, error.message);
                            return null;
                        }
                    });

                    const userResults = await Promise.allSettled(userRequests);
                    userDetails = userResults
                        .filter(result => result.status === "fulfilled" && result.value)
                        .map(result => result.value);
                }

                return { ...poc.toObject(), mod_tests: testDetails, mod_users: userDetails };
            })
        );

        res.json({ POCs: enrichedPocs });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Get POC by mod_poc_id

router.get("/get_poc_by_poc_id/:mod_poc_id", async (req, res) => {
    try {
        const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });

        if (!poc) return res.status(404).json({ message: "POC not found" });

        // Get test service details from Consul
        const services = await consul.agent.service.list();
        const testService = Object.values(services).find(service => service.Service === TEST_SERVICE_NAME);
        const userService = Object.values(services).find(service => service.Service === USER_SERVICE_NAME);

        if (!testService) {
            return res.status(500).json({ message: "Test service not registered in Consul" });
        }
        if (!userService) {
            return res.status(500).json({ message: "User service not registered in Consul" });
        }

        // Fetch test details
        let testDetails = [];
        if (poc.mod_tests && poc.mod_tests.length > 0) {
            const testRequests = poc.mod_tests.map(async (testId) => {
                try {
                    const response = await axios.get(`http://${testService.Address}:${testService.Port}/test/get_by_test_id/${testId}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching test ${testId}:`, error.message);
                    return null;
                }
            });

            const testResults = await Promise.allSettled(testRequests);
            testDetails = testResults
                .filter(result => result.status === "fulfilled" && result.value)
                .map(result => result.value);
        }

        // Fetch user details
        let userDetails = [];
        if (poc.mod_users && poc.mod_users.length > 0) {
            const userRequests = poc.mod_users.map(async (userId) => {
                try {
                    const response = await axios.get(`http://${userService.Address}:${userService.Port}/user/get_user_by_id/${userId}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching user ${userId}:`, error.message);
                    return null;
                }
            });

            const userResults = await Promise.allSettled(userRequests);
            userDetails = userResults
                .filter(result => result.status === "fulfilled" && result.value)
                .map(result => result.value);
        }

        const updatedPoc = { ...poc.toObject(), mod_tests: testDetails, mod_users: userDetails };

        res.json({ POC: updatedPoc });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

  

// Update POC details
router.put("/update_poc/:mod_poc_id", async (req, res) => {
  try {
    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id: req.params.mod_poc_id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPoc) return res.status(404).send({ message: "POC not found" });

    res.send(updatedPoc);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update only mod_tests and mod_users
router.put("/update_mod_field/:mod_poc_id", async (req, res) => {
  try {
    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id: req.params.mod_poc_id },
      {
        mod_tests: req.body.mod_tests,
        mod_users: req.body.mod_users,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPoc) return res.status(404).send({ message: "POC not found" });

    res.send(updatedPoc);
  } catch (error) {
    res.status(400).send(error);
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
