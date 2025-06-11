//clientController.js
const db = require('../db');

// Create a new client
exports.createClient = async (req, res) => {
  const { first_name, last_name, email, phone, user_id, notes } = req.body;

  if (!first_name || !last_name || !email || !phone || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const created_at = new Date();
  const query = 'INSERT INTO clients (first_name, last_name, email, phone, created_at, user_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';

  try {
    const [result] = await db.query(query, [
      first_name,
      last_name,
      email,
      phone,
      created_at,
      user_id,
      notes || null,
    ]);
    res.status(201).json({ message: 'Client added successfully', clientId: result.insertId });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get all clients for a specific user// Get all clients for a specific user
exports.getClientsByUserId = async (req, res) => {
  const userId = Number(req.params.userId);
  console.log('➡️ [Controller] Getting clients for userId:', userId);

  try {
    console.log('➡️ [Controller] Getting clients for userId:', userId);
    const [clients] = await db.query('SELECT * FROM clients WHERE user_id = ?', [userId]);
    console.log("Clients:", clients);
    res.status(200).json(clients);
  } catch (error) {
    console.error('[Controller] Error retrieving clients:', error);
    res.status(500).json({ error: 'Failed to retrieve clients for user' });
  }
};


// Get a single client by ID with security check
exports.getClientById = async (req, res) => {
  const { clientId } = req.params;
  const userEmail = req.query.email;

  try {
    //console.log("Fetching client for ID:", clientId, "with email:", userEmail, "BACKEND");

    const [[user]] = await db.query('SELECT id FROM users WHERE email = ?', [userEmail]);
    if (!user) {
      //console.log("User not found for email:", userEmail);
      return res.status(403).json({ error: "Unauthorized" });
    }

    //console.log("User ID found:", user.id);

    const [[client]] = await db.query('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      //console.log("No client found with ID:", clientId);
      return res.status(404).json({ error: "Client not found" });
    }

    if (client.user_id !== user.id) {
      //console.log("Client does not belong to user. Client user_id:", client.user_id, "User ID:", user.id);
      return res.status(403).json({ error: "Access denied" });
    }

    //console.log("Client found and authorized:", client);
    res.status(200).json(client); // Make sure this is NOT wrapped in []
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search clients by user and query
exports.searchClients = async (req, res) => {
  const { userId } = req.params;  // use route param now
  const query = req.query.query || ""; // frontend sends ?query=...

  try {
    const [results] = await db.query(
      `SELECT * FROM clients WHERE user_id = ? AND (
        first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?
      )`,
      [userId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};


//update
exports.updateClient = async (req, res) => {
  const { clientId } = req.params;
  const { first_name, last_name, email, phone, notes } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE clients SET first_name = ?, last_name = ?, email = ?, phone = ?, notes = ? WHERE id = ?`,
      [first_name, last_name, email, phone, notes || null, clientId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

//delete
exports.deleteClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM clients WHERE id = ?`, [clientId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
