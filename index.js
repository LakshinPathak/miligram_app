const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '100mb' }));
app.use(cors());

const uri = "mongodb+srv://lakshinpathak2810:nirma123@cluster0.r7ltlis.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Importing routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');

// Using routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);

// Serving HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/feed.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'feed.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/post.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

app.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
});
