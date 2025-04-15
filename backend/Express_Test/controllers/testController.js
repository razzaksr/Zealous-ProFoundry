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

// Get All Tests
router.get('/all', async (req, res) => {
    try {
        const tests = await Test.find();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get only active tests (auto-disable after 24 hrs)
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const activeTests = await Test.find({ status: 'active', activeAt: { $ne: null } });

        const validTests = [];
        const expiredTests = [];

        for (const test of activeTests) {
            const timeDiff = now - new Date(test.activeAt);
            const hoursPassed = timeDiff / (1000 * 60 * 60);

            if (hoursPassed <= 24) {
                validTests.push(test);
            } else {
                // Auto-disable expired tests
                test.status = 'disabled';
                test.activeAt = null;
                await test.save();
                expiredTests.push(test.test_id);
            }
        }

        res.status(200).json({ active_tests: validTests, auto_disabled: expiredTests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Test by test_id
router.get('/get_by_test_id/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        const test = await Test.findOne({ test_id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Test (add mcq and coding ids)
router.put('/update', async (req, res) => {
    try {
        const { test_id, mcq_id, coding_test_id, ...updateData } = req.body;

        if (!test_id) {
            return res.status(400).json({ success: false, msg: "test_id is required" });
        }

        const test = await Test.findOne({ test_id });
        if (!test) {
            return res.status(404).json({ success: false, msg: "Test not found" });
        }

        // Update MCQ IDs
        if (mcq_id) {
            const newMcqIds = Array.isArray(mcq_id) ? mcq_id : [mcq_id];
            test.test_mcq_id = [...new Set([...test.test_mcq_id, ...newMcqIds])];
        }

        // Update Coding Test IDs
        if (coding_test_id) {
            const newCodingIds = Array.isArray(coding_test_id) ? coding_test_id : [coding_test_id];
            test.test_coding_id = [...new Set([...test.test_coding_id, ...newCodingIds])];
        }

        // Update other fields
        Object.assign(test, updateData);

        await test.save();

        res.status(200).json({ success: true, msg: "Test updated successfully", test });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, msg: "Server Error", error: error.message });
    }
});

// Toggle Test Status (active/disabled)
router.put('/toggle_status', async (req, res) => {
    try {
        const { test_id, status } = req.body;

        if (!test_id || !['active', 'disabled'].includes(status)) {
            return res.status(400).json({ message: 'test_id and valid status (active or disabled) are required' });
        }

        const updatedTest = await Test.findOneAndUpdate(
            { test_id },
            {
                $set: {
                    status,
                    activeAt: status === 'active' ? new Date() : null
                }
            },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.status(200).json({ message: `Test status set to '${status}'`, test: updatedTest });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

// Remove MCQ from Test
router.put('/remove_mcq_from_test', async (req, res) => {
    try {
        const { test_id, mcq_id } = req.body;

        if (!test_id || !mcq_id) {
            return res.status(400).json({ error: "test_id and mcq_id are required" });
        }

        const updatedTest = await Test.findOneAndUpdate(
            { test_id },
            { $pull: { test_mcq_id: mcq_id } },
            { new: true }
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
