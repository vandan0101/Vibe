const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    youtubeId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    album: {
        type: String,
        default: 'Unknown Album'
    },
    genre: {
        type: String,
        default: 'Unknown'
    },
    duration: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    audioPath: {
        type: String,
        required: true
    },
    streamUrl: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        default: 'youtube'
    },
    plays: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Song', songSchema);
