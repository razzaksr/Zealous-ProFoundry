const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const testSchema = new mongoose.Schema({
    test_id: { type: String, default: uuidv4, unique: true },  // User-provided test_id
    test_name: { type: String, required: true },
    test_language: { type: String, required: true },
    test_total_score: { type: Number, required: true },
    test_mcq_id: [{ type: String }],  
    test_coding_id: [{ type: String }] // Keep as String
});
const Test = mongoose.model('Test', testSchema);
module.exports = Test;
