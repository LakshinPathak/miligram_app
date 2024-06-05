const express = require('express');
const router = express.Router();
const { User, Post, Master, Relationship, Message } = require('../models/User');
const jwt = require('jsonwebtoken');

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



  // Fetch follower-following of the logged-in user
router.post('/fetch_fusers', verifyToken, async (req, res) => {
    try {
        const { username_profile } = req.body;
        console.log(username_profile+"kajal");
      const relationship = await Relationship.find({username: username_profile});
    
    // Return the response
    res.status(200).json(relationship);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



   // Fetch follower-following profile of the logged-in user
router.post('/fetch_user_profile_img', verifyToken, async (req, res) => {
  try {
      const { username } = req.body;
    
    const master = await Master.find({username: username});
  
  // Return the response
  res.status(200).json(master);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

  


module.exports = router;
