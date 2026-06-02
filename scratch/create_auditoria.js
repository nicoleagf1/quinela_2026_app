const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function createAuditoriaTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auditoria (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          match_id INTEGER REFERENCES matches(id),
          home_score INTEGER,
          away_score INTEGER,
          action_type VARCHAR(50) DEFAULT 'UPSERT',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla auditoria creada exitosamente en PostgreSQL.');
  } catch (error) {
    console.error('Error al crear tabla auditoria:', error);
  } finally {
    pool.end();
  }
}

createAuditoriaTable();
