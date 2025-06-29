require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('Smile Scheduler Backend is running!');
});

// Routes
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes'); 
const appointmentRoutes = require("./routes/appointmentRoutes");

app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes); 
app.use("/api/appointments", appointmentRoutes);

app.listen(port, () => {
  //console.log(`✅ Server is running on http://localhost:${port}`);
});
