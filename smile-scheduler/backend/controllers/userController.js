//backend/controllers/userController.js
const bcrypt = require('bcrypt');
const db = require('../db');
const sendEmail = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

// Create account
exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    const verificationToken = uuidv4(); // Generate unique token

   await db.query(
  'INSERT INTO users (username, email, password, email_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?)',
  [username, email, hashedPassword, false, verificationToken, tokenExpires]
);
    const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: 'Verify your Smile Scheduler account',
      html: `
        <h2>Welcome, ${username}!</h2>
        <p>Click below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    });

    res.status(201).json({ message: 'User created. Verification email sent.' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'User creation failed.' });
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

exports.enableNotifications = async (req, res) => {
  const { email } = req.body;
  try {
    await db.query(
      "UPDATE users SET notifications_enabled = true WHERE email = ?",
      [email]
    );
    res.json({ message: "Notifications enabled" });
  } catch (error) {
    console.error("Error enabling notifications:", error);
    res.status(500).json({ error: "Failed to enable notifications" });
  }
};

// Toggle email notifications
exports.toggleNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      "UPDATE users SET email_notifications_enabled = NOT email_notifications_enabled WHERE id = ?",
      [userId]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const [updatedUser] = await db.query("SELECT email_notifications_enabled FROM users WHERE id = ?", [userId]);
    res.json(updatedUser[0]);
  } catch (error) {
    res.status(500).json({ message: "Error toggling notifications", error });
  }
};

exports.verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM users WHERE verification_token = ?",
      [token]
    );

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const userId = results[0].id;

    await db.query(
      "UPDATE users SET email_verified = true, verification_token = NULL WHERE id = ?",
      [userId]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Failed to verify email" });
  }
};

