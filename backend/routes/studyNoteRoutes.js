const express = require('express');
const router = express.Router();
const StudyNote = require('../models/studyNote');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/study-notes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Image, and Text files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all study notes with optional filters
router.get('/', async (req, res) => {
  try {
    const { subject, search, page = 1, limit = 20 } = req.query;
    let query = {};
    
    // Filter by subject
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { authorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notes = await StudyNote.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'name email');
    
    const total = await StudyNote.countDocuments(query);
    
    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific study note
router.get('/:id', async (req, res) => {
  try {
    const note = await StudyNote.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');
    
    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new study note
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, tags } = req.body;
    
    const noteData = {
      title,
      description,
      subject,
      author: req.user.id,
      authorName: req.user.name,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Add file information if file was uploaded
    if (req.file) {
      noteData.fileName = req.file.originalname;
      noteData.fileUrl = `/uploads/study-notes/${req.file.filename}`;
      noteData.fileSize = req.file.size;
      noteData.fileType = req.file.mimetype;
    }
    
    const note = new StudyNote(noteData);
    const savedNote = await note.save();
    
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like/unlike a study note
router.patch('/:id/like', auth, async (req, res) => {
  try {
    const note = await StudyNote.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }
    
    const userIndex = note.likedBy.indexOf(req.user.id);
    
    if (userIndex > -1) {
      // Unlike
      note.likedBy.splice(userIndex, 1);
      note.likes = Math.max(0, note.likes - 1);
    } else {
      // Like
      note.likedBy.push(req.user.id);
      note.likes += 1;
    }
    
    await note.save();
    res.json({ likes: note.likes, isLiked: userIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a study note
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const note = await StudyNote.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }
    
    const comment = {
      user: req.user.id,
      userName: req.user.name,
      text
    };
    
    note.comments.push(comment);
    await note.save();
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Download a study note file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const note = await StudyNote.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }
    
    if (!note.fileUrl) {
      return res.status(404).json({ message: 'No file attached to this note' });
    }
    
    // Track download
    note.downloads += 1;
    note.downloadedBy.push({
      user: req.user.id
    });
    await note.save();
    
    // Send file
    const filePath = path.join(__dirname, '..', note.fileUrl);
    res.download(filePath, note.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get study notes statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalNotes = await StudyNote.countDocuments();
    const totalDownloads = await StudyNote.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    
    const subjectStats = await StudyNote.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const topContributors = await StudyNote.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 }, authorName: { $first: '$authorName' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalNotes,
      totalDownloads: totalDownloads[0]?.total || 0,
      subjectStats,
      topContributors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
