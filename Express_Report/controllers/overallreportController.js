const express = require('express');
const router = express.Router();
const Training = require('../models/overallreport');
const Consul = require("consul");
const consul = new Consul();
const axios = require("axios");
const moment = require('moment');


const formatExecutionDates = (start, end) => {
  const startDate = moment(start, 'DD/MM/YYYY');
  const endDate = moment(end, 'DD/MM/YYYY');

  const startDay = startDate.format('dddd DD/MM/YYYY');
  const endDay = endDate.format('dddd DD/MM/YYYY');

  return `${startDay} - ${endDay}`;
};


//get data by using mod_poc_id
router.get("/get_by_poc_id/:module_poc_id", async (req, res) => {
  const { module_poc_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Poc');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }

    const service = result[0]; // 👈 safer to use 0
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/poc/get_poc_by_poc_id/${module_poc_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching poc by module ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});



// get data by using mod_id
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

//get expert details usng mod_id
router.get("/get_expert_by_mod_id/:mod_id", async (req, res) => {
  const { mod_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Poc');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }

    const service = result[0]; // 👈 safer to use 0
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/expert/get_expert/${mod_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching poc by module ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});
// Create

router.post('/', async (req, res) => {
  try {
    const { mod_id, mod_poc_id } = req.body;

    if (!mod_id || !mod_poc_id) {
      return res.status(400).json({ error: 'mod_id and mod_poc_id are required' });
    }

    // ======== 1. Fetch Module Data ========
    const modResult = await consul.catalog.service.nodes('Express_Mod');
    if (!modResult || modResult.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const modService = modResult[0];
    const modResponse = await axios.get(`http://${modService.Address || 'localhost'}:${modService.ServicePort}/modules/get_module_by_id/${mod_id}`);
    const modData = modResponse.data;

    if (!modData || !modData.mod_duration) {
      return res.status(404).json({ error: 'mod_duration not found in module data' });
    }

    const [start, end] = modData.mod_duration.split(' - ');
    const startDate = moment(start, 'DD/MM/YYYY');
    const endDate = moment(end, 'DD/MM/YYYY');

    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ error: 'Invalid mod_duration date format' });
    }

    const days = endDate.diff(startDate, 'days') + 1;
    const schedule = `${days} day${days > 1 ? 's' : ''}`;
    const executiondates = formatExecutionDates(start, end);

    // ======== 2. Fetch POC Data ========
    const pocResult = await consul.catalog.service.nodes('Express_Poc');
    if (!pocResult || pocResult.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }

    const pocService = pocResult[0];
    const pocResponse = await axios.get(`http://${pocService.Address || 'localhost'}:${pocService.ServicePort}/poc/get_poc_by_poc_id/${mod_poc_id}`);
    const pocData = pocResponse.data;

    const pointOfContact = {
      ...req.body.pointOfContact,
      name: pocData.mod_poc_name,
      role: pocData.mod_poc_role,
      email: pocData.mod_poc_email,
      contact: pocData.mod_poc_mobile
    };

    // ======== 3. Fetch Expert Data ========
    const expertResponse = await axios.get(`http://${pocService.Address || 'localhost'}:${pocService.ServicePort}/expert/get_expert/${mod_id}`);
    const expertData = expertResponse.data;

    const summary = req.body?.pointOfContact?.expertDetails?.summary || [];

    const expertDetails = [{
      name: expertData.mod_expert_name,
      role: expertData.mod_expert_role,
      company:expertData.mod_expert_company, // Update if available
      email: "N/A",        // Update if your expert schema supports it
      contact: expertData.mod_expert_mobile,
      summary
    }];

    // ======== 4. Final Training Document Creation ========
    const trainingData = {
      ...req.body,
      schedule,
      executiondates,
      pointOfContact,
      expertDetails
    };

    const training = new Training(trainingData);
    await training.save();

    console.log("Final Training Data:", trainingData);
    res.status(201).json(training);

  } catch (err) {
    console.error("Error creating training:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});



// Read All
router.get('/', async (req, res) => {
  try {
    const trainings = await Training.find();
    res.status(200).json(trainings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });
    res.status(200).json(training);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updatedTraining = await Training.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTraining) return res.status(404).json({ message: 'Training not found' });
    res.status(200).json(updatedTraining);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const result = await Training.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Training not found' });
    res.status(200).json({ message: 'Training deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
