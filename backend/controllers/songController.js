const Song = require('../models/Song');
const ytSearch = require('yt-search');
const playdl = require('play-dl');
const ytdl = require('@distube/ytdl');
const fs = require('fs');
const path = require('path');

const DEFAULT_QUERY = process.env.DEFAULT_SONG_QUERY || 'music';
const DEFAULT_INITIAL_LIMIT = 8;
const MAX_SONG_LIMIT = 18;

function parseSongLimit(value, fallback) {
    const parsedLimit = Number.parseInt(value, 10);

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        return fallback;
    }

    return Math.min(parsedLimit, MAX_SONG_LIMIT);
}

function getThumbnail(video) {
    const thumbnails = (video && (video.thumbnail?.thumbnails || video.thumbnails)) || [];
    const bestThumbnail = thumbnails[thumbnails.length - 1] || thumbnails[0] || null;
    return (bestThumbnail && bestThumbnail.url) || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
}

function mapVideoToSong(video) {
    if (!video || !video.videoId) return null;

    const streamPath = `/api/songs/${video.videoId}/stream`;
    return {
        youtubeId: video.videoId,
        title: video.title || 'Unknown Title',
        artist: (video.author && video.author.name) || 'Unknown Artist',
        album: (video.author && video.author.name) || 'YouTube',
        genre: 'YouTube',
        duration: (video.duration && (video.duration.seconds || video.seconds)) || 0,
        image: getThumbnail(video),
        audioPath: streamPath,
        streamUrl: streamPath,
        url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`,
        source: 'youtube'
    };
}

async function searchYouTube(query, limit = 18) {
    const searchResult = await ytSearch(query);
    const videos = Array.isArray(searchResult && searchResult.videos) ? searchResult.videos.slice(0, limit) : [];
    const mappedSongs = [];

    for (const video of videos) {
        const songData = mapVideoToSong(video);
        if (!songData) continue;

        const song = await Song.findOneAndUpdate(
            { youtubeId: songData.youtubeId },
            { $set: songData },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        mappedSongs.push(song);
    }

    return mappedSongs;
}

function getStreamContentType(type) {
    if (type === 'opus') return 'audio/webm; codecs=opus';
    if (type === 'ogg') return 'audio/ogg';
    return 'audio/mpeg';
}

function getBestAudioFormat(info) {
    const formats = Array.isArray(info && info.format) ? info.format : [];
    const audioOnlyFormats = formats.filter((format) => {
        const mimeType = (format && format.mimeType) || '';
        return format && format.url && mimeType.includes('audio') && !mimeType.includes('video');
    });

    return (
        audioOnlyFormats.find((format) => ((format.mimeType || '').includes('audio/mp4'))) ||
        audioOnlyFormats.find((format) => ((format.mimeType || '').includes('audio/webm'))) ||
        audioOnlyFormats[0] ||
        null
    );
}

exports.getAllSongs = async (req, res) => {
    try {
        const query = (req.query.query || req.query.q || DEFAULT_QUERY).trim();
        const hasCustomQuery = Boolean(req.query.query || req.query.q);
        const limit = parseSongLimit(
            req.query.limit,
            hasCustomQuery ? MAX_SONG_LIMIT : DEFAULT_INITIAL_LIMIT
        );
        const songs = await searchYouTube(query, limit);

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
        const song = await Song.findOne({
            $or: [{ _id: req.params.id }, { youtubeId: req.params.id }]
        }).populate('likes');

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
        const { youtubeId, title, artist, album, genre, duration, image, audioPath, streamUrl, url } = req.body;

        const song = new Song({
            youtubeId,
            title,
            artist,
            album,
            genre,
            duration,
            image,
            audioPath,
            streamUrl,
            url,
            source: 'youtube'
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
        const query = (req.query.query || req.query.q || '').trim();
        const limit = parseSongLimit(req.query.limit, MAX_SONG_LIMIT);

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const songs = await searchYouTube(query, limit);

        res.status(200).json({
            success: true,
            songs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.streamSong = async (req, res) => {
    try {
        const youtubeId = req.params.id;
        console.log('Stream requested for:', youtubeId);
        const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

        // Try getting stream URL from play-dl (most reliable method)
        try {
            console.log('Attempting play-dl get_url:', videoUrl);
            const url = await playdl.video_basic_info(videoUrl)
                .then(info => {
                    console.log('Got video info, formats available:', info.video_details?.formats?.length || 0);
                    if (info && info.video_details && info.video_details.formats) {
                        const audioFormats = info.video_details.formats.filter(f => f.mimeType && f.mimeType.includes('audio'));
                        console.log('Audio formats available:', audioFormats.length);
                        if (audioFormats.length) {
                            const best = audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
                            console.log('Selected audio format with bitrate:', best.bitrate, 'URL exists:', !!best.url);
                            return best.url;
                        }
                    }
                    return null;
                })
                .catch(err => {
                    console.warn('play-dl basic info failed:', err.message);
                    return null;
                });

            if (url) {
                console.log('Streaming extracted URL through server');
                res.setHeader('Cache-Control', 'no-store');

                // If the song is in our DB and has a local audioPath, serve the file with Range support
                const song = await Song.findOne({ $or: [{ _id: youtubeId }, { youtubeId: youtubeId }] }).catch(() => null);
                if (song && song.audioPath && !/^(https?:)?\/\//i.test(song.audioPath)) {
                    const fileRel = song.audioPath.replace(/^\//, '');
                    const filePath = path.join(__dirname, '..', '..', fileRel);

                    if (fs.existsSync(filePath)) {
                        const stat = fs.statSync(filePath);
                        const total = stat.size;
                        const range = req.headers.range;

                        if (range) {
                            const parts = range.replace(/bytes=/, '').split('-');
                            const start = parseInt(parts[0], 10);
                            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
                            if (start >= total || end >= total) {
                                res.status(416).set({ 'Content-Range': `bytes */${total}` }).end();
                                return;
                            }

                            res.writeHead(206, {
                                'Content-Range': `bytes ${start}-${end}/${total}`,
                                'Accept-Ranges': 'bytes',
                                'Content-Length': (end - start) + 1,
                                'Content-Type': 'audio/mpeg'
                            });

                            const stream = fs.createReadStream(filePath, { start, end });
                            stream.pipe(res);
                            return;
                        }

                        // No range - send entire file
                        res.writeHead(200, {
                            'Content-Length': total,
                            'Content-Type': 'audio/mpeg',
                            'Accept-Ranges': 'bytes'
                        });
                        fs.createReadStream(filePath).pipe(res);
                        return;
                    }
                }

                try {
                    // Try to stream via play-dl to ensure CORS-friendly streaming
                    const streamInfo = await playdl.stream(videoUrl).catch(() => null);
                    if (streamInfo && streamInfo.stream) {
                        const stream = streamInfo.stream;
                        const type = streamInfo.type || '';
                        if (type === 'opus') {
                            res.setHeader('Content-Type', 'audio/webm; codecs=opus');
                        } else if (type === 'ogg') {
                            res.setHeader('Content-Type', 'audio/ogg');
                        } else {
                            res.setHeader('Content-Type', 'audio/mpeg');
                        }

                        stream.pipe(res);
                        return;
                    }

                    // Fallback: try ytdl stream
                    const ytdlStream = ytdl(videoUrl, { filter: 'audioonly', highWaterMark: 1 << 25 });
                    res.setHeader('Content-Type', 'audio/mpeg');
                    ytdlStream.pipe(res);
                    return;
                } catch (streamErr) {
                    console.warn('Server-side streaming failed, falling back to redirect:', streamErr);
                    res.setHeader('Cache-Control', 'no-store');
                    return res.redirect(url);
                }
            }
        } catch (err) {
            console.warn('play-dl URL extraction failed:', err && err.message ? err.message : err);
        }

        // Fallback: use a public API proxy (noembed or similar)
        try {
            console.log('Using fallback streaming approach');
            // Return a player that fetches from a public proxy
            const proxyUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
            
            // Simple HTML5 player redirect - user's browser will handle the video
            return res.json({
                success: true,
                message: 'Streaming via public proxy',
                videoUrl: proxyUrl,
                youtubeId: youtubeId
            });
        } catch (err) {
            console.error('Fallback method error:', err);
        }

        // If everything fails
        throw new Error('Unable to stream video - all methods failed');
    } catch (error) {
        console.error('Stream error:', error && error.message ? error.message : error);
        res.status(500).json({ success: false, message: 'Unable to stream video' });
    }
};
