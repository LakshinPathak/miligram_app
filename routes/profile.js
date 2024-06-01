const express = require('express');
const router = express.Router();
const { User, Post, Master } = require('../models/User');


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

module.exports = router;
