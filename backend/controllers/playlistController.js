const Playlist = require('../models/Playlist');
const User = require('../models/User');

exports.createPlaylist = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;

        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Playlist name is required' 
            });
        }

        const playlist = new Playlist({
            name,
            description,
            owner: req.user.userId,
            isPublic
        });

        await playlist.save();

        const user = await User.findById(req.user.userId);
        user.playlists.push(playlist._id);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Playlist created',
            playlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('songs').populate('owner');

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        res.status(200).json({
            success: true,
            playlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user.userId }).populate('songs');

        res.status(200).json({
            success: true,
            playlists
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addSongToPlaylist = async (req, res) => {
    try {
        const { songId } = req.body;
        const { playlistId } = req.params;

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this playlist' 
            });
        }

        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Song already in playlist' 
            });
        }

        playlist.songs.push(songId);
        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Song added to playlist'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeSongFromPlaylist = async (req, res) => {
    try {
        const { songId } = req.body;
        const { playlistId } = req.params;

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this playlist' 
            });
        }

        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Song removed from playlist'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePlaylist = async (req, res) => {
    try {
        const { name, description, isPublic, image } = req.body;
        const { playlistId } = req.params;

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this playlist' 
            });
        }

        playlist.name = name || playlist.name;
        playlist.description = description || playlist.description;
        playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;
        playlist.image = image || playlist.image;

        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Playlist updated',
            playlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this playlist' 
            });
        }

        await Playlist.findByIdAndDelete(playlistId);

        const user = await User.findById(req.user.userId);
        user.playlists = user.playlists.filter(id => id.toString() !== playlistId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Playlist deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
