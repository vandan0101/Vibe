const Song = require('../models/Song');

exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find().populate('likes');
        
        res.status(200).json({
            success: true,
            songs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id).populate('likes');

        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }

        res.status(200).json({
            success: true,
            song
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSong = async (req, res) => {
    try {
        const { title, artist, album, genre, duration, image, audioPath } = req.body;

        const song = new Song({
            title,
            artist,
            album,
            genre,
            duration,
            image,
            audioPath
        });

        await song.save();

        res.status(201).json({
            success: true,
            message: 'Song created',
            song
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchSongs = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        const songs = await Song.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { artist: { $regex: query, $options: 'i' } },
                { album: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json({
            success: true,
            songs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
