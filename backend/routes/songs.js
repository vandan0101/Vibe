const express = require('express');
const {
    getAllSongs,
    getSongById,
    createSong,
    searchSongs,
    streamSong
} = require('../controllers/songController');

const router = express.Router();

router.get('/', getAllSongs);
router.get('/search', searchSongs);
router.get('/:id/stream', streamSong);
router.get('/:id', getSongById);
router.post('/', createSong);

module.exports = router;
