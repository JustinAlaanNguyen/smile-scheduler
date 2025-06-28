const db = require("../db");
const { sendAppointmentEmail } = require("../utils/mailer");
const { getUserEmailById } = require("../utils/dbHelpers");

// ─────────────────────────────────────────────────────────────
// Formatting helpers
function formatTime(timeString) {
  return timeString?.slice(0, 5) || "";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime12(timeString) {
  const [hour, minute] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hour));
  date.setMinutes(parseInt(minute));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─────────────────────────────────────────────────────────────
// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { client_id, user_id, date, start_time, end_time, length, type, notes } = req.body;

    // Validate required fields
    if (!client_id || !user_id || !date || !start_time || !end_time || !type) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const userInfo = await getUserEmailById(user_id);

    // Check for time conflicts
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
      user_id, date, end_time, start_time,
      end_time, start_time, start_time, end_time,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({ error: "Appointment overlaps with an existing one." });
    }

    // Insert appointment into database
    const insertQuery = `
      INSERT INTO appointments 
      (client_id, user_id, appointment_date, appointment_start, appointment_end, length, type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(insertQuery, [
      parseInt(client_id), parseInt(user_id),
      date, start_time, end_time, length, type, notes || null,
    ]);

    // Fetch all appointments for the same date
    const [appointments] = await db.query(
      `SELECT a.*, c.first_name, c.last_name 
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.user_id = ? AND a.appointment_date = ?`,
      [user_id, date]
    );

    // Build appointment summary email
    const html = `
      <h2>New appointment added for ${formatDate(date)}</h2>
      <p>A new appointment has been scheduled. Here are all appointments for ${formatDate(date)}:</p>
      <ul>
        ${appointments.map(appt => `
          <li>${appt.first_name} ${appt.last_name} — ${formatTime12(appt.appointment_start)} to ${formatTime12(appt.appointment_end)} (${appt.type})</li>
        `).join('')}
      </ul>
    `;

    if (userInfo?.email_notifications_enabled) {
      await sendAppointmentEmail({
        to: userInfo.email,
        subject: `${formatDate(date)} - New appointment has been added!`,
        html,
      });
    }

    res.status(201).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get all appointment dates within a date range for a user
exports.getAppointmentsInRangeByUserId = async (req, res) => {
  const userId = req.params.userId;
  const { start, end } = req.query;

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

// ─────────────────────────────────────────────────────────────
// Get all appointments for a specific user and date
exports.getAppointmentsByDate = async (req, res) => {
  const { userId, date } = req.params;

  try {
    const [appointments] = await db.query(
      `SELECT 
         a.id, a.appointment_start, a.appointment_end, a.type, a.notes,
         TIMESTAMPDIFF(MINUTE, a.appointment_start, a.appointment_end) AS duration,
         c.first_name, c.last_name
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.user_id = ? AND DATE(a.appointment_date) = ?`,
      [userId, date]
    );

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments by date:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get single appointment by ID
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
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Update an appointment
exports.updateAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { date, start_time, end_time, length, type, notes, user_id } = req.body;

  if (!date || !start_time || !end_time || !type || !user_id) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const userInfo = await getUserEmailById(user_id);

    // Check for conflicting appointments
    const overlapQuery = `
      SELECT * FROM appointments 
      WHERE user_id = ? AND appointment_date = ? AND id != ?
        AND (
          (appointment_start < ? AND appointment_end > ?)
          OR (appointment_start < ? AND appointment_end > ?)
          OR (appointment_start >= ? AND appointment_end <= ?)
        )
    `;
    const [conflicts] = await db.query(overlapQuery, [
      user_id, date, appointmentId,
      end_time, start_time,
      end_time, start_time,
      start_time, end_time,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({ error: "Updated time overlaps with another appointment." });
    }

    const [oldResult] = await db.query(`SELECT * FROM appointments WHERE id = ?`, [appointmentId]);
    const oldAppt = oldResult[0];

    // Update appointment
    await db.query(
      `UPDATE appointments 
       SET appointment_date = ?, appointment_start = ?, appointment_end = ?, length = ?, type = ?, notes = ?
       WHERE id = ?`,
      [date, start_time, end_time, length, type, notes, appointmentId]
    );

    const [appointments] = await db.query(
      `SELECT a.*, c.first_name, c.last_name 
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.user_id = ? AND a.appointment_date = ?`,
      [user_id, date]
    );

    const newDateFormatted = new Date(date).toISOString().split("T")[0];
    const html = `
      <h2>Appointment updated for ${newDateFormatted}</h2>
      <p><strong>Before:</strong> ${formatDate(oldAppt.appointment_date)} — ${formatTime12(oldAppt.appointment_start)} to ${formatTime12(oldAppt.appointment_end)} (${oldAppt.type})</p>
      <p><strong>After:</strong> ${formatDate(date)} — ${formatTime12(start_time)} to ${formatTime12(end_time)} (${type})</p>
      <p>All appointments for ${newDateFormatted}:</p>
      <ul>
        ${appointments.map(appt => `
          <li>${appt.first_name} ${appt.last_name} — ${formatTime(appt.appointment_start)} to ${formatTime(appt.appointment_end)} (${appt.type})</li>
        `).join('')}
      </ul>
    `;

    if (userInfo?.email_notifications_enabled) {
      await sendAppointmentEmail({
        to: userInfo.email,
        subject: `${formatDate(date)} - Updated appointment!`,
        html,
      });
    }

    res.json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const [apptResult] = await db.query(
      `SELECT a.*, c.first_name, c.last_name 
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (apptResult.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const deletedAppt = apptResult[0];
    const userInfo = await getUserEmailById(deletedAppt.user_id);

    await db.query("DELETE FROM appointments WHERE id = ?", [appointmentId]);

    const [remainingAppointments] = await db.query(
      `SELECT a.*, c.first_name, c.last_name 
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.user_id = ? AND a.appointment_date = ?`,
      [deletedAppt.user_id, deletedAppt.appointment_date]
    );

    const formattedDate = formatDate(deletedAppt.appointment_date);

    const html = `
      <h2>Appointment deleted for ${formattedDate}</h2>
      <p>The following appointment was deleted:</p>
      <ul>
        <li>${deletedAppt.first_name} ${deletedAppt.last_name} — ${formatTime(deletedAppt.appointment_start)} to ${formatTime(deletedAppt.appointment_end)} (${deletedAppt.type})</li>
      </ul>
      <p>Remaining appointments for ${formattedDate}:</p>
      ${
        remainingAppointments.length > 0
          ? `<ul>
              ${remainingAppointments.map(appt => `
                <li>${appt.first_name} ${appt.last_name} — ${formatTime(appt.appointment_start)} to ${formatTime(appt.appointment_end)} (${appt.type})</li>
              `).join('')}
            </ul>`
          : `<p><em>No appointments remain on this day.</em></p>`
      }
    `;

    if (userInfo?.email_notifications_enabled) {
      await sendAppointmentEmail({
        to: userInfo.email,
        subject: `${formattedDate} - Appointment deleted`,
        html,
      });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
