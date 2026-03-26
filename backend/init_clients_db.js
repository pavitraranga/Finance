const db = require('./config/db');

async function initClientsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        name VARCHAR(255),
        phone VARCHAR(255),
        page_no VARCHAR(255),
        description TEXT,
        photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);
    console.log('Table `clients` ensured.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create clients table:', err);
    process.exit(1);
  }
}

initClientsTable();
