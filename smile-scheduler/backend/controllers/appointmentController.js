//appointmentController.js
const db = require("../db");

exports.createAppointment = async (req, res) => {
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
    console.log("Received appointment data:", req.body);

    await db.query(query, [
       parseInt(client_id),
        parseInt(user_id),
      date,
      start_time,
      end_time,
      length,
      type,
      notes || null,
    ]);

    return res.status(201).json({ message: "Appointment created successfully" });
  } catch (error) {
  console.error("Error creating appointment:", error.message, error.stack);
  return res.status(500).json({ error: "Internal server error" });
  }
};

//in range bcs causing issues
exports.getAppointmentsInRangeByUserId = async (req, res) => {
  const userId = req.params.userId;
  const { start, end } = req.query;

  console.log("start:", start);
    console.log("end:", end);

  try {
    const [appointments] = await db.query(
      `SELECT appointment_date FROM appointments WHERE user_id = ? AND appointment_date BETWEEN ? AND ?`,
      [userId, start, end]
    );

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments in range:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAppointmentsByDate = async (req, res) => {
  const { userId, date } = req.params;

  try {
    const [appointments] = await db.query(
      `SELECT appointment_start, appointment_end 
       FROM appointments 
       WHERE user_id = ? AND appointment_date = ?`,
      [userId, date]
    );

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments for date:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
