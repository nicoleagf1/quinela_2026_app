const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');
const { createClient } = require('redis');

async function init() {
  let hasErrors = false;

  console.log('Testing Database connection...');
  try {
    const res = await db.query('SELECT NOW()');
    console.log('DB Connection successful:', res.rows[0]);
    
    console.log('Applying database schema...');
    const schemaPath = path.join(__dirname, 'database_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.query(schema);
    console.log('Database schema applied successfully.');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    hasErrors = true;
  }

  console.log('Testing Redis connection...');
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: false
      }
    });
    redisClient.on('error', (err) => {});
    await redisClient.connect();
    console.log('Redis Connection successful.');
    await redisClient.disconnect();
  } catch (err) {
    console.error('Redis initialization error:', err.message);
    hasErrors = true;
  }

  process.exit(hasErrors ? 1 : 0);
}

init();
