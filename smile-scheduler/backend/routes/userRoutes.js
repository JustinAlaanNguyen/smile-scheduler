//backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createUser);
router.put('/update/:id', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);
router.get('/id/:email', userController.getUserIdByEmail);
router.get('/by-email/:email', userController.getUserByEmail);
router.put('/notifications/enable', userController.enableNotifications);
router.put('/toggle-notifications/:userId', userController.toggleNotifications);
router.get('/verify', userController.verifyEmail);
router.post("/forgot-password", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.get('/:id', userController.getUserById);

module.exports = router;
