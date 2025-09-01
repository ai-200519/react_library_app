const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://ayman:2005@localhost:5432/library_db',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Test connection on startup
    this.testConnection();
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Successfully connected to PostgreSQL (library_db)');
      console.log(`📊 Database: library_db | User: ayman | Host: localhost:5432`);
      client.release();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      console.error('💡 Make sure PostgreSQL is running: docker-compose up -d db');
    }
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Query executed in ${duration}ms (${res.rowCount} rows)`);
      }
      
      return res;
    } catch (error) {
      console.error('💥 Database query error:', error);
      throw error;
    }
  }

  async getClient() {
    return this.pool.connect();
  }

  async close() {
    console.log('🔌 Closing database connection...');
    await this.pool.end();
  }

  async healthCheck() {
    try {
      const result = await this.query('SELECT NOW() as timestamp, current_database() as database');
      return {
        status: 'healthy',
        timestamp: result.rows[0].timestamp,
        database: result.rows[0].database,
        connectionCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new Database();

