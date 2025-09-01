const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Register device
  router.post('/', async (req, res) => {
    try {
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      const { rows } = await pool.query(`
        INSERT INTO devices (device_id, last_accessed)
        VALUES ($1, CURRENT_TIMESTAMP)
        ON CONFLICT (device_id) 
        DO UPDATE SET last_accessed = CURRENT_TIMESTAMP
        RETURNING *
      `, [deviceId]);

      res.json(rows[0]);
    } catch (error) {
      console.error('Error registering device:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};