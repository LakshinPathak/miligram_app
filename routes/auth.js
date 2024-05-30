const express = require('express');
const router = express.Router();
const { User, Post } = require('../models/User');
// const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');


// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dlstkslyu',
  api_key: '147498912511523',
  api_secret: 'oMABarW4U3ZgBtKi3NnnQ2chnJE'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result.secure_url);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

// // Sign Up
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let profileImageUrl = '';

    if (req.file) {
      profileImageUrl = await uploadImageToCloudinary(req.file);
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    //const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password , profileImageUrl });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});









// Log In
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request:', username, password);

    // Check if user exists
    const user = await User.findOne({ username });
    console.log('User found:', user);
    console.log(user.password);

    if (!user ) {
      return res.status(400).json({ message: 'Invalid Username' });
    }

    if(password!=user.password)
      {
        return res.status(400).json({ message: 'Invalid password' });
      }
    // if (!(await bcrypt.compare(password, user.password))) {
    //   return res.status(400).json({ message: 'Invalid password' });
    // }

    // Sign JWT token
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    console.log('Token generated:', token);

    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch user details by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(username + "pathakkk");
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




router.get('/:username_profile', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update user settings
router.post('/settings', async (req, res) => {
  try {
    const { username, newEmail, newPassword } = req.body;

    console.log(username + newEmail + newPassword+"mishra");
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newEmail) {
      user.email = newEmail;
      console.log(user.email);
    }

    if (newPassword) {
      user.password = newPassword;
      console.log(user.password);
    }

    await user.save();

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
