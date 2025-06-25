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

//router.get('/:email', userController.getUserByEmail);
router.get('/by-email/:email', userController.getUserByEmail);

router.put('/notifications/enable', userController.enableNotifications);

router.put('/toggle-notifications/:userId', userController.toggleNotifications);

// Email verification
router.get('/verify', userController.verifyEmail);

router.post("/forgot-password", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);

router.get('/:id', userController.getUserById);

module.exports = router;
