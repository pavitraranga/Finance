const db = require('./config/db');

async function migrate() {
  try {
    // Try to add principal_amount column
    try {
      await db.query('ALTER TABLE clients ADD COLUMN principal_amount DECIMAL(15,2) DEFAULT 0');
      console.log('Added principal_amount');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('principal_amount already exists');
      else throw e;
    }

    // Try to add interest_rate column
    try {
      await db.query('ALTER TABLE clients ADD COLUMN interest_rate DECIMAL(5,2) DEFAULT 0');
      console.log('Added interest_rate');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('interest_rate already exists');
      else throw e;
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
