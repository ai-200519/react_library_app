const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all tags for device
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, 
               COUNT(bt.book_id)::int as book_count
        FROM tags t
        LEFT JOIN book_tags bt ON t.id = bt.tag_id
        WHERE t.device_id = $1 
        GROUP BY t.id
        ORDER BY t.name
      `, [req.deviceId]);

      res.json(rows);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create tag
  router.post('/', async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const normalizedName = name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`;

      const { rows } = await pool.query(`
        INSERT INTO tags (device_id, name)
        VALUES ($1, $2)
        ON CONFLICT (device_id, name) DO UPDATE SET name = EXCLUDED.name
        RETURNING *, 0 as book_count
      `, [req.deviceId, normalizedName]);

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update tag
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const normalizedName = name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`;

      const { rows } = await pool.query(`
        UPDATE tags SET 
          name = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND device_id = $3
        RETURNING *, (
          SELECT COUNT(*)::int 
          FROM book_tags 
          WHERE tag_id = $1
        ) as book_count
      `, [id, normalizedName, req.deviceId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error updating tag:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete tag
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { rows } = await pool.query(
        'DELETE FROM tags WHERE id = $1 AND device_id = $2 RETURNING *',
        [id, req.deviceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};