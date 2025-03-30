require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();
 // Add this at the top of your file


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
                userId: user.user_id,  // Use `user_id` from DB
                full_name: user.full_name
            },
            process.env.JWT_SECRET, // Use the secret key from the .env file
            { expiresIn: '10h' , algorithm: "HS256"}  // Token expiration time (10 hours)
        );

        // Return the JWT token and user information
        res.status(200).json    ({
            msg: 'Login successful',
            token,  // The JWT token
            user: { 
                user_id: user.user_id,  // Include user_id in response
                full_name: user.full_name,
            }
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
      user_last_login: user_last_login || new Date().toISOString(),
    });

    const user = await newUser.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Get all Users
router.get("/read_all_users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Get User by user_id
router.get("/get_user_by_id/:user_id", async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Update User details by user_id
router.put("/update_user/:user_id", async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    // Check if the user exists
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // If password is provided, hash it before updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // Perform the update
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      updateFields,
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Update user_last_login using user_id
router.put("/update_last_login/:user_id", async (req, res) => {
  try {
    const { user_last_login } = req.body;

    if (!user_last_login) {
      return res.status(400).json({ msg: "Last login timestamp is required" });
    }

    // Update the user_last_login field
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      { user_last_login },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Last login updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Delete User by user_id
router.delete("/delete_user/:user_id", async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ user_id: req.params.user_id });

    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

module.exports = router;
