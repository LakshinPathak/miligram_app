const express = require('express');
const router = express.Router();
// const User = require('../models/User');
// const Post = require('../models/Post');
const { User, Post , Master, Relationship} = require('../models/User');


// Define your routes for posts here

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

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



// Delete a post by ID
router.delete('/delete_post/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Add comment to a post
router.post('/add_comment/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ text: comment, user: req.userId });
    await post.save();

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get comments for a post
router.get('/get_comments/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = post.comments;
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Like a post
router.post('/like/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;


    console.log(postId);


    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    console.log(post);
    
    if (post.likes.includes(req.userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.userId);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully', likes: post.likes.length });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Unlike a post
router.post('/unlike/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);


    console.log("mishra7777");
    console.log(postId);

    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);
    if (likeIndex === -1) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();

    res.status(200).json({ message: 'Post unliked successfully', likes: post.likes.length });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Fetch like status for a post
router.post('/fetch_like/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { post_id, currentusername} = req.body;

    console.log()

    // Find the user by their username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    

    const user2 = await User.findOne({username: currentusername });
    
      // Find the post first from post_id
      const post = await Post.findById(post_id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      var isliked = false;   
      if (post.likes.includes(user2._id)) {
        isliked =true;
       
        res.status(200).json({ isliked, size:post.likes.length });
      }
      else
      {
      
        // Return the like status
        res.status(200).json({ isliked , size:post.likes.length});
      }
   
   
  } catch (error) {
    console.error('Error fetching like status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});







module.exports = router;
