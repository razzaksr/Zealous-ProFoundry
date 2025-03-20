const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const expertSchema = new mongoose.Schema({
    poc_id: {
        type: String,
        default: uuidv4,  // Auto-generate UUID for poc_id
        unique: true
    },
    mod_id: {
        type: String
    },
    mod_expert_name: {
        type: String,
        required: true
    },
    mod_expert_mobile: {
        type: String,
        required: true
    },
    mod_expert_role: {
        type: String,
        required: true
    },
    mod_expert_profile: {
        type: String, // URL string
        required: true
    }
});

const Expert = mongoose.model('Expert', expertSchema);
module.exports = Expert;
