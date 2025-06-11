//appointmentRoutes.js
const express = require("express");
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get("/user/:userId/range", appointmentController.getAppointmentsInRangeByUserId);
router.post("/create", appointmentController.createAppointment);
router.get("/user/:userId/date/:date", appointmentController.getAppointmentsByDate);


module.exports = router;
