// backend/utils/dbHelpers.js

const db = require('../db');

const getUserEmailById = async (userId) => {
  const [rows] = await db.query(
    "SELECT email, email_notifications_enabled FROM users WHERE id = ?",
    [userId]
  );
  if (rows.length === 0) return null;
  return rows[0]; // { email, email_notifications_enabled }
};

module.exports = {
  getUserEmailById,
};
