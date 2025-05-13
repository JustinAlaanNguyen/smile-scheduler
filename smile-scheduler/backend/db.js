//backend/db.js
const mysql = require('mysql2/promise'); // promise wrapper

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Letplay1!',
  database: 'smile_scheduler_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
