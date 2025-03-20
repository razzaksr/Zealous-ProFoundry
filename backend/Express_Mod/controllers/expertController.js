const express = require('express');
const Expert = require('../models/Expert');

const router = express.Router();

// Create a new Expert
router.post('/add_expert', async (req, res) => {
    try {
        const expert = new Expert(req.body);
        await expert.save();
        res.status(201).send(expert);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all Experts
router.get('/read_all_experts', async (req, res) => {
    try {
        const experts = await Expert.find();
        res.send(experts);
    } catch (error) {
        res.status(500).send(error);
    }
});



// Get Expert details by poc_id
router.post('/get_expert_by_poc_id', async (req, res) => {
    try {
        const expert = await Expert.findOne({ poc_id: req.body.poc_id });
        if (!expert) return res.status(404).send({ message: 'Expert not found' });
        res.send(expert);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update Expert details
router.put('/update_expert', async (req, res) => {
    try {
        const updatedExpert = await Expert.findOneAndUpdate(
            { poc_id: req.body.poc_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedExpert) return res.status(404).send({ message: 'Expert not found' });
        res.send(updatedExpert);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Special Update: Find by poc_id and update mod_id
router.put('/update_expert_mod_id', async (req, res) => {
    try {
        const updatedExpert = await Expert.findOneAndUpdate(
            { poc_id: req.body.poc_id },  // Find by poc_id
            { mod_id: req.body.mod_id },  // Update mod_id
        );

        if (!updatedExpert) return res.status(404).send({ message: 'Expert not found' });
        res.send(updatedExpert);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete an Expert by poc_id
router.delete('/delete_expert_by_poc_id', async (req, res) => {
    try {
        const deletedExpert = await Expert.findOneAndDelete({ poc_id: req.body.poc_id });
        if (!deletedExpert) return res.status(404).send({ message: 'Expert not found' });
        res.send(deletedExpert);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
