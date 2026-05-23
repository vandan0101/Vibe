const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/100?text=User'
    },
    bio: {
        type: String,
        default: 'Music lover'
    },
    listeningStats: {
        totalListeningTime: {
            type: Number,
            default: 0
        },
        topGenres: [String],
        topArtists: [String],
        songsPlayed: {
            type: Number,
            default: 0
        }
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist'
    }],
    recentlyPlayed: [{
        song: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song'
        },
        playedAt: {
            type: Date,
            default: Date.now
        }
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
