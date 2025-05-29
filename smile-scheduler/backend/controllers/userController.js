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

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'UPDATE users SET username=?, email=?, password=? WHERE id=?';

    db.query(sql, [username, email, hashedPassword, req.params.id], (err) => {
      if (err) return res.status(500).send(err);
      res.send('User updated successfully');
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Delete account
exports.deleteUser = (req, res) => {
  const sql = 'DELETE FROM users WHERE id=?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('User deleted successfully');
  });
};


// Get id of user by email
exports.getUserIdByEmail = (req, res) => {
  const email = decodeURIComponent(req.params.email); // ✅ correctly accessing req.params.email

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    console.log("Requesting userId for email:", email);

    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: results[0].id });
  });
};
