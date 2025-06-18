const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

// Route imports
const taskRoutes = require('./routes/taskRoutes');
const moodRoutes = require('./routes/moodRoutes');
const focusRoutes = require('./routes/focusRoutes');
const authRoutes = require('./routes/authRoutes');
const auth = require('./middleware/auth');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
        path: "./config/.env",
    });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", auth, taskRoutes);
app.use("/api/moods", auth, moodRoutes);
app.use("/api/focus", auth, focusRoutes);

// File upload route
app.post('/api/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
        message: 'File uploaded successfully',
        filePath: `/uploads/${req.file.filename}`,
    });
});

// Basic route
app.get('/', (req, res) => {
    res.send('Sentience API is running');
});

// Server listener
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
