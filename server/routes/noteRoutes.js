
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/notes
// @desc    Get all notes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/notes
// @desc    Create a new note
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, content, category, tags } = req.body;

  try {
    const user = await User.findById(req.user.id).select('-password');
    
    const newNote = new Note({
      title,
      description,
      content,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      author: {
        id: req.user.id,
        name: user.name,
        avatar: user.avatar
      }
    });

    const note = await newNote.save();
    res.json(note);
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
    
    const { title, description, content, category, tags } = req.body;
    
    // Update fields
    if (title) note.title = title;
    if (description) note.description = description;
    if (content) note.content = content;
    if (category) note.category = category;
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
    
    await note.remove();
    res.json({ message: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
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

module.exports = router;
