
import express from 'express';
const router = express.Router();
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Note from '../models/Note.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

// @route   GET api/notes
// @desc    Get all notes (global notes for public, private notes for authenticated users)
// @access  Public/Private
router.get('/', async (req, res) => {
  try {
    // Get global notes for everyone
    const globalNotes = await Note.find({ privacy: 'global' }).sort({ createdAt: -1 });
    
    // If user is authenticated, also get their private notes
    if (req.header('x-auth-token')) {
      try {
        const decoded = jwt.verify(req.header('x-auth-token'), process.env.JWT_SECRET);
        const privateNotes = await Note.find({ 
          privacy: 'private', 
          'author.id': decoded.user.id 
        }).sort({ createdAt: -1 });
        
        // Combine global and private notes
        const allNotes = [...globalNotes, ...privateNotes];
        res.json(allNotes);
      } catch (err) {
        // If token is invalid, just return global notes
        res.json(globalNotes);
      }
    } else {
      // No token, return only global notes
      res.json(globalNotes);
    }
  } catch (err) {
    console.error('Note retrieval error:', err.message);
    res.status(500).json({ 
      message: 'Internal server error occurred while retrieving notes',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
});

// @route   POST api/notes
// @desc    Create a new note
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10,000 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('privacy').optional().isIn(['private', 'global']).withMessage('Privacy must be either private or global'),
  body('tags').optional().isString().withMessage('Tags must be a string')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { title, description, content, category, tags, privacy } = req.body;

  try {
    const user = await User.findById(req.user.id).select('-password');
    
    const newNote = new Note({
      title,
      description,
      content,
      category,
      privacy: privacy || 'private',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      author: {
        id: req.user.id,
        name: user.name,
        avatar: user.avatar
      }
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error('Note creation error:', err.message);
    res.status(500).json({ 
      message: 'Internal server error occurred while creating note',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
});

// @route   GET api/notes/global
// @desc    Get all global notes
// @access  Public
router.get('/global', async (req, res) => {
  try {
    const notes = await Note.find({ privacy: 'global' }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/notes/my-notes
// @desc    Get current user's private notes
// @access  Private
router.get('/my-notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ 
      'author.id': req.user.id 
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/notes/:id
// @desc    Get a note by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if user is the author
    if (note.author.id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { title, description, content, category, tags, privacy } = req.body;
    
    // Update fields
    if (title) note.title = title;
    if (description) note.description = description;
    if (content) note.content = content;
    if (category) note.category = category;
    if (privacy) note.privacy = privacy;
    if (tags) note.tags = tags.split(',').map(tag => tag.trim());
    note.updatedAt = Date.now();
    
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if user is the author
    if (note.author.id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});



// @route   GET api/notes/my-notes
// @desc    Get current user's private notes
// @access  Private
router.get('/my-notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ 
      'author.id': req.user.id 
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notes/like/:id
// @desc    Like a note
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    note.likes += 1;
    await note.save();
    
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
});

export default router;
