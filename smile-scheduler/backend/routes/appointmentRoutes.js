//appointmentRoutes.js

const express = require("express");
const router = express.Router();
const { createAppointment } = require("../controllers/appointmentController");

router.post("/create", createAppointment);

module.exports = router;
