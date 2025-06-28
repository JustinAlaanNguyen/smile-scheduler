// clientController.js
const db = require("../db");

/* ──────────────────────────────────────────────────────────────
 * CREATE  ─  POST /api/clients
 * ----------------------------------------------------------------
 * Add a new client for a given user.
 * ──────────────────────────────────────────────────────────── */
exports.createClient = async (req, res) => {
  const { first_name, last_name, email, phone, user_id, notes } = req.body;

  // Required‑field guard
  if (!first_name || !last_name || !email || !phone || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const insertQuery = `
      INSERT INTO clients (first_name, last_name, email, phone, created_at, user_id, notes)
      VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `;
    const [result] = await db.query(insertQuery, [
      first_name,
      last_name,
      email,
      phone,
      user_id,
      notes,
    ]);

    res.status(201).json({
      message: "Client added successfully",
      clientId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ error: "A client with this email already exists." });
    } else {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to add client." });
    }
  }
};

/* ──────────────────────────────────────────────────────────────
 * READ (all)  ─  GET /api/clients/:userId
 * ----------------------------------------------------------------
 * Fetch every client belonging to a specific user.
 * ──────────────────────────────────────────────────────────── */
exports.getClientsByUserId = async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    const [clients] = await db.query(
      "SELECT * FROM clients WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error retrieving clients:", error);
    res.status(500).json({ error: "Failed to retrieve clients for user" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * READ (single)  ─  GET /api/clients/:clientId?email=user@example.com
 * ----------------------------------------------------------------
 * Fetch one client, ensuring the requesting user owns it.
 * ──────────────────────────────────────────────────────────── */
exports.getClientById = async (req, res) => {
  const { clientId } = req.params;
  const userEmail = req.query.email;

  try {
    // 1. Confirm the user exists
    const [[user]] = await db.query("SELECT id FROM users WHERE email = ?", [
      userEmail,
    ]);
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    // 2. Grab the client record
    const [[client]] = await db.query(
      "SELECT * FROM clients WHERE id = ?",
      [clientId]
    );
    if (!client) return res.status(404).json({ error: "Client not found" });

    // 3. Verify ownership
    if (client.user_id !== user.id)
      return res.status(403).json({ error: "Access denied" });

    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * SEARCH  ─  GET /api/clients/search/:userId?query=...
 * ----------------------------------------------------------------
 * Fuzzy search across first name, last name, email, and phone.
 * ──────────────────────────────────────────────────────────── */
exports.searchClients = async (req, res) => {
  const { userId } = req.params;
  const query = req.query.query || "";

  try {
    const [results] = await db.query(
      `SELECT * FROM clients
       WHERE user_id = ?
         AND (
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

/* ──────────────────────────────────────────────────────────────
 * UPDATE  ─  PUT /api/clients/:clientId
 * ----------------------------------------------------------------
 * Edit basic details or notes for an existing client.
 * ──────────────────────────────────────────────────────────── */
exports.updateClient = async (req, res) => {
  const { clientId } = req.params;
  const { first_name, last_name, email, phone, notes } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE clients
       SET first_name = ?, last_name = ?, email = ?, phone = ?, notes = ?
       WHERE id = ?`,
      [first_name, last_name, email, phone, notes || null, clientId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Client not found" });

    res.status(200).json({ message: "Client updated successfully" });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Database error" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * DELETE  ─  DELETE /api/clients/:clientId
 * ----------------------------------------------------------------
 * Remove a client record permanently.
 * ──────────────────────────────────────────────────────────── */
exports.deleteClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM clients WHERE id = ?",
      [clientId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Client not found" });

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Database error" });
  }
};
