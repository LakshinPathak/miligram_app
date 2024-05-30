const express = require('express');
const router = express.Router();
const Post = require('../models/Post');



// Define your routes for posts here

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }
  jwt.verify(token.split(' ')[1], 'secret', (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Create Post
router.post('/create_post', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { caption , username} = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send({ message: 'No image file uploaded' });
    }

    const imageUrl = await uploadImageToCloudinary(file);

    const newPost = new Post({
      user: req.userId,
      username:username,
      caption: caption,
      image: imageUrl,
      likes: [],
      comments: []
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Fetch posts for the logged-in user
router.get('/display_posts', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const posts = await Post.find({ username: user.username }).populate('user');

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
