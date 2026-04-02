const db = require('./config/db');

async function createGoldTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS gold_agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS gold_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        page_no VARCHAR(50),
        description TEXT,
        principal_amount DECIMAL(15,2) DEFAULT 0.00,
        interest_rate DECIMAL(5,2) DEFAULT 0.00,
        photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES gold_agents(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS gold_client_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT,
        entry_date DATE NOT NULL,
        paid_principal DECIMAL(15,2) DEFAULT 0.00,
        paid_interest DECIMAL(15,2) DEFAULT 0.00,
        adjustment DECIMAL(15,2) DEFAULT 0.00,
        payment_method VARCHAR(50) DEFAULT 'Cash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES gold_clients(id) ON DELETE CASCADE
      )
    `);

    console.log("Gold tables successfully created!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating gold tables:", err);
    process.exit(1);
  }
}

createGoldTables();
