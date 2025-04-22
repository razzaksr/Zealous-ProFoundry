const mongoose = require('mongoose');

// Summary for each day's training
const SummarySchema = new mongoose.Schema({
  day: { type: String, required: false },
  topicsCovered: { type: String, required: false },
  technicalTasksPerformed: { type: String, required: false },
  gitLink: { type: String, required: false },
  attendancePresent: { type: [String], required: false },  // Array of names or IDs
  attendanceAbsent: { type: [String], required: false },
}, { _id: false });



// Point of Contact schema (filled via mod_poc_id externally)
const PointOfContactSchema = new mongoose.Schema({
  name: { type: String, required: false },
  role: { type: String, required: false },
  email: { type: String, required: false },
  contact: { type: String, required: false },
  summary: { type: [SummarySchema], required: false }
}, { _id: false });

// Main Training Schema
const TrainingSchema = new mongoose.Schema({
  title: { type: String, required: false },
  background: { type: String, required: false },

  // IDs used to fetch actual data from other services
  mod_id: { type: String, required: false },
  mod_poc_id: { type: String, required: false },

  // These values can be fetched using `mod_id` in controller logic
  schedule: { type: String, required: false },
  executiondates: { type: String, required: false },

  scopeOfTheTraining: { type: String, required: false },
  pointOfContact: { type: PointOfContactSchema, required: false },
  totalStrength: { type: Number, required: false },

  
});

module.exports = mongoose.model('Training', TrainingSchema);
