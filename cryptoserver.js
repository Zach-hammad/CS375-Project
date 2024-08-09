const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');

const env = JSON.parse(fs.readFileSync('env.json', 'utf8'));

const app = express();
const PORT = 3000;

const pool = new Pool({
  user: env.user,
  host: env.host,
  database: env.database,
  password: env.password,
  port: env.port,
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'app/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public', 'login.html'));
});

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
