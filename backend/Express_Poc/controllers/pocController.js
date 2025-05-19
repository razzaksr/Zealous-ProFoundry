const express = require("express");
const Poc = require("../models/Poc");
const Consul = require("consul");
const consul = new Consul();
const axios = require("axios");
const router = express.Router();
const moment = require('moment');




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

// get poc by mod_id

router.get('/get_poc_by_mod_id/:mod_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_id: req.params.mod_id });

    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_id} not found` });

    res.status(200).json(poc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC", error: error.message });
  }
});
// Get POC by mod_poc_id
router.get('/get_poc_by_poc_id/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });

    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });

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

    if (!updatedPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    res.json(updatedPoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a test to a POC
router.put("/update_test", async (req, res) => {
  try {
    const { mod_poc_id, test_id } = req.body;

    if (!mod_poc_id || !test_id || (Array.isArray(test_id) && test_id.length === 0)) {
      return res.status(400).json({ message: "mod_poc_id and at least one test_id are required" });
    }

    // Convert test_id to an array if it's a single string
    const testIds = Array.isArray(test_id) ? test_id : [test_id];

    // Fetch the POC
    const poc = await Poc.findOne({ mod_poc_id });

    if (!poc) {
      return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });
    }

    // Ensure mod_tests is an object
    if (!poc.mod_tests || typeof poc.mod_tests !== 'object' || Array.isArray(poc.mod_tests)) {
      poc.mod_tests = {};
    }

    // Get existing test IDs
    const existingTestIds = new Set(Object.values(poc.mod_tests));

    // Filter out duplicates
    const newTestIds = testIds.filter(id => !existingTestIds.has(id));

    if (newTestIds.length === 0) {
      return res.status(400).json({ message: "All provided test IDs already exist in mod_tests" });
    }

    // Determine the next available day numbers
    const dayNumbers = Object.keys(poc.mod_tests)
      .map(day => parseInt(day.replace("Day ", ""), 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);

    let nextDayNumber = (dayNumbers.length > 0 ? Math.max(...dayNumbers) : 0) + 1;

    // Assign new test IDs to available "Day X" keys
    const updates = {};
    newTestIds.forEach(id => {
      updates[`mod_tests.Day ${nextDayNumber}`] = id;
      nextDayNumber++;
    });

    // Update the document
    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Test(s) added successfully", updatedPoc });
  } catch (error) {
    console.error("Error updating mod_tests:", error);
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

    const poc = await Poc.findOne({ mod_poc_id });

    if (!poc) {
      return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });
    }

    poc.mod_tests = {};
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

    if (!updatedPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    res.json(updatedPoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a POC
router.delete("/delete_poc/:mod_poc_id", async (req, res) => {
  try {
    const deletedPoc = await Poc.findOneAndDelete({ mod_poc_id: req.params.mod_poc_id });

    if (!deletedPoc) return res.status(404).send({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.send({ message: "POC deleted successfully", deletedPoc });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Module ID by User ID
router.get("/mod_by_user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id");

    if (!module) {
      return res.status(404).json({ error: `No module found for user with ID ${user_id}` });
    }

    res.json({ mod_id: module.mod_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get Module and POC Name AND TEST ID by User ID
router.get("/mod_and_poc/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find the module where `mod_users` contains `user_id`
    const module = await Poc.findOne(
      { mod_users: user_id },
      "mod_id mod_poc_id mod_poc_name mod_tests"
    );

    if (!module) {
      return res.status(404).json({ error: `No module found for user with ID ${user_id}` });
    }

    // Extract test IDs from mod_tests object
    const test_ids = module.mod_tests ? Object.values(module.mod_tests) : [];

    res.status(200).json({
      mod_id: module.mod_id,
      mod_poc_id: module.mod_poc_id, // Added mod_poc_id
      mod_poc_name: module.mod_poc_name,
      test_ids, // Returning an array of test IDs
    });
  } catch (err) {
    console.error(" Error fetching module data:", err);
    res.status(500).json({ error: err.message });
  }
});


// Get poc_certificate by mod_id
router.get('/get_poc_certificate_by_mod_id/:mod_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_id: req.params.mod_id });

    if (!poc) {
      return res.status(404).json({ message: `POC with Module ID ${req.params.mod_id} not found` });
    }

    // Return the poc_certificate field
    res.status(200).json({ poc_certificate: poc.poc_certificate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching poc_certificate", error: error.message });
  }
});

//////         reports //////////////

// Get POC report by mod_poc_id
router.get("/get_poc_report_by_poc_id/:mod_poc_id", async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id }, { report: 1, _id: 0 });
    if (!poc || !poc.report) {
      return res.status(404).json({ message: `POC with ID ${mod_poc_id} or report not found` });
    }

    res.status(200).json({
      report: {
        title: poc.report.title || "",
        background: poc.report.background || "",
        address: poc.report.address || "",
        mod_id: poc.report.mod_id || "",
        mod_poc_id: poc.report.mod_poc_id || "",
        schedule: poc.report.schedule || "",
        totalStrength: poc.report.totalStrength || "",
        executiondates: poc.report.executiondates || "",
        scopeOfTheTraining: poc.report.scopeOfTheTraining || "",
        pointOfContact: poc.report.pointOfContact || {},
        expertDetails: poc.report.expertDetails || {},
        student_ranking: poc.report.student_ranking || [],
        summary: poc.report.summary || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error: error.message });
  }
});

//get
 router.get("/get-by-mod-id/:mod_id", async (req, res) => {
  const { mod_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Mod');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/modules/get_module_by_id/${mod_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching module by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});


router.get("/get_expert_using_poc/:mod_poc_id", async (req, res) => {
  const { mod_poc_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Poc');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/expert/get_expert_poc_id/${mod_poc_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching module by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});
/// GET TEST NAME 
router.get("/get_test_name/:mod_tests", async (req, res) => {
  const { mod_tests } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Test');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_test service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/test/get_by_test_id/${mod_tests}`);

    // Extract and send only the test_name
    const { test_name } = response.data;
    res.json({ test_name });

  } catch (err) {
    console.error("Error fetching test by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});




router.get('/get_poc/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });

    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.status(200).json(poc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC", error: error.message });
  }
});

//////////////////////////////////////////


const formatExecutionDates = (start, end) => {
  const startDate = moment(start, "DD/MM/YYYY");
  const endDate = moment(end, "DD/MM/YYYY");

  const startDay = startDate.format("dddd DD/MM/YYYY");
  const endDay = endDate.format("dddd DD/MM/YYYY");

  return `${startDay} - ${endDay}`;
};
 // Assuming you have your Poc model

// PUT /generate_report/:mod_poc_id



router.put('/generate_report/:mod_poc_id', async (req, res) => {
  const { mod_poc_id } = req.params;
  const { summary, title, background,address,scopeOfTheTraining, totalStrength, company, email, student_ranking } = req.body;

  try {
    // 1. Fetch POC service info
    const pocService = await consul.catalog.service.nodes("Express_Poc");
    if (!pocService || pocService.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }
    const serviceAddress = pocService[0].Address;
    const servicePort = pocService[0].ServicePort;

    // 2. Get POC data
    const pocUrl = `http://${serviceAddress}:${servicePort}/poc/get_poc/${mod_poc_id}`;
    const pocResponse = await axios.get(pocUrl);
    const poc = pocResponse.data;

    if (!poc) {
      return res.status(404).json({ error: "POC not found" });
    }

    const { mod_id, mod_poc_name, mod_poc_role, mod_poc_email, mod_poc_mobile, mod_tests } = poc;

    // 3. Get Module data
    const modService = await consul.catalog.service.nodes("Express_Mod");
    if (!modService || modService.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }
    const modServiceAddress = modService[0].Address;
    const modServicePort = modService[0].ServicePort;

    const modUrl = `http://${modServiceAddress}:${modServicePort}/modules/get_module_by_id/${mod_id}`;
    const modResponse = await axios.get(modUrl);
    const modData = modResponse.data;

    // 4. Format dates
    const [start, end] = modData.mod_duration.split(" - ");
    const executiondates = formatExecutionDates(start, end);
    const startDate = moment(start, "DD/MM/YYYY");
    const endDate = moment(end, "DD/MM/YYYY");
    const durationDays = endDate.diff(startDate, "days") + 1;
    const schedule = `${durationDays} ${durationDays === 1 ? "day" : "days"}`;

    // 5. Get Expert details
    const expertUrl = `http://${serviceAddress}:${servicePort}/poc/get_expert_using_poc/${mod_poc_id}`;
    const expertResponse = await axios.get(expertUrl);
    const expertData = expertResponse.data;

    const expertDetails = {
      name: expertData.mod_expert_name || "N/A",
      role: expertData.mod_expert_role || "N/A",
      company: company || expertData.mod_expert_company || "N/A",
      email: email || expertData.mod_expert_email || "N/A",
      contact: expertData.mod_expert_mobile || "N/A"
    };

    // 6. Fetch test names from mod_tests
    let test_details = [];

    if (mod_tests && Object.keys(mod_tests).length > 0) {
      const testService = await consul.catalog.service.nodes("Express_Test");
      if (!testService || testService.length === 0) {
        return res.status(404).json({ error: "Express_Test service not found in Consul" });
      }
    
      const testServiceAddress = testService[0].Address;
      const testServicePort = testService[0].ServicePort;
    
      // Extract test IDs properly
      const testIds = Object.values(mod_tests).map(test => test.test_id);
    
      for (const testId of testIds) {
        if (!testId) {
          console.warn(`Skipping invalid test ID:`, testId);
          continue;
        }
    
        try {
          const response = await axios.get(`http://${testServiceAddress}:${testServicePort}/test/get_by_test_id/${testId}`);
          if (response.data && response.data.test_name) {
            test_details.push(response.data.test_name);
          }
        } catch (err) {
          console.error(`Failed to fetch test name for test ID ${testId}:`, err.message);
        }
      }
    }
    
    console.log("Fetched Test Details:", test_details);
    
    

    // 7. Create Point of Contact block
    const pointOfContact = {
      name: mod_poc_name || "N/A",
      role: mod_poc_role || "N/A",
      email: mod_poc_email || "N/A",
      contact: mod_poc_mobile || "N/A",
      test_details: [...test_details],
      summary: summary || []
    };
  

    // ----------------------
    // 8. Process update
    // ----------------------

    let updateFields = {};

    if (student_ranking) {
      const processedStudentRanking = Array.isArray(student_ranking) ? student_ranking : [student_ranking];
      updateFields['report.student_ranking'] = processedStudentRanking;
    }

    if (summary || title || background ||address || scopeOfTheTraining || totalStrength || company || email) {
      updateFields['report.title'] = title;
      updateFields['report.background'] = background;
      updateFields['report.address'] = address;
      updateFields['report.mod_id'] = mod_id;
      updateFields['report.mod_poc_id'] = mod_poc_id;
      updateFields['report.schedule'] = schedule;
      updateFields['report.executiondates'] = executiondates;
      updateFields['report.scopeOfTheTraining'] = scopeOfTheTraining;
      updateFields['report.expertDetails'] = expertDetails;
      updateFields['report.pointOfContact'] = pointOfContact;
      updateFields['report.totalStrength'] = Number(totalStrength) || 0;
    }

    const updated = await Poc.findOneAndUpdate(
      { mod_poc_id },
      { $set: updateFields },
      { new: true }
    );

    // 9. Return result
    res.status(200).json({
      message: "Report generated successfully",
      reportData: {
        mod_id,
        pocDetails: {
          mod_poc_name,
          mod_poc_role,
          mod_poc_email,
          mod_poc_mobile,
        },
        moduleDetails: modData,
        expertDetails,
        updatedReport: updated.report,
        userCount: totalStrength || "N/A"
      }
    });

  } catch (err) {
    console.error("Error generating report:", err.message);
    res.status(500).json({
      error: "Unexpected error",
      details: err.message
    });
  }
});



// Add this new endpoint to your backend
router.get('/poc/report/:mod_poc_id', async (req, res) => {
  const { mod_poc_id } = req.params;

  try {
    // Reuse the same data fetching logic from your PUT endpoint
    // ... [fetch POC details, module details, expert details] ...

    // Return the data in the same structure as your PUT endpoint
    res.status(200).json({
      mod_id,
      pocDetails: {
        mod_poc_name,
        mod_poc_role,
        mod_poc_email,
        mod_poc_mobile
      },
      moduleDetails: modData,
      expertDetails,
      updatedReport: pocData.report, // Assuming report data is stored in the POC document
      userCount: mod_users.length
    });
  } catch (err) {
    console.error("Error fetching report data:", err.message);
    res.status(500).json({
      error: "Unexpected error",
      details: err.message
    });
  }
});










module.exports = router;