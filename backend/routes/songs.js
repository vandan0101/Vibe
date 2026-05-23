const express = require('express');
const {
    getAllSongs,
    getSongById,
    createSong,
    searchSongs
} = require('../controllers/songController');

const router = express.Router();

router.get('/', getAllSongs);
router.get('/search', searchSongs);
router.get('/:id', getSongById);
router.post('/', createSong);

module.exports = router;
