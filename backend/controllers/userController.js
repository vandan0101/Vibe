const User = require('../models/User');
const Song = require('../models/Song');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('favorites')
            .populate('playlists')
            .populate('followers')
            .populate('following');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { bio, avatar, theme } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { bio, avatar, theme },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated',
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const { songId } = req.body;

        const user = await User.findById(req.user.userId);
        
        if (user.favorites.includes(songId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Song already in favorites' 
            });
        }

        user.favorites.push(songId);
        await user.save();

        const song = await Song.findByIdAndUpdate(
            songId,
            { $push: { likes: req.user.userId } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Song added to favorites'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { songId } = req.body;

        const user = await User.findById(req.user.userId);
        
        user.favorites = user.favorites.filter(id => id.toString() !== songId);
        await user.save();

        await Song.findByIdAndUpdate(
            songId,
            { $pull: { likes: req.user.userId } }
        );

        res.status(200).json({
            success: true,
            message: 'Song removed from favorites'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('favorites');

        res.status(200).json({
            success: true,
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateListeningStats = async (req, res) => {
    try {
        const { songId, genre, artist, duration } = req.body;

        const user = await User.findById(req.user.userId);

        user.listeningStats.songsPlayed += 1;
        user.listeningStats.totalListeningTime += duration || 0;

        if (!user.listeningStats.topGenres.includes(genre)) {
            user.listeningStats.topGenres.push(genre);
        }

        if (!user.listeningStats.topArtists.includes(artist)) {
            user.listeningStats.topArtists.push(artist);
        }

        user.recentlyPlayed.unshift({
            song: songId,
            playedAt: new Date()
        });

        if (user.recentlyPlayed.length > 50) {
            user.recentlyPlayed.pop();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Listening stats updated'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
