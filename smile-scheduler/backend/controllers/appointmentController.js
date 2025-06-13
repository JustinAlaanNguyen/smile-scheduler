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

    // Overlap check
    const overlapQuery = `
      SELECT * FROM appointments 
      WHERE user_id = ? AND appointment_date = ?
        AND (
          (appointment_start < ? AND appointment_end > ?)
          OR (appointment_start < ? AND appointment_end > ?)
          OR (appointment_start >= ? AND appointment_end <= ?)
        )
    `;
    const [conflicts] = await db.query(overlapQuery, [
      user_id,
      date,
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time,
    ]);

    if (conflicts.length > 0) {
      return res
        .status(409)
        .json({ error: "Appointment overlaps with an existing one." });
    }

    // Proceed with insert
    const query = `
      INSERT INTO appointments 
      (client_id, user_id, appointment_date, appointment_start, appointment_end, length, type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
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
      `SELECT 
         a.id,
         a.appointment_start, 
         a.appointment_end, 
         a.type, 
         a.notes,
         TIMESTAMPDIFF(MINUTE, a.appointment_start, a.appointment_end) AS duration,
         c.first_name, c.last_name
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.user_id = ? AND a.appointment_date = ?`,
      [userId, date]
    );
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments for date:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAppointmentById = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT * FROM appointments WHERE id = ?`,
      [appointmentId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.updateAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const {
    date,
    start_time,
    end_time,
    length,
    type,
    notes,
    user_id, // Ensure user_id is sent from frontend when updating
  } = req.body;

  if (!date || !start_time || !end_time || !type || !user_id) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Overlap check (excluding the current appointment being updated)
    const overlapQuery = `
      SELECT * FROM appointments 
      WHERE user_id = ? AND appointment_date = ?
        AND id != ?
        AND (
          (appointment_start < ? AND appointment_end > ?)
          OR (appointment_start < ? AND appointment_end > ?)
          OR (appointment_start >= ? AND appointment_end <= ?)
        )
    `;
    const [conflicts] = await db.query(overlapQuery, [
      user_id,
      date,
      appointmentId,
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time,
    ]);

    if (conflicts.length > 0) {
      return res
        .status(409)
        .json({ error: "Updated time overlaps with another appointment." });
    }

    // Proceed with update
    await db.query(
      `UPDATE appointments 
       SET appointment_date = ?, appointment_start = ?, appointment_end = ?, length = ?, type = ?, notes = ?
       WHERE id = ?`,
      [date, start_time, end_time, length, type, notes, appointmentId]
    );

    res.json({ message: "Appointment updated successfully" });
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const [result] = await db.query("DELETE FROM appointments WHERE id = ?", [appointmentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
