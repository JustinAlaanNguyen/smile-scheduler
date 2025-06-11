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
// Search Match: /api/clients/user/:userId/search?query=...
router.get("/user/:userId/search", clientController.searchClients);
// update
router.put('/client/:clientId', clientController.updateClient);
// delete
router.delete('/client/:clientId', clientController.deleteClient);


module.exports = router;
