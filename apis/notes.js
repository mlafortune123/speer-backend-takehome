const pool = require('../credentials.js');

// Create a new note
const createNote = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id; // Get user ID from the token
  
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
  
    try {
      const result = await pool.query(
        'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, content, userId]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating note' });
    }
  };
  
  // Get all notes for authenticated user
  const getAllNotes = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const result = await pool.query('SELECT * FROM notes WHERE user_id = $1', [userId]);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving notes' });
    }
  };
  
  // Get a note by ID
  const getNoteById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const result = await pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Note not found' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving note' });
    }
  };
  
  // Update a note by ID
  const updateNote = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;
  
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
  
    try {
      const result = await pool.query(
        'UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
        [title, content, id, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Note not found or unauthorized' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating note' });
    }
  };
  
  // Delete a note by ID
  const deleteNote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Note not found or unauthorized' });
      }
      return res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error deleting note' });
    }
  };
  
  // Share a note with another user
  const shareNote = async (req, res) => {
    const { id } = req.params;
    const { sharedWithUserId } = req.body;
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'INSERT INTO shared_notes (note_id, user_id, shared_with_user_id) VALUES ($1, $2, $3) RETURNING *',
        [id, userId, sharedWithUserId]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error sharing note' });
    }
  };
  
  // Search for notes based on keywords
  const searchNotes = async (req, res) => {
    const { q } = req.query;
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2)',
        [userId, `%${q}%`]
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error searching for notes' });
    }
  };

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
  shareNote
};