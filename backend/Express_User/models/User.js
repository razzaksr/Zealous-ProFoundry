const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    department: {
        type: String,
    },
    college: {
        type: String,
    },
    rollno: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,        // true = active, false = inactive
        default: true,
    },
    admin: {
        type: Boolean,        // true = admin, false = normal user
        default: false,

    },
    user_last_login: {
        type: Date
      }
      
});

const User = mongoose.model('User', userSchema);
module.exports = User;
