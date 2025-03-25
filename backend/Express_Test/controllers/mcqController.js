const express = require('express');
const MCQ = require('../models/MCQ');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();


/**
 * @route POST /add_mcq
 * @desc Create a test with MCQs and auto-increment mcq_id
 */
router.post('/add_mcq', async (req, res) => {
    try {
        const mcqData = req.body.mcqs;

        if (!Array.isArray(mcqData) || mcqData.length === 0) {
            return res.status(400).json({ error: "Invalid input. Expecting a non-empty array of MCQs." });
        }

        // Get the latest test from DB to find last mcq_id
        let lastTest = await MCQ.findOne().sort({ "mcqs.mcq_id": -1 });

        let lastMcqId = lastTest && lastTest.mcqs.length > 0 ? lastTest.mcqs[lastTest.mcqs.length - 1].mcq_id : 0;

        const testMcqId = Date.now().toString(); // Unique test ID
        const mcqsWithId = mcqData.map((mcq, index) => ({
            ...mcq,
            mcq_id: lastMcqId + index + 1 // Auto-increment mcq_id
        }));

        const newTest = new MCQ({ test_mcq_id: testMcqId, mcqs: mcqsWithId });
        await newTest.save();

        res.status(201).json({ test_mcq_id: testMcqId, mcqs: mcqsWithId });
    } catch (error) {
        console.error("Insertion Error:", error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * @route GET /get_all_mcqs
 * @desc Fetch all tests with their MCQs
 */
router.get('/get_all_mcqs', async (req, res) => {
    try {
        const tests = await MCQ.find({});
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @route GET /get_mcqs_by_test_id/:test_mcq_id
 * @desc Fetch all MCQs for a specific test ID
 */
router.get('/get_mcqs_by_test_id/:test_mcq_id', async (req, res) => {
    try {
        const { test_mcq_id } = req.params;
        const test = await MCQ.findOne({ test_mcq_id });

        if (!test) {
            return res.status(404).json({ message: `No MCQs found for test_mcq_id: ${test_mcq_id}` });
        }

        res.status(200).json(test.mcqs);
    } catch (error) {
        console.error("Error fetching MCQs:", error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * @route PUT /update_mcq
 * @desc Update MCQs for a specific test_mcq_id
 */
router.put('/update_mcq', async (req, res) => {
    try {
        const { test_mcq_id, mcqs } = req.body;

        if (!test_mcq_id || !Array.isArray(mcqs) || mcqs.length === 0) {
            return res.status(400).json({ error: "Invalid input. test_mcq_id and MCQs array required." });
        }

        const updatedTest = await MCQ.findOneAndUpdate(
            { test_mcq_id },
            { mcqs },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ message: "Test not found" });
        }

        res.status(200).json(updatedTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


/**
 * @route DELETE /remove_mcq
 * @desc Delete an entire test using test_mcq_id
 */
router.delete('/remove_mcq', async (req, res) => {
    try {
        const { test_mcq_id } = req.body;

        if (!test_mcq_id) {
            return res.status(400).json({ error: "test_mcq_id is required for deletion" });
        }

        const deletedTest = await MCQ.deleteOne({ test_mcq_id });

        if (deletedTest.deletedCount === 0) {
            return res.status(404).json({ message: "Test not found" });
        }

        res.status(200).json({ message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



/**
 * @route POST /submit_answers
 * @desc Submit answers and return score
 */
router.post('/submit_answers', async (req, res) => {
    try {
        const { test_mcq_id, answers } = req.body;

        if (!test_mcq_id || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "Invalid input. test_mcq_id and answers array are required." });
        }

        const test = await MCQ.findOne({ test_mcq_id });

        if (!test) {
            return res.status(404).json({ message: `No MCQs found for test_mcq_id: ${test_mcq_id}` });
        }

        let score = 0;
        let results = [];

        test.mcqs.forEach(mcq => {
            const userAnswer = answers.find(ans => ans.mcq_id === mcq.mcq_id);

            if (userAnswer) {
                const isCorrect = userAnswer.answer === mcq.mcq_answer;
                if (isCorrect) score++;

                results.push({
                    mcq_id: mcq.mcq_id,
                    question: mcq.mcq_question,
                    user_answer: userAnswer.answer,
                    correct_answer: mcq.mcq_answer,
                    is_correct: isCorrect
                });
            }
        });

        res.status(200).json({ score, total: test.mcqs.length, results });
    } catch (error) {
        console.error("Error submitting answers:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; // ✅ Exports only the router function
