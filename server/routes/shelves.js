const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all shelves for device
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT s.*, 
               COUNT(bs.book_id)::int as book_count
        FROM shelves s
        LEFT JOIN book_shelves bs ON s.id = bs.shelf_id
        WHERE s.device_id = $1 
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `, [req.deviceId]);

      res.json(rows);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create shelf
  router.post('/', async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Shelf name is required' });
      }

      const { rows } = await pool.query(`
        INSERT INTO shelves (device_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING *, 0 as book_count
      `, [req.deviceId, name.trim(), description || null]);

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating shelf:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'A shelf with this name already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Update shelf
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Shelf name is required' });
      }

      const { rows } = await pool.query(`
        UPDATE shelves SET 
          name = $2, 
          description = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND device_id = $4
        RETURNING *, (
          SELECT COUNT(*)::int 
          FROM book_shelves 
          WHERE shelf_id = $1
        ) as book_count
      `, [id, name.trim(), description || null, req.deviceId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Shelf not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error updating shelf:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'A shelf with this name already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Delete shelf
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { rows } = await pool.query(
        'DELETE FROM shelves WHERE id = $1 AND device_id = $2 RETURNING *',
        [id, req.deviceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Shelf not found' });
      }

      res.json({ message: 'Shelf deleted successfully' });
    } catch (error) {
      console.error('Error deleting shelf:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};