const express = require('express');
const Poc = require('../models/Poc');

const router = express.Router();

// Create a new POC
router.post('/add_pocs', async (req, res) => {
    try {
        const poc = new Poc(req.body);
        await poc.save();
        res.status(201).send(poc);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all POCs
router.get('/read_all_pocs', async (req, res) => {
    try {
        const pocs = await Poc.find();
        res.send(pocs);
    } catch (error) {
        console.error("Error fetching all POCs:", error);  // Log the error
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Get POC details by mod_id
router.post('/get_pocs_by_mod_id', async (req, res) => {
    try {
        console.log("Request body:", req.body);  // Log request body
        const poc = await Poc.findOne({ mod_id: req.body.mod_id });
        
        if (!poc) {
            console.log("POC not found for mod_id:", req.body.mod_id);
            return res.status(404).send({ message: 'POC not found' });
        }
        
        res.send(poc);
    } catch (error) {
        console.error("Error fetching POC by mod_id:", error);  // Log the error
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Update POC details
router.put('/update_pocs', async (req, res) => {
    try {
        const updatedPoc = await Poc.findOneAndUpdate(
            { mod_id: req.body.mod_id },
            req.body,
            { new: true, runValidators: true }
        ).populate('mod_tests mod_users');

        if (!updatedPoc) return res.status(404).send({ message: 'POC not found' });
        res.send(updatedPoc);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update only mod_tests and mod_users
router.put('/update_mod_fields', async (req, res) => {
    try {
        const updatedPoc = await Poc.findOneAndUpdate(
            { mod_id: req.body.mod_id },
            { 
                mod_tests: req.body.mod_tests,
                mod_users: req.body.mod_users
            },
            { new: true, runValidators: true }
        );

        if (!updatedPoc) return res.status(404).send({ message: 'POC not found' });
        res.send(updatedPoc);
    } catch (error) {
        res.status(400).send(error);
    }
});


// Delete a POC by mod_id
router.delete('/delete_pocs', async (req, res) => {
    try {
        const deletedPoc = await Poc.findOneAndDelete({ mod_id: req.body.mod_id });
        if (!deletedPoc) return res.status(404).send({ message: 'POC not found' });
        res.send(deletedPoc);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
