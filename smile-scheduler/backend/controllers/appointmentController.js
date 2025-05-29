//appointmentController.js
const db = require("../db");

const createAppointment = async (req, res) => {
  try {
    const {
      client_id,
      user_id,
      date,
      start_time,
      end_time,
      length,
      type,
      notes,
    } = req.body;

    if (!client_id || !user_id || !date || !start_time || !end_time || !type) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const query = `
      INSERT INTO appointments 
      (client_id, user_id, appointment_date, appointment_start, appointment_end, length, type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      client_id,
      user_id,
      date,
      start_time,
      end_time,
      length,
      type,
      notes || null,
    ]);

    return res.status(201).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createAppointment,
};
