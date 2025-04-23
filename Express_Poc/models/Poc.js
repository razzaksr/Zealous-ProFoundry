const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Summary for each day's training
const SummarySchema = new mongoose.Schema({
  day: { type: String, required: false },
  topicsCovered: { type: String, required: false },
  technicalTasksPerformed: { type: String, required: false },
  gitLink: { type: String, required: false },
  attendancePresent: { type: [String], required: false },
  attendanceAbsent: { type: [String], required: false },
}, { _id: false });

// Point of Contact schema
const PointOfContactSchema = new mongoose.Schema({
  name: { type: String, required: false },
  role: { type: String, required: false },
  email: { type: String, required: false },
  contact: { type: String, required: false },
  
  summary: { type: [SummarySchema], required: false }
}, { _id: false });

// Expert details schema (updated to use as a single object)
const ExpertDetailsSchema = new mongoose.Schema({
  name: { type: String, required: false },
  role: { type: String, required: false },
  company: { type: String, required: false },
  email: { type: String, required: false },
  contact: { type: String, required: false },
}, { _id: false });

// Report schema (based on your TrainingSchema, simplified to fit into Poc)
const ReportSchema = new mongoose.Schema({
  title: { type: String, required: false },
  background: { type: String, required: false },
  mod_id: { type: String, required: false },
  mod_poc_id: { type: String, required: false },
  schedule: { type: String, required: false },
  executiondates: { type: String, required: false },
  scopeOfTheTraining: { type: String, required: false },
  pointOfContact: { type: PointOfContactSchema, required: false },
  expertDetails: { type: ExpertDetailsSchema, required: false }, // changed to object
  totalStrength: { type: Number, required: false }
}, { _id: false });

// Final Poc Schema
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
    unique: true,
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
    type: Object,
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
    default: false,
    required: false,
  },
  pointOfContact: {
    type: PointOfContactSchema,
    required: false,
  },
  expertDetails: {
    type: ExpertDetailsSchema, // changed from array to object
    required: false,
  },
  report: {
    type: ReportSchema, // new field added here
    required: false,
  }
});

module.exports = mongoose.model("Poc", pocSchema);
