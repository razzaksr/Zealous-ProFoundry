const express = require('express');
const MCQ = require('../models/MCQ');

const router = express.Router();

// Create MCQ
router.post('/add_mcq', async (req, res) => {
    try {
        const newMCQ = new MCQ(req.body);
        await newMCQ.save();
        res.status(201).json(newMCQ);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read all MCQs
router.get('/get_all_mcqs', async (req, res) => {
    try {
        const mcqs = await MCQ.find(req.body);
        res.status(200).json(mcqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update MCQ
router.put('/update_mcq', async (req, res) => {
    try {
        const updatedMCQ = await MCQ.findOneAndUpdate({ test_mcq_id: req.body.test_mcq_id }, req.body, { new: true });
        if (!updatedMCQ) return res.status(404).json({ message: 'MCQ not found' });
        res.status(200).json(updatedMCQ);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete MCQ
router.delete('/remove_mcq', async (req, res) => {
    try {
        const deletedMCQ = await MCQ.findOneAndDelete({ test_mcq_id: req.body.test_mcq_id });
        if (!deletedMCQ) return res.status(404).json({ message: 'MCQ not found' });
        res.status(200).json({ message: 'MCQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
