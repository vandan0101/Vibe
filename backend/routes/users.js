const express = require('express');
const {
    getProfile,
    updateProfile,
    addFavorite,
    removeFavorite,
    getFavorites,
    updateListeningStats
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites', authMiddleware, addFavorite);
router.delete('/favorites', authMiddleware, removeFavorite);
router.post('/listening-stats', authMiddleware, updateListeningStats);

module.exports = router;
