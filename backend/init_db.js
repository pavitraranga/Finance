const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  try {
    // Create connection without selecting database to allow creating it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server.');

    await connection.query('CREATE DATABASE IF NOT EXISTS finance');
    console.log('Database `finance` ensured.');

    await connection.query('USE finance');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table `agents` ensured.');

    await connection.end();
    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

init();
