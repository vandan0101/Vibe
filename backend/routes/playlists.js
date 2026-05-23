const express = require('express');
const {
    createPlaylist,
    getPlaylist,
    getUserPlaylists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
    deletePlaylist
} = require('../controllers/playlistController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createPlaylist);
router.get('/', authMiddleware, getUserPlaylists);
router.get('/:id', getPlaylist);
router.put('/:playlistId', authMiddleware, updatePlaylist);
router.delete('/:playlistId', authMiddleware, deletePlaylist);
router.post('/:playlistId/songs', authMiddleware, addSongToPlaylist);
router.delete('/:playlistId/songs', authMiddleware, removeSongFromPlaylist);

module.exports = router;
