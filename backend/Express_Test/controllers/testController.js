const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// Create Test
router.post('/create', async (req, res) => {
    try {
        const newTest = new Test(req.body);
        await newTest.save();
        res.status(201).json({ message: 'Test created successfully', test: newTest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Read All Tests
router.get('/all', async (req, res) => {
    try {
        const tests = await Test.find().populate('test_mcq_id');
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Test by test_id
router.get('/get', async (req, res) => {
    try {
        const { test_id } = req.body;
        const test = await Test.findOne({ test_id }).populate('test_mcq_id');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Test (Special Update: Add mcq_id and coding_test_id)
router.put('/update', async (req, res) => {
    try {
        const { test_id, mcq_id, coding_test_id } = req.body;

        const test = await Test.findOne({ test_id });
        if (!test) return res.status(404).json({ message: 'Test not found' });

        // Add only new MCQ IDs
        if (mcq_id) {
            const newMcqIds = Array.isArray(mcq_id) ? mcq_id : [mcq_id];
            test.test_mcq_id.push(...newMcqIds.filter(id => !test.test_mcq_id.includes(id)));
        }

        // Add only new Coding Test IDs
        if (coding_test_id) {
            const newCodingIds = Array.isArray(coding_test_id) ? coding_test_id : [coding_test_id];
            test.test_coding_id.push(...newCodingIds.filter(id => !test.test_coding_id.includes(id)));
        }

        await test.save();
        res.status(200).json({ message: 'Test updated successfully', test });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Delete Test
router.delete('/delete', async (req, res) => {
    try {
        const { test_id } = req.body;
        const test = await Test.findOneAndDelete({ test_id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
