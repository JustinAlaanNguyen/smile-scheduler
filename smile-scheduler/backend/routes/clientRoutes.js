//clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/add', clientController.createClient);
router.get('/user/:userId', clientController.getClientsByUserId); 
router.get('/client/:clientId', clientController.getClientById);  
router.get("/user/:userId/search", clientController.searchClients);
router.put('/client/:clientId', clientController.updateClient);
router.delete('/client/:clientId', clientController.deleteClient);


module.exports = router;
