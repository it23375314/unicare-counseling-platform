const SessionNote = require('../models/SessionNote');

// 1. Create a note
exports.createNote = async (req, res) => {
  try {
    const note = new SessionNote(req.body);
    const savedNote = await note.save();
    res.status(201).json({ success: true, data: savedNote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. Get all notes for a specific counsellor
exports.getNotesByCounsellor = async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const { studentName, date, riskLevel } = req.query;
    
    // Build query object
    const query = { counsellorId };
    
    // Search and filter options
    if (studentName) {
      query.studentName = { $regex: studentName, $options: 'i' };
    }
    if (date) {
      query.sessionDate = date;
    }
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    const notes = await SessionNote.find(query).sort({ sessionDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get a specific note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await SessionNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update a note
exports.updateNote = async (req, res) => {
  try {
    const note = await SessionNote.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await SessionNote.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
