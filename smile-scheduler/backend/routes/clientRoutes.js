//clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Create a new client
router.post('/add', clientController.createClient);
// GET /api/clients/user/:userId
router.get('/user/:userId', clientController.getClientsByUserId); 
// GET /api/clients/client/:clientId
router.get('/client/:clientId', clientController.getClientById);  
// Search
router.get("/search", clientController.searchClients);

module.exports = router;
