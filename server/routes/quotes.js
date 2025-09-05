// server/routes/quotes.js
const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all quotes for a specific book
  router.get('/book/:bookId', async (req, res) => {
    try {
      const { bookId } = req.params;
      const { deviceId } = req;

      // Verify book belongs to device
      const bookCheck = await pool.query(
        'SELECT id FROM books WHERE id = $1 AND device_id = $2',
        [bookId, deviceId]
      );

      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const result = await pool.query(
        `SELECT 
          id, book_id, quote_text, page_number, chapter, notes, 
          is_favorite, created_at, updated_at
         FROM book_quotes 
         WHERE book_id = $1 
         ORDER BY created_at DESC`,
        [bookId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  // Add a new quote
  router.post('/book/:bookId', async (req, res) => {
    try {
      const { bookId } = req.params;
      const { deviceId } = req;
      const { quote_text, page_number, chapter, notes, is_favorite = false } = req.body;

      if (!quote_text || !quote_text.trim()) {
        return res.status(400).json({ error: 'Quote text is required' });
      }

      // Verify book belongs to device
      const bookCheck = await pool.query(
        'SELECT id FROM books WHERE id = $1 AND device_id = $2',
        [bookId, deviceId]
      );

      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const result = await pool.query(
        `INSERT INTO book_quotes 
         (book_id, quote_text, page_number, chapter, notes, is_favorite, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [bookId, quote_text.trim(), page_number || null, chapter || null, notes || null, is_favorite]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding quote:', error);
      res.status(500).json({ error: 'Failed to add quote' });
    }
  });

  // Update a quote
  router.put('/:quoteId', async (req, res) => {
    try {
      const { quoteId } = req.params;
      const { deviceId } = req;
      const { quote_text, page_number, chapter, notes, is_favorite } = req.body;

      // Verify quote belongs to user's book
      const quoteCheck = await pool.query(
        `SELECT bq.id, bq.book_id 
         FROM book_quotes bq
         JOIN books b ON bq.book_id = b.id
         WHERE bq.id = $1 AND b.device_id = $2`,
        [quoteId, deviceId]
      );

      if (quoteCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (quote_text !== undefined) {
        updateFields.push(`quote_text = $${paramIndex}`);
        updateValues.push(quote_text.trim());
        paramIndex++;
      }

      if (page_number !== undefined) {
        updateFields.push(`page_number = $${paramIndex}`);
        updateValues.push(page_number || null);
        paramIndex++;
      }

      if (chapter !== undefined) {
        updateFields.push(`chapter = $${paramIndex}`);
        updateValues.push(chapter || null);
        paramIndex++;
      }
      
      if (notes !== undefined) {
        updateFields.push(`notes = $${paramIndex}`);
        updateValues.push(notes || null);
        paramIndex++;
      }      

      if (is_favorite !== undefined) {
        updateFields.push(`is_favorite = $${paramIndex}`);
        updateValues.push(is_favorite);
        paramIndex++;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(quoteId);

      const result = await pool.query(
        `UPDATE book_quotes 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        updateValues
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({ error: 'Failed to update quote' });
    }
  });

  // Delete a quote
  router.delete('/:quoteId', async (req, res) => {
    try {
      const { quoteId } = req.params;
      const { deviceId } = req;

      // Verify quote belongs to user's book
      const quoteCheck = await pool.query(
        `SELECT bq.id 
         FROM book_quotes bq
         JOIN books b ON bq.book_id = b.id
         WHERE bq.id = $1 AND b.device_id = $2`,
        [quoteId, deviceId]
      );

      if (quoteCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      await pool.query('DELETE FROM book_quotes WHERE id = $1', [quoteId]);
      
      res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
      console.error('Error deleting quote:', error);
      res.status(500).json({ error: 'Failed to delete quote' });
    }
  });

  // Get favorite quotes for a book
  router.get('/book/:bookId/favorites', async (req, res) => {
    try {
      const { bookId } = req.params;
      const { deviceId } = req;

      // Verify book belongs to device
      const bookCheck = await pool.query(
        'SELECT id FROM books WHERE id = $1 AND device_id = $2',
        [bookId, deviceId]
      );

      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const result = await pool.query(
        `SELECT 
          id, book_id, quote_text, page_number, chapter, notes, 
          is_favorite, created_at, updated_at
         FROM book_quotes 
         WHERE book_id = $1 AND is_favorite = true
         ORDER BY created_at DESC`,
        [bookId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching favorite quotes:', error);
      res.status(500).json({ error: 'Failed to fetch favorite quotes' });
    }
  });

  return router;
};