const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
    test_mcq_id: { type: String, required: true, unique: true }, // Unique test ID for grouping MCQs
    mcqs: [
        {
            mcq_id: { type: String, required: true }, // Unique ID per question
            mcq_question: { type: String, required: true },
            mcq_options: [{ type: String, required: true }],
            mcq_answer: { type: String, required: true },
            mcq_tag: [{ type: String }]
        }
    ]
});
const MCQ = mongoose.model('MCQ', mcqSchema);
module.exports = MCQ;
