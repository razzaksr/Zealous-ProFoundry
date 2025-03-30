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
router.get('/get_by_test_id/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params; // Retrieve test_id from the URL parameters
        const test = await Test.findOne({ test_id }).populate('test_mcq_id');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/update', async (req, res) => {
    try {
        const { test_id, mcq_id, coding_test_id, ...updateData } = req.body;

        if (!test_id) {
            return res.status(400).json({ success: false, msg: "test_id is required" });
        }

        // Find the test by ID
        const test = await Test.findOne({ test_id });
        if (!test) {
            return res.status(404).json({ success: false, msg: "Test not found" });
        }

        // ✅ Update MCQ IDs (prevent duplicates)
        if (mcq_id) {
            const newMcqIds = Array.isArray(mcq_id) ? mcq_id : [mcq_id];
            test.test_mcq_id = [...new Set([...test.test_mcq_id, ...newMcqIds])];
        }

        // ✅ Update Coding Test IDs (prevent duplicates)
        if (coding_test_id) {
            const newCodingIds = Array.isArray(coding_test_id) ? coding_test_id : [coding_test_id];
            test.test_coding_id = [...new Set([...test.test_coding_id, ...newCodingIds])];
        }

        // ✅ Update other test details
        Object.assign(test, updateData);

        // ✅ Save the updated test
        await test.save();

        res.status(200).json({ success: true, msg: "Test updated successfully", test });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, msg: "Server Error", error: error.message });
    }
});



// Delete Test
router.delete('/delete/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        const test = await Test.findOneAndDelete({ test_id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove MCQ from Test using test_id and mcq_id
router.put('/remove_mcq_from_test', async (req, res) => {
    try {
        const { test_id, mcq_id } = req.body; // Extract test_id and mcq_id from the request body

        if (!test_id || !mcq_id) {
            return res.status(400).json({ error: "test_id and mcq_id are required" });
        }

        const updatedTest = await Test.findOneAndUpdate(
            { test_id }, // Find the test by test_id
            { $pull: { test_mcq_id: mcq_id } }, // Remove the specified mcq_id from the array
            { new: true } // Return the updated document
        );

        if (!updatedTest) {
            return res.status(404).json({ message: "Test not found" });
        }

        res.status(200).json({ message: "MCQ removed successfully", test: updatedTest });
    } catch (error) {
        console.error("Error removing MCQ:", error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
