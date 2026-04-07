const express = require('express');
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNotesByCounsellor,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/sessionNoteController');

router.route('/')
  .post(createNote)
  .get(getAllNotes);

router.route('/counsellor/:counsellorId')
  .get(getNotesByCounsellor);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
