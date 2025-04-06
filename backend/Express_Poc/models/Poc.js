const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const pocSchema = new mongoose.Schema({
  mod_id: {
    type: String,
    default: null, 
  },
  mod_poc_id: {
    type: String,
    default: uuidv4, 
    unique: true,
  },
  mod_poc_name: {
    type: String,
    required: true,
  },
  mod_poc_role: {
    type: String,
    required: true,
  },
  mod_poc_email: {
    type: String,
    required: true,
    unique: true
  },
  mod_poc_mobile: {
    type: String,
    required: true,
    unique: true,
  },
  mod_images: {
    type: [String],
    default: [],
  },
  mod_tests: {
    type: Array,
    default: {},
  },  
  mod_users: {
    type: [String],
    default: [],
  },
  attendance: {
    type: [Object], 
    default: [],
  },
  poc_certificate: {
    type: Boolean,
    default: false, // Default as false (0)
    required: false, // Not required while posting
  },
}, );

module.exports = mongoose.model("Poc", pocSchema);