const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotesByCounsellor,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/sessionNoteController');

router.route('/')
  .post(createNote);

router.route('/counsellor/:counsellorId')
  .get(getNotesByCounsellor);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
