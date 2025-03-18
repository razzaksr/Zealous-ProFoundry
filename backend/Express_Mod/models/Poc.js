const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const pocSchema = new mongoose.Schema({
    mod_id: {
        type: String,
        default: uuidv4, // Automatically generates a unique ID
        unique: true,
      },
    mod_poc_name: { type: String,
         required: true },
    mod_poc_role: { type: String,
         required: true },
    mod_poc_email: { type: String, 
        required: true,
         unique: true },
    mod_poc_mobile: { type: String, 
        required: true },
    mod_images: [{ type: String }],
    mod_tests: [{ type: String, }],
    mod_users: [{ type: String }]
});

const Poc = mongoose.model('Poc', pocSchema);
module.exports = Poc;