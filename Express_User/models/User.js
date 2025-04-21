const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        default: uuidv4,  // Generate UUID by default
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    rollno: {
        type: String,
        required: true,
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
        type: String,
        enum: ['active', 'inactive'],  // Only allow 'active' or 'inactive'
        default: 'active',
        required:true
    },
    user_last_login: {
        type: String  // Store as a string in ISO forma
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;