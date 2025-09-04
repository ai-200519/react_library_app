
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ayman:2005@localhost:5433/library_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL');
    release();
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Device middleware
const deviceMiddleware = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID required in X-Device-ID header' });
  }
  req.deviceId = deviceId;
  next();
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'ok'
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: err.message
    });
  }
});

// Import routes
const devicesRoutes = require('./routes/devices');
const booksRoutes = require('./routes/books');
const shelvesRoutes = require('./routes/shelves');
const tagsRoutes = require('./routes/tags');
const quotesRoutes = require('./routes/quotes');

// Apply routes
app.use('/api/devices', devicesRoutes(pool));
app.use('/api/books', deviceMiddleware, booksRoutes(pool));
app.use('/api/shelves', deviceMiddleware, shelvesRoutes(pool));
app.use('/api/tags', deviceMiddleware, tagsRoutes(pool));
app.use('/api/quotes', deviceMiddleware, quotesRoutes(pool));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    availableRoutes: ['/api/books', '/api/shelves', '/api/tags', '/api/quotes', '/health']
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

module.exports = app;