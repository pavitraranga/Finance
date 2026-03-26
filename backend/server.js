const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/agents', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const [result] = await db.query('INSERT INTO agents (name) VALUES (?)', [name]);
    
    // Fetch inserted agent to return
    const [agents] = await db.query('SELECT * FROM agents WHERE id = ?', [result.insertId]);
    res.status(201).json(agents[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/agents', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM agents ORDER BY created_at DESC';
    let params = [];

    if (search) {
      query = 'SELECT * FROM agents WHERE name LIKE ? ORDER BY created_at DESC';
      params = [`%${search}%`];
    }

    const [agents] = await db.query(query, params);
    res.json(agents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM agents WHERE id = ?', [id]);
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
