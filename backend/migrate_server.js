const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const replacements = [
  { from: "const upload = multer({ dest: 'uploads/' });", to: "const upload = multer({ dest: 'uploads/' });\n\nconst getTable = (req, baseTable) => req.headers['x-system-type'] === 'gold' ? `gold_${baseTable}` : baseTable;" },
  
  // Agents
  { from: "'SELECT * FROM agents ORDER BY created_at DESC'", to: "`SELECT * FROM ${getTable(req, 'agents')} ORDER BY created_at DESC`" },
  { from: "'SELECT * FROM agents WHERE name LIKE ? ORDER BY created_at DESC'", to: "`SELECT * FROM ${getTable(req, 'agents')} WHERE name LIKE ? ORDER BY created_at DESC`" },
  { from: "'INSERT INTO agents (name, phone) VALUES (?, ?)'", to: "`INSERT INTO ${getTable(req, 'agents')} (name, phone) VALUES (?, ?)`" },
  { from: "'SELECT * FROM agents WHERE id = ?'", to: "`SELECT * FROM ${getTable(req, 'agents')} WHERE id = ?`" },
  { from: "'UPDATE agents SET name = ?, phone = ? WHERE id = ?'", to: "`UPDATE ${getTable(req, 'agents')} SET name = ?, phone = ? WHERE id = ?`" },
  { from: "'DELETE FROM agents WHERE id = ?'", to: "`DELETE FROM ${getTable(req, 'agents')} WHERE id = ?`" },
  { from: "'SELECT COUNT(*) as count FROM agents'", to: "`SELECT COUNT(*) as count FROM ${getTable(req, 'agents')}`" },
  { from: "'ALTER TABLE agents AUTO_INCREMENT = 1'", to: "`ALTER TABLE ${getTable(req, 'agents')} AUTO_INCREMENT = 1`" },

  // Clients
  { from: "'SELECT * FROM clients WHERE agent_id = ? ORDER BY created_at DESC'", to: "`SELECT * FROM ${getTable(req, 'clients')} WHERE agent_id = ? ORDER BY created_at DESC`" },
  { from: "'SELECT * FROM clients WHERE agent_id = ? AND (name LIKE ? OR phone LIKE ?) ORDER BY created_at DESC'", to: "`SELECT * FROM ${getTable(req, 'clients')} WHERE agent_id = ? AND (name LIKE ? OR phone LIKE ?) ORDER BY created_at DESC`" },
  { from: "'INSERT INTO clients (agent_id, name, phone, page_no, description, principal_amount, interest_rate, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'", to: "`INSERT INTO ${getTable(req, 'clients')} (agent_id, name, phone, page_no, description, principal_amount, interest_rate, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`" },
  { from: "'UPDATE clients SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ?'", to: "`UPDATE ${getTable(req, 'clients')} SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ?`" },
  { from: "'SELECT * FROM clients WHERE id = ?'", to: "`SELECT * FROM ${getTable(req, 'clients')} WHERE id = ?`" },
  { from: "'DELETE FROM clients WHERE id = ?'", to: "`DELETE FROM ${getTable(req, 'clients')} WHERE id = ?`" },

  // Entries
  { from: "'INSERT INTO client_entries (client_id, paid_principal, paid_interest, adjustment, payment_method, entry_date) VALUES (?, ?, ?, ?, ?, ?)'", to: "`INSERT INTO ${getTable(req, 'client_entries')} (client_id, paid_principal, paid_interest, adjustment, payment_method, entry_date) VALUES (?, ?, ?, ?, ?, ?)`" },
  { from: "'SELECT * FROM client_entries WHERE id = ?'", to: "`SELECT * FROM ${getTable(req, 'client_entries')} WHERE id = ?`" },
  { from: "'UPDATE client_entries SET entry_date = ?, paid_principal = ?, paid_interest = ?, adjustment = ?, payment_method = ? WHERE id = ?'", to: "`UPDATE ${getTable(req, 'client_entries')} SET entry_date = ?, paid_principal = ?, paid_interest = ?, adjustment = ?, payment_method = ? WHERE id = ?`" },
  { from: "'DELETE FROM client_entries WHERE id = ?'", to: "`DELETE FROM ${getTable(req, 'client_entries')} WHERE id = ?`" },
  { from: "'SELECT * FROM client_entries WHERE client_id = ? ORDER BY entry_date DESC'", to: "`SELECT * FROM ${getTable(req, 'client_entries')} WHERE client_id = ? ORDER BY entry_date DESC`" },

  // Summary
  { from: "'SELECT principal_amount, interest_rate FROM clients WHERE id = ?'", to: "`SELECT principal_amount, interest_rate FROM ${getTable(req, 'clients')} WHERE id = ?`" },
  { from: "'SELECT SUM(paid_principal) as tp, SUM(paid_interest) as ti FROM client_entries WHERE client_id = ?'", to: "`SELECT SUM(paid_principal) as tp, SUM(paid_interest) as ti FROM ${getTable(req, 'client_entries')} WHERE client_id = ?`" },
  { from: "'UPDATE clients SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ?'", to: "`UPDATE ${getTable(req, 'clients')} SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ?`" },
  { from: "'UPDATE clients SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ? WHERE id = ?'", to: "`UPDATE ${getTable(req, 'clients')} SET name = ?, phone = ?, page_no = ?, description = ?, principal_amount = ?, interest_rate = ? WHERE id = ?`" },
  
  // Profit Global multiline
  { from: "FROM client_entries ce", to: "FROM ${getTable(req, 'client_entries')} ce" },
  { from: "JOIN clients c ON", to: "JOIN ${getTable(req, 'clients')} c ON" },
  { from: "JOIN agents a ON", to: "JOIN ${getTable(req, 'agents')} a ON" },

  // Monthly Profit multiline
  { from: "FROM clients c", to: "FROM ${getTable(req, 'clients')} c" },
  { from: "LEFT JOIN client_entries ce ON", to: "LEFT JOIN ${getTable(req, 'client_entries')} ce ON" }
];

for (let r of replacements) {
  code = code.split(r.from).join(r.to);
}

// Special case for UPDATE clients which is dynamically constructed in server.js:
// let query = 'UPDATE clients SET ...'
code = code.split("'UPDATE clients SET name").join("`UPDATE ${getTable(req, 'clients')} SET name");

fs.writeFileSync('server.js', code);
console.log('Server migrated successfully!');
