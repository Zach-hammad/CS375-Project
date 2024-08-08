const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');

// Read the env.json file
const env = JSON.parse(fs.readFileSync('env.json', 'utf8'));

const app = express();
const PORT = 3000;

// PostgreSQL configuration using env.json
const pool = new Pool({
  user: env.user,
  host: env.host,
  database: env.database,
  password: env.password,
  port: env.port,
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'app/public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public', 'login.html'));
});

// Endpoint to save nickname
app.post('/save-nickname', async (req, res) => {
  const { ethAddress, nickname } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (eth_address, nickname) VALUES ($1, $2) ON CONFLICT (eth_address) DO UPDATE SET nickname = $2 RETURNING *',
      [ethAddress, nickname]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving nickname:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get nickname
app.get('/get-nickname/:ethAddress', async (req, res) => {
  const { ethAddress } = req.params;
  try {
    const result = await pool.query('SELECT nickname FROM users WHERE eth_address = $1', [ethAddress]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Nickname not found' });
    }
  } catch (error) {
    console.error('Error retrieving nickname:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ensure the users table exists
async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        eth_address VARCHAR(42) UNIQUE NOT NULL,
        nickname VARCHAR(50) NOT NULL
      );
    `);
    console.log('Table "users" is ready.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  createTable();  // Create the table if it doesn't exist
});
