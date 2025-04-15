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
exports.updateUser = (req, res) => {
  const { username, email, password } = req.body;
  const sql = 'UPDATE users SET username=?, email=?, password=? WHERE id=?';
  db.query(sql, [username, email, password, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('User updated successfully');
  });
};

// Delete account
exports.deleteUser = (req, res) => {
  const sql = 'DELETE FROM users WHERE id=?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('User deleted successfully');
  });
};
