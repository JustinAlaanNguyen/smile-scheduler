const db = require('../db');

async function getUserEmailById(userId) {
  const [results] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
  if (results.length === 0) {
    throw new Error(`No user found with ID ${userId}`);
  }
  return results[0].email;
}

module.exports = {
  getUserEmailById,
};
