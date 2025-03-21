const express = require('express');
const User = require('../models/Users');
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
require('dotenv').config(); // or use dotenv for environment variables
const auth = require("../middleware/authMiddleware"); // assuming this is the path to your auth middleware


// Login User and generate JWT token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Compare the entered password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // If the password matches, create a JWT token
    const token = jwt.sign(
      {
        userId: user._id,  // Include the user ID or any data you want to encode
        username: user.username
      },
      process.env.JWT_SECRET, // Use the secret key from the .env file
      { expiresIn: '10h' }  // Token expiration time (10 hour in this case)
    );

    // Return the JWT token and user information
    res.status(200).json({
      msg: 'Login successful',
      token,  // The JWT token
      user: { username: user.username, email: user.email,username:user.full_name}
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new User
router.post("/add_user", async (req, res) => {
  const { full_name, department, college, rollno, email, password, status, user_last_login } = req.body;

  // Validate required fields
  if (!full_name || !email || !password || !department || !college || !rollno) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Check if email or roll number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { rollno }] });
    if (existingUser) {
      return res.status(400).json({ msg: "Email or Roll Number already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      full_name,
      department,
      college,
      rollno,
      email,
      password: hashedPassword, // Store the hashed password
      status: status || "active",
      user_last_login: user_last_login || new Date().toISOString()
    });

    const user = await newUser.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Get all Users
router.get('/read_all_users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get User by user_id
router.post('/get_user_by_id', async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.body.user_id });
        if (!user) return res.status(404).send({ message: 'User not found' });
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update User details by user_id
// Update User details by user_id
router.put('/update_user', async (req, res) => {
  try {
      const { user_id, password, ...updateFields } = req.body;

      // Check if the user exists
      const user = await User.findOne({ user_id });
      if (!user) return res.status(404).send({ message: 'User not found' });

      // If password is provided, hash it before updating
      if (password) {
          const salt = await bcrypt.genSalt(10);
          updateFields.password = await bcrypt.hash(password, salt);
      }

      // Perform the update
      const updatedUser = await User.findOneAndUpdate(
          { user_id }, // Find user by ID
          updateFields, // Update fields (including hashed password if provided)
          { new: true, runValidators: true }
      );

      res.send(updatedUser);
  } catch (error) {
      res.status(400).send(error);
  }
});

// Update user_last_login using user_id
router.put('/update_last_login', async (req, res) => {
  try {
      const { user_id, user_last_login } = req.body;

      if (!user_id || !user_last_login) {
          return res.status(400).json({ msg: "User ID and last login timestamp are required" });
      }

      // Update the user_last_login field
      const updatedUser = await User.findOneAndUpdate(
          { user_id },  // Find user by ID
          { user_last_login }, // Update user_last_login with provided value
          { new: true, runValidators: true } // Return updated user and run validation
      );

      if (!updatedUser) {
          return res.status(404).json({ msg: "User not found" });
      }

      res.status(200).json({ msg: "Last login updated successfully", user: updatedUser });
  } catch (error) {
      res.status(500).json({ msg: "Server Error", error });
  }
});




// Delete User by user_id
router.delete('/delete_user', async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ user_id: req.body.user_id });
        if (!deletedUser) return res.status(404).send({ message: 'User not found' });
        res.send(deletedUser);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
