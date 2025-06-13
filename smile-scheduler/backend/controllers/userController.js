//backend/controllers/userController.js
const bcrypt = require('bcrypt');
const db = require('../db');

// Create account
exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Hash the password (10 salt rounds is standard)
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Save user to DB with hashed password
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(query, [username, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('DB error:', err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
  
        return res.status(201).json({ message: 'User created successfully!' });
      });
    } catch (error) {
      console.error('Hashing error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

// Update account
exports.updateUser = async (req, res) => {
  const { username, email, password } = req.body;
  const id = req.params.id;

  try {
    let sql, params;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = 'UPDATE users SET username=?, email=?, password=? WHERE id=?';
      params = [username, email, hashedPassword, id];
    } else {
      sql = 'UPDATE users SET username=?, email=? WHERE id=?';
      params = [username, email, id];
    }

    db.query(sql, params, (err) => {
      if (err) {
        console.error('Update DB error:', err);
        return res.status(500).send(err);
      }
      res.send('User updated successfully');
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Delete account and all related appointments/clients// Delete account and related data
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Delete appointments linked to the user
    await db.query('DELETE FROM appointments WHERE user_id = ?', [userId]);

    // Delete clients linked to the user
    await db.query('DELETE FROM clients WHERE user_id = ?', [userId]);

    // Delete the user
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.send('User and related data deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user and related data' });
  }
};


// Get id of user by email
exports.getUserIdByEmail = async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const [results] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    console.log("Requesting userId for email:", email);
    console.log("Query results:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ id: results[0].id });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserByEmail = async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const [results] = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(results[0]);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};