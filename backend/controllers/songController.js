const Song = require('../models/Song');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const DEFAULT_QUERY = process.env.DEFAULT_SONG_QUERY || 'music';
const DEFAULT_INITIAL_LIMIT = 8;
const MAX_SONG_LIMIT = 18;
const STREAM_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const PIPED_API_INSTANCES = [
    process.env.PIPED_API_BASE,
    'https://piped.video',
    'https://pipedapi.kavin.rocks'
].filter(Boolean);

function serveAudioFileWithRange(filePath, req, res) {
    if (!fs.existsSync(filePath)) {
        return false;
    }

    const stat = fs.statSync(filePath);
    const total = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

        if (start >= total || end >= total) {
            res.status(416).set({ 'Content-Range': `bytes */${total}` }).end();
            return true;
        }

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'audio/mpeg'
        });

        fs.createReadStream(filePath, { start, end }).pipe(res);
        return true;
    }

    res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
}

function getLocalFallbackAudioPath(seed) {
    const text = String(seed || 'fallback');
    const code = [...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const index = (code % 18) + 1;
    return path.join(__dirname, '..', '..', 'Audio', `${index}.mp3`);
}

function pickBestPipedAudioStream(audioStreams) {
    if (!Array.isArray(audioStreams)) return null;

    const candidates = audioStreams.filter((stream) => {
        if (!stream || !stream.url) return false;
        if (stream.videoOnly) return false;
        return true;
    });

    if (!candidates.length) return null;

    candidates.sort((a, b) => {
        const aBitrate = Number(a.bitrate) || 0;
        const bBitrate = Number(b.bitrate) || 0;
        return bBitrate - aBitrate;
    });

    return candidates[0];
}

async function proxyRemoteAudio(remoteUrl, req, res) {
    const headers = {
        'User-Agent': STREAM_USER_AGENT
    };

    if (req.headers.range) {
        headers.Range = req.headers.range;
    }

    const upstream = await fetch(remoteUrl, {
        method: 'GET',
        headers,
        redirect: 'follow'
    });

    if (!upstream.ok || !upstream.body) {
        throw new Error(`Upstream audio request failed with status ${upstream.status}`);
    }

    res.status(upstream.status);

    const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
    res.setHeader('Content-Type', contentType);

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);

    const acceptRanges = upstream.headers.get('accept-ranges') || 'bytes';
    res.setHeader('Accept-Ranges', acceptRanges);

    Readable.fromWeb(upstream.body).pipe(res);
}

async function streamFromPiped(youtubeId, req, res) {
    for (const baseUrl of PIPED_API_INSTANCES) {
        try {
            const metadataUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/streams/${youtubeId}`;
            const metadataResponse = await fetch(metadataUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': STREAM_USER_AGENT
                }
            });

            if (!metadataResponse.ok) {
                continue;
            }

            const metadata = await metadataResponse.json();
            const bestStream = pickBestPipedAudioStream(metadata.audioStreams);

            if (!bestStream || !bestStream.url) {
                continue;
            }

            console.log(`Streaming via Piped instance: ${baseUrl}`);
            await proxyRemoteAudio(bestStream.url, req, res);
            return true;
        } catch (error) {
            console.warn(`Piped stream failed (${baseUrl}):`, error && error.message ? error.message : error);
        }
    }

    return false;
}

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

function mapItunesTrackToSong(track) {
    if (!track || !track.previewUrl || !track.trackId) return null;

    const artwork = (track.artworkUrl100 || track.artworkUrl60 || '')
        .replace('100x100bb.jpg', '600x600bb.jpg')
        .replace('60x60bb.jpg', '600x600bb.jpg');

    return {
        youtubeId: `itunes-${track.trackId}`,
        title: track.trackName || 'Unknown Title',
        artist: track.artistName || 'Unknown Artist',
        album: track.collectionName || 'Unknown Album',
        genre: track.primaryGenreName || 'Unknown',
        duration: Math.max(1, Math.round((Number(track.trackTimeMillis) || 30000) / 1000)),
        image: artwork || 'https://via.placeholder.com/300?text=Song',
        audioPath: track.previewUrl,
        streamUrl: track.previewUrl,
        url: track.trackViewUrl || '',
        source: 'itunes'
    };
}

async function searchItunes(query, limit = 18) {
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
    const response = await fetch(searchUrl, {
        headers: {
            'User-Agent': STREAM_USER_AGENT
        }
    });

    if (!response.ok) {
        throw new Error(`iTunes search failed with status ${response.status}`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload && payload.results) ? payload.results : [];
    const songs = [];

    for (const track of results) {
        const songData = mapItunesTrackToSong(track);
        if (!songData) continue;

        const song = await Song.findOneAndUpdate(
            { youtubeId: songData.youtubeId },
            { $set: songData },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        songs.push(song);
    }

    return songs;
}

async function searchYouTube(query, limit = 18) {
    // Prefer iTunes preview streams for stable in-site playback.
    try {
        const itunesSongs = await searchItunes(query, limit);
        if (itunesSongs.length > 0) {
            return itunesSongs;
        }
    } catch (itunesError) {
        console.warn('iTunes search failed, falling back to YouTube:', itunesError.message);
    }

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

        res.setHeader('Cache-Control', 'no-store');

        // If the song is in our DB and has a local audioPath, serve the file with Range support
        const song = await Song.findOne({ $or: [{ _id: youtubeId }, { youtubeId: youtubeId }] }).catch(() => null);
        if (song && song.audioPath && !/^(https?:)?\/\//i.test(song.audioPath)) {
            const fileRel = song.audioPath.replace(/^\//, '');
            const filePath = path.join(__dirname, '..', '..', fileRel);

            if (serveAudioFileWithRange(filePath, req, res)) {
                return;
            }
        }

        const pipedStreamed = await streamFromPiped(youtubeId, req, res);
        if (pipedStreamed) {
            return;
        }

        // Stream YouTube audio directly through the server using ytdl.
        const ytdlStream = ytdl(videoUrl, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
            requestOptions: {
                headers: {
                    'User-Agent': STREAM_USER_AGENT
                }
            }
        });

        ytdlStream.on('response', (streamRes) => {
            const contentType = streamRes.headers['content-type'];
            if (contentType) {
                res.setHeader('Content-Type', contentType);
            } else {
                res.setHeader('Content-Type', 'audio/mpeg');
            }
            res.setHeader('Accept-Ranges', 'bytes');
        });

        ytdlStream.on('error', (streamErr) => {
            console.error('YouTube stream error:', streamErr && streamErr.message ? streamErr.message : streamErr);
            if (!res.headersSent) {
                const fallbackAudioPath = getLocalFallbackAudioPath(youtubeId);
                if (!serveAudioFileWithRange(fallbackAudioPath, req, res)) {
                    res.status(500).json({ success: false, message: 'Unable to stream video' });
                }
            } else {
                res.destroy(streamErr);
            }
        });

        ytdlStream.pipe(res);
    } catch (error) {
        console.error('Stream error:', error && error.message ? error.message : error);
        res.status(500).json({ success: false, message: 'Unable to stream video' });
    }
};
