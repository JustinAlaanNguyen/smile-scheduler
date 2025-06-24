//backend/db.js
const mysql = require('mysql2/promise'); // promise wrapper

const pool = mysql.createPool({
  host: 'smile-scheduler-db.clu2esaqsxaz.ca-central-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Letplay123456789!',
  database: 'smile_scheduler_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
