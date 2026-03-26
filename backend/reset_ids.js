const db = require('./config/db');

async function resetIds() {
  try {
    const [agents] = await db.query('SELECT * FROM agents ORDER BY id ASC');
    let nextId = 1;
    
    for (let agent of agents) {
      await db.query('UPDATE agents SET id = ? WHERE id = ?', [-nextId, agent.id]);
      nextId++;
    }
    
    // Convert back to positive
    if (agents.length > 0) {
      await db.query('UPDATE agents SET id = ABS(id) WHERE id < 0');
    }
    
    // Reset the auto increment counter
    await db.query(`ALTER TABLE agents AUTO_INCREMENT = ${nextId}`);
    
    console.log('Successfully reset all agent IDs starting from 1!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset IDs', err);
    process.exit(1);
  }
}

resetIds();
