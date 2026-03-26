const db = require('./config/db');

async function initEntriesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS client_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT,
        paid_principal DECIMAL(15,2) DEFAULT 0,
        paid_interest DECIMAL(15,2) DEFAULT 0,
        adjustment DECIMAL(15,2) DEFAULT 0,
        payment_method VARCHAR(50),
        entry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);
    console.log('Table `client_entries` ensured.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create client_entries table:', err);
    process.exit(1);
  }
}

initEntriesTable();
