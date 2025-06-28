// backend/controllers/userController.js
const bcrypt = require("bcryptjs");
const db = require("../db");
const sendEmail = require("../utils/email");
const { v4: uuidv4 } = require("uuid");

/* ──────────────────────────────────────────────────────────────
 * CREATE  ─  POST /api/users
 * ----------------------------------------------------------------
 * Register a new user and send a verification e‑mail.
 * ──────────────────────────────────────────────────────────── */
exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword   = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const tokenExpires      = new Date(Date.now() + 60 * 60 * 1000); // +1h

    await db.query(
      `INSERT INTO users
       (username, email, password, email_verified,
        verification_token, verification_token_expires)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, false, verificationToken, tokenExpires]
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${encodeURIComponent(
      verificationToken
    )}`;

    await sendEmail({
      to: email,
      subject: "Verify your Smile Scheduler account",
      html: `
        <h2>Welcome, ${username}!</h2>
        <p>Click below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    });

    res.status(201).json({ message: "User created. Verification email sent." });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "User creation failed." });
  }
};

/* ──────────────────────────────────────────────────────────────
 * UPDATE  ─  PUT /api/users/:id
 * ----------------------------------------------------------------
 * Update username, email, and/or password for an existing user.
 * ──────────────────────────────────────────────────────────── */
exports.updateUser = async (req, res) => {
  const { username, email, password } = req.body;
  const id = req.params.id;

  try {
    let sql, params;

    if (password) {
      // Password change requires hashing the new value
      const [[row]] = await db.query(
        "SELECT password FROM users WHERE id = ?",
        [id]
      );
      const newHash = await bcrypt.hash(password, 10);

      sql = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
      params = [username, email, newHash, id];
    } else {
      sql = "UPDATE users SET username = ?, email = ? WHERE id = ?";
      params = [username, email, id];
    }

    await db.query(sql, params);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * DELETE  ─  DELETE /api/users/:id
 * ----------------------------------------------------------------
 * Remove a user and all of their related data.
 * ──────────────────────────────────────────────────────────── */
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await db.query("DELETE FROM appointments WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM clients      WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM users        WHERE id      = ?", [userId]);

    res.send("User and related data deleted successfully");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user and related data" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * READ helpers
 * ---------------------------------------------------------------- */
exports.getUserIdByEmail = async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const [results] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (!results.length)
      return res.status(404).json({ error: "User not found" });

    res.json({ id: results[0].id });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserByEmail = async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const [results] = await db.query(
      `SELECT id, username, email, role, created_at,
              email_notifications_enabled
         FROM users
        WHERE email = ?`,
      [email]
    );
    if (!results.length)
      return res.status(404).json({ error: "User not found" });

    res.json(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.id;

  try {
    const [results] = await db.query(
      `SELECT id, username, email, role,
              created_at, email_notifications_enabled
         FROM users
        WHERE id = ?`,
      [id]
    );
    if (!results.length)
      return res.status(404).json({ error: "User not found" });

    res.json(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * NOTIFICATION SETTINGS
 * ---------------------------------------------------------------- */
exports.enableNotifications = async (req, res) => {
  const { email } = req.body;

  try {
    await db.query(
      "UPDATE users SET notifications_enabled = TRUE WHERE email = ?",
      [email]
    );
    res.json({ message: "Notifications enabled" });
  } catch (error) {
    console.error("Enable notifications error:", error);
    res.status(500).json({ error: "Failed to enable notifications" });
  }
};

exports.toggleNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      "UPDATE users SET email_notifications_enabled = NOT email_notifications_enabled WHERE id = ?",
      [userId]
    );
    if (!rows.affectedRows)
      return res.status(404).json({ message: "User not found." });

    const [updatedUser] = await db.query(
      "SELECT email_notifications_enabled FROM users WHERE id = ?",
      [userId]
    );
    res.json(updatedUser[0]);
  } catch (error) {
    console.error("Toggle notifications error:", error);
    res.status(500).json({ message: "Error toggling notifications", error });
  }
};

/* ──────────────────────────────────────────────────────────────
 * EMAIL VERIFICATION
 * ---------------------------------------------------------------- */
exports.verifyEmail = async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: "No token provided" });

  try {
    const [results] = await db.query(
      "SELECT id FROM users WHERE verification_token = ?",
      [token]
    );
    if (!results.length)
      return res.status(400).json({ error: "Invalid or expired token" });

    await db.query(
      "UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?",
      [results[0].id]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

/* ──────────────────────────────────────────────────────────────
 * PASSWORD RESET
 * ---------------------------------------------------------------- */
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const token        = uuidv4();
  const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // +1h

  try {
    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (!users.length)
      return res.status(404).json({ error: "Email not found." });

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [token, tokenExpires, email]
    );

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
      token
    )}`;
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `<p>Click below to reset your password:</p><a href="${link}">Reset Password</a>`,
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const [users] = await db.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );
    if (!users.length)
      return res.status(400).json({ error: "Invalid or expired token." });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashed, users[0].id]
    );

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: "Reset failed." });
  }
};
