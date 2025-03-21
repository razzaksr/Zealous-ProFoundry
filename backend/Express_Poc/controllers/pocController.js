const express = require('express');
const Poc = require('../models/Poc');

const router = express.Router();

// Create a new POC
router.post('/add_poc', async (req, res) => {
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
        res.send(pocs);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Get POC by mod_poc_id (Now using URL parameter)
router.get('/get_poc_by_poc_id/:mod_poc_id', async (req, res) => {
    try {
        const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });

        if (!poc) return res.status(404).send({ message: 'POC not found' });
        res.send(poc);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Update POC details (using mod_poc_id as a URL parameter)
router.put('/update_poc/:mod_poc_id', async (req, res) => {
    try {
        const updatedPoc = await Poc.findOneAndUpdate(
            { mod_poc_id: req.params.mod_poc_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedPoc) return res.status(404).send({ message: 'POC not found' });
        res.send(updatedPoc);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update only mod_tests and mod_users
router.put('/update_mod_field/:mod_poc_id', async (req, res) => {
    try {
        const updatedPoc = await Poc.findOneAndUpdate(
            { mod_poc_id: req.params.mod_poc_id },
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

// Delete a POC by mod_poc_id (Now using URL parameter)
router.delete('/delete_poc/:mod_poc_id', async (req, res) => {
    try {
        const deletedPoc = await Poc.findOneAndDelete({ mod_poc_id: req.params.mod_poc_id });
        if (!deletedPoc) return res.status(404).send({ message: 'POC not found' });
        res.send({ message: 'POC deleted successfully', deletedPoc });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
