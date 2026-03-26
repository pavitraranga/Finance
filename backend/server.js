const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

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
    
    // Auto-increment reset feature (Useful for Dev mode)
    const [rows] = await db.query('SELECT COUNT(*) as count FROM agents');
    if (rows[0].count === 0) {
      await db.query('ALTER TABLE agents AUTO_INCREMENT = 1');
    }

    res.json({ message: 'Agent deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Client Routes
app.post('/api/clients', upload.single('photo'), async (req, res) => {
  try {
    const { agent_id, name, phone, page_no, description, principal_amount, interest_rate } = req.body;
    if (!agent_id || !name) return res.status(400).json({ error: 'Agent ID and Name are required' });

    const photo_path = req.file ? `/uploads/${req.file.filename}` : null;
    const pAmt = principal_amount || 0;
    const iRate = interest_rate || 0;

    const [result] = await db.query(
      'INSERT INTO clients (agent_id, name, phone, page_no, description, principal_amount, interest_rate, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [agent_id, name, phone, page_no, description, pAmt, iRate, photo_path]
    );

    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json(clients[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/clients/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { search } = req.query;
    let query = 'SELECT * FROM clients WHERE agent_id = ? ORDER BY created_at DESC';
    let params = [agentId];

    if (search) {
      query = 'SELECT * FROM clients WHERE agent_id = ? AND (name LIKE ? OR phone LIKE ?) ORDER BY created_at DESC';
      params = [agentId, `%${search}%`, `%${search}%`];
    }

    const [clients] = await db.query(query, params);
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/clients/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, page_no, description, principal_amount, interest_rate } = req.body;
    
    let query = 'UPDATE clients SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ?';
    let params = [name, phone, page_no, description, principal_amount || 0, interest_rate || 0];

    if (req.file) {
      query += ', photo = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    res.json(clients[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Entry Routes
app.post('/api/entries', async (req, res) => {
  try {
    const { client_id, paid_principal, paid_interest, adjustment, payment_method, entry_date } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO client_entries (client_id, paid_principal, paid_interest, adjustment, payment_method, entry_date) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, paid_principal || 0, paid_interest || 0, adjustment || 0, payment_method, entry_date]
    );

    const [entry] = await db.query('SELECT * FROM client_entries WHERE id = ?', [result.insertId]);
    res.status(201).json(entry[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/entries/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const [entries] = await db.query('SELECT * FROM client_entries WHERE client_id = ? ORDER BY entry_date DESC, created_at DESC', [clientId]);
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/entries/summary/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const [clients] = await db.query('SELECT principal_amount, interest_rate FROM clients WHERE id = ?', [clientId]);
    if (clients.length === 0) return res.status(404).json({ error: 'Client not found' });
    const client = clients[0];
    
    const [sums] = await db.query(`
      SELECT 
        SUM(paid_principal) as total_paid_principal,
        SUM(paid_interest) as total_paid_interest,
        SUM(adjustment) as total_adjustment
      FROM client_entries WHERE client_id = ?
    `, [clientId]);

    const stats = sums[0];
    const totalPaidPrincipal = parseFloat(stats.total_paid_principal || 0);
    const totalPaidInterest = parseFloat(stats.total_paid_interest || 0);
    const totalAdjustment = parseFloat(stats.total_adjustment || 0);

    const principal = parseFloat(client.principal_amount || 0);
    const interestRate = parseFloat(client.interest_rate || 0);

    const calcInterestAmount = (principal * interestRate) / 100;
    const remainingPrincipal = principal - totalPaidPrincipal - totalAdjustment;
    const remainingInterest = calcInterestAmount - totalPaidInterest;

    res.json({
      principal,
      interestRate,
      calcInterestAmount,
      totalPaidPrincipal,
      totalPaidInterest,
      totalAdjustment,
      remainingPrincipal,
      remainingInterest
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Profit Routes
app.get('/api/profit', async (req, res) => {
  try {
    const { startDate, endDate, month } = req.query;
    
    let query = `
      SELECT 
        ce.*, 
        c.name as client_name, 
        a.name as agent_name 
      FROM client_entries ce
      JOIN clients c ON ce.client_id = c.id
      JOIN agents a ON c.agent_id = a.id
      WHERE 1=1
    `;
    let params = [];

    if (startDate && endDate) {
      query += ` AND DATE(ce.entry_date) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (month) {
      query += ` AND DATE_FORMAT(ce.entry_date, '%Y-%m') = ?`;
      params.push(month);
    }

    query += ` ORDER BY ce.entry_date DESC, ce.created_at DESC`;

    const [transactions] = await db.query(query, params);

    let total_principal = 0;
    let total_interest = 0;
    let total_adjustment = 0;

    transactions.forEach(t => {
      total_principal += parseFloat(t.paid_principal || 0);
      total_interest += parseFloat(t.paid_interest || 0);
      total_adjustment += parseFloat(t.adjustment || 0);
    });

    res.json({
      summary: {
        total_principal,
        total_interest,
        total_adjustment
      },
      transactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/monthly-profit/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const query = `
      SELECT 
        c.id as client_id,
        c.name as client_name,
        c.page_no,
        c.created_at as issue_date,
        c.principal_amount,
        c.interest_rate,
        MAX(ce.entry_date) as last_entry_date,
        SUM(ce.paid_interest) as total_paid_interest
      FROM clients c
      LEFT JOIN client_entries ce ON c.id = ce.client_id
      WHERE c.agent_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    const [clientsStats] = await db.query(query, [agentId]);
    res.json(clientsStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
