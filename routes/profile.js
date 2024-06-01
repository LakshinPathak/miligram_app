const express = require('express');
const router = express.Router();
const { User, Post, Master , Relationship} = require('../models/User');

// Route to fetch all records from the Master table
router.get('/master', async (req, res) => {
  try {
    const masterRecords = await Master.find({});
    res.status(200).json(masterRecords);
  } catch (error) {
    console.error('Error fetching master records:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Route to fetch all following usernames for a given username

router.get('/relation_username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the relationship record for the given username
    const relationship = await Relationship.findOne({ username });

    if (!relationship) {
      return res.status(404).json({ message: 'No following users found for the given username' });
    }

    // Return the array of following array
    res.status(200).json(relationship);
  } catch (error) {
    console.error('Error fetching following usernames:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Route to follow a user
router.post('/follow/:username', async (req, res) => {
  const { username } = req.params;
  const { currentUserUsername } = req.body; // Assuming you send the current user's username in the request body

  try {
    // Find the user being followed and the current user
    const userToFollow = await Master.findOne({ username });
    const currentUser = await Master.findOne({ username: currentUserUsername });

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the Relationship table
    let relationship = await Relationship.findOne({ username: currentUserUsername });

    // If the relationship record doesn't exist, create a new one
    if (!relationship) {
      relationship = new Relationship({ username: currentUserUsername, following: [] });
    }

    // Add the followed user's username to the following array
    relationship.following.push(username);
    await relationship.save();

    // Send the response
    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Route to unfollow a user
router.post('/unfollow/:username', async (req, res) => {
  const { username } = req.params;
  const {currentUserUsername} = req.body; // Assuming you're sending the current user's username in the request body

  console.log(username+ currentUserUsername+"oh bole aayay")
  try {
    const userToUnfollow = await Master.findOne({ username });
    const currentUser = await Master.findOne({ username: currentUserUsername });

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the Relationship table's following field and remove it if it exists
    await Relationship.findOneAndUpdate(
      { username: currentUserUsername },
      { $pull: { following: username } },
      { new: true }
    );

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Route to fetch posts of a user
router.get('/:username/fetch_post_feed', async (req, res) => {
  const { username } = req.params;

  try {

    // Find the current user in the Master table
    const currentUserRelationship = await Master.findOne({ username });
    if (!currentUserRelationship) {
      return res.status(404).json({ message: 'User not found' });
    }
    

    // Fetch posts of users that the current user is following
    const posts = await Post.find({ username });
    console.log(posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to post a comment on a post
router.post('/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const currentUser = req.user; // Assuming the authenticated user is available in req.user

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ user: currentUser._id, comment });
    await post.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
