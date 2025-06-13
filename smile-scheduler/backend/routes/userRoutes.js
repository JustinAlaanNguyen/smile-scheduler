//backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create account
router.post('/register', userController.createUser);

// Update account
router.put('/update/:id', userController.updateUser);

// Delete account
router.delete('/delete/:id', userController.deleteUser);
  
router.get('/id/:email', userController.getUserIdByEmail);

router.get('/:email', userController.getUserByEmail);
module.exports = router;
