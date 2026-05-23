// API Configuration
const API_URL = 'http://localhost:5001/api';
const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="60" fill="#2a2a2a"/>
  <circle cx="60" cy="45" r="22" fill="#f4f4f4"/>
  <path d="M24 102c6-22 24-32 36-32s30 10 36 32" fill="#f4f4f4"/>
</svg>
`)}`;

const fallbackSongs = [
    { _id: '1', title: 'Guitar Song 1', artist: 'Artist 1', image: 'Images/1.jpg', audioPath: 'Audio/1.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '2', title: 'Guitar Song 2', artist: 'Artist 2', image: 'Images/2.jpg', audioPath: 'Audio/2.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '3', title: 'Guitar Song 3', artist: 'Artist 3', image: 'Images/3.jpg', audioPath: 'Audio/3.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '4', title: 'Guitar Song 4', artist: 'Artist 4', image: 'Images/4.jpg', audioPath: 'Audio/4.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '5', title: 'Guitar Song 5', artist: 'Artist 5', image: 'Images/5.jpg', audioPath: 'Audio/5.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '6', title: 'Guitar Song 6', artist: 'Artist 6', image: 'Images/6.jpg', audioPath: 'Audio/6.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '7', title: 'Guitar Song 7', artist: 'Artist 7', image: 'Images/7.jpg', audioPath: 'Audio/7.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '8', title: 'Guitar Song 8', artist: 'Artist 8', image: 'Images/8.jpg', audioPath: 'Audio/8.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '9', title: 'Guitar Song 9', artist: 'Artist 9', image: 'Images/9.jpg', audioPath: 'Audio/9.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '10', title: 'Guitar Song 10', artist: 'Artist 10', image: 'Images/10.jpg', audioPath: 'Audio/10.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '11', title: 'Guitar Song 11', artist: 'Artist 11', image: 'Images/11.jpg', audioPath: 'Audio/11.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '12', title: 'Guitar Song 12', artist: 'Artist 12', image: 'Images/12.jpg', audioPath: 'Audio/12.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '13', title: 'Guitar Song 13', artist: 'Artist 13', image: 'Images/13.jpg', audioPath: 'Audio/13.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '14', title: 'Guitar Song 14', artist: 'Artist 14', image: 'Images/14.jpg', audioPath: 'Audio/14.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '15', title: 'Guitar Song 15', artist: 'Artist 15', image: 'Images/15.jpg', audioPath: 'Audio/15.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '16', title: 'Guitar Song 16', artist: 'Artist 16', image: 'Images/16.jpg', audioPath: 'Audio/16.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '17', title: 'Guitar Song 17', artist: 'Artist 17', image: 'Images/17.jpg', audioPath: 'Audio/17.mp3', duration: 180, genre: 'Instrumental' },
    { _id: '18', title: 'Guitar Song 18', artist: 'Artist 18', image: 'Images/18.jpg', audioPath: 'Audio/18.mp3', duration: 180, genre: 'Instrumental' }
];

// Global Variables
let currentUser = null;
let currentSongIndex = 0;
let currentPlaylistId = null;
let songs = [];
let favorites = [];
let playlists = [];
let audio = new Audio();
let progressBar = null;
let play = null;
let isShuffleEnabled = false;
let repeatMode = 'off';
let lastVolume = Number(localStorage.getItem('playerVolume') || 1);

audio.volume = Math.max(0, Math.min(1, lastVolume));

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setTimeout(() => {
        progressBar = document.getElementById('progressBar');
        play = document.getElementById('play');
        initializeEventListeners();
        checkAuthStatus();
    }, 100);
});

// ===== AUTHENTICATION FUNCTIONS =====

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        showAppPage();
        loadUserProfile();
    } else {
        showAuthPage();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showAppPage();
            loadUserProfile();
        } else {
            document.getElementById('login-error').innerText = data.message;
        }
    } catch (error) {
        document.getElementById('login-error').innerText = 'Login failed. Make sure backend is running on port 5001.';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        document.getElementById('signup-error').innerText = 'Passwords do not match';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showAppPage();
            loadUserProfile();
        } else {
            document.getElementById('signup-error').innerText = data.message;
        }
    } catch (error) {
        document.getElementById('signup-error').innerText = 'Signup failed. Make sure backend is running on port 5001.';
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    showAuthPage();
}

// ===== PAGE NAVIGATION =====

function showAuthPage() {
    const authPage = document.getElementById('auth-page');
    const appPage = document.getElementById('app-page');
    if (authPage) authPage.classList.remove('hidden');
    if (appPage) appPage.classList.add('hidden');
}

function showAppPage() {
    const authPage = document.getElementById('auth-page');
    const appPage = document.getElementById('app-page');
    if (authPage) authPage.classList.add('hidden');
    if (appPage) appPage.classList.remove('hidden');
    loadSongs();
    loadPlaylists();
    loadFavorites();
}

function showPage(pageName) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
    
    if (pageName === 'home') {
        const homePage = document.getElementById('home-page');
        if (homePage) homePage.classList.remove('hidden');
    } else if (pageName === 'profile') {
        const profilePage = document.getElementById('profile-page');
        if (profilePage) profilePage.classList.remove('hidden');
        loadProfilePage();
    } else if (pageName === 'favorites') {
        const favPage = document.getElementById('favorites-page');
        if (favPage) favPage.classList.remove('hidden');
        loadFavoritesPage();
    } else if (pageName === 'playlist-view') {
        const playlistViewPage = document.getElementById('playlist-view-page');
        if (playlistViewPage) playlistViewPage.classList.remove('hidden');
    }
}

function switchAuthPage() {
    document.getElementById('login-page').classList.toggle('hidden');
    document.getElementById('signup-page').classList.toggle('hidden');
}

// ===== USER PROFILE FUNCTIONS =====

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            currentUser = null;
            updateNavbarProfile();
            showAuthPage();
            return;
        }

        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            updateNavbarProfile();
        }
    } catch (error) {
        updateNavbarProfile();
        console.log('Using guest mode (backend not connected)');
    }
}

function updateNavbarProfile() {
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
        setImageSource(navAvatar, currentUser?.avatar, DEFAULT_AVATAR);
    }
}

async function loadProfilePage() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            const user = data.user;
            document.getElementById('profile-username').innerText = user.username;
            document.getElementById('profile-email').innerText = user.email;
            document.getElementById('profile-bio').innerText = user.bio || 'Music lover';
            setImageSource(document.getElementById('profile-avatar'), user.avatar, DEFAULT_AVATAR);
            document.getElementById('stats-songs').innerText = user.listeningStats.songsPlayed;
            document.getElementById('stats-time').innerText = Math.round(user.listeningStats.totalListeningTime / 3600);
            document.getElementById('stats-playlists').innerText = user.playlists.length;

            const genresHtml = user.listeningStats.topGenres.map(g => `<span class="genre-tag">${g}</span>`).join('');
            document.getElementById('top-genres').innerHTML = genresHtml || '<p>No genres yet</p>';
        }
    } catch (error) {
        console.log('Could not load profile from server');
    }
}

function showEditProfileModal() {
    document.getElementById('edit-profile-modal').classList.remove('hidden');
    if (currentUser) {
        document.getElementById('edit-bio').value = currentUser.bio || '';
        document.getElementById('edit-avatar').value = currentUser.avatar || '';
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    const bio = document.getElementById('edit-bio').value;
    const avatar = document.getElementById('edit-avatar').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bio, avatar })
        });

        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            updateNavbarProfile();
            loadProfilePage();
            closeModal('edit-profile-modal');
        }
    } catch (error) {
        console.log('Could not update profile');
    }
}

// ===== SONGS AND PLAYLISTS FUNCTIONS =====

async function loadSongs() {
    try {
        const response = await fetch(`${API_URL}/songs`);
        const data = await response.json();

        if (data.success && Array.isArray(data.songs) && data.songs.length > 0) {
            songs = data.songs.map(normalizeSong).filter(Boolean);
            if (songs.length > 0) {
                renderSongSections();
                return;
            }
        }

        loadMockSongs();
    } catch (error) {
        loadMockSongs();
    }
}

function loadMockSongs() {
    songs = fallbackSongs.map(normalizeSong);
    renderSongSections();
}

function normalizeSong(song, index = 0) {
    if (!song) return null;

    return {
        _id: song._id || song.id || `fallback-${index}`,
        title: song.title || 'Unknown Title',
        artist: song.artist || 'Unknown Artist',
        album: song.album || 'Unknown Album',
        genre: song.genre || 'Unknown',
        duration: Number(song.duration) || 180,
        image: song.image || `Images/${(index % 18) + 1}.jpg`,
        audioPath: song.audioPath || `Audio/${(index % 18) + 1}.mp3`
    };
}

function renderSongSections() {
    displaySongs(songs.slice(0, 6), 'popular-songs');
    displaySongs(songs.slice(6, 12), 'recommended-songs');
    displaySongs(songs.slice(12, 18), 'recently-played');
}

function displaySongs(songsToDisplay, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!songsToDisplay.length) {
        container.innerHTML = '<p class="empty-state">No songs available right now.</p>';
        return;
    }

    const html = songsToDisplay.map(song => `
        <div class="music-card">
            <img src="${song.image}" alt="${song.title}">
            <div class="music-play-btn" onclick="playSong('${song._id}')">
                <i class="playMusic fa-solid fa-circle-play"></i>
            </div>
            <div class="img-title">${song.title}</div>
            <div class="img-description">${song.artist}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function setImageSource(imgElement, preferredSrc, fallbackSrc = DEFAULT_AVATAR) {
    if (!imgElement) return;

    imgElement.onerror = () => {
        imgElement.onerror = null;
        imgElement.src = fallbackSrc;
    };
    imgElement.src = preferredSrc || fallbackSrc;
}

// ===== FAVORITES FUNCTIONS =====

function getLocalFavorites() {
    try {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch (error) {
        return [];
    }
}

function saveLocalFavorites(items) {
    localStorage.setItem('favorites', JSON.stringify(items));
}

async function loadFavorites() {
    const token = localStorage.getItem('token');

    if (!token) {
        favorites = getLocalFavorites();
        updateFavoriteButton();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            favorites = data.favorites.map(normalizeSong).filter(Boolean);
            saveLocalFavorites(favorites);
        }
    } catch (error) {
        favorites = getLocalFavorites();
        console.log('Could not load favorites');
    }

    updateFavoriteButton();
}

async function loadFavoritesPage() {
    displaySongs(favorites.map(normalizeSong).filter(Boolean), 'favorites-list');
}

async function toggleFavorite() {
    const currentSong = songs[currentSongIndex];
    if (!currentSong) return;

    const isFavorited = favorites.some(f => f._id === currentSong._id);
    const token = localStorage.getItem('token');

    if (!token || !currentUser) {
        favorites = isFavorited
            ? favorites.filter(f => f._id !== currentSong._id)
            : [...favorites, currentSong];

        saveLocalFavorites(favorites);
        updateFavoriteButton();
        return;
    }

    try {
        const method = isFavorited ? 'DELETE' : 'POST';
        const response = await fetch(`${API_URL}/users/favorites`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ songId: currentSong._id })
        });

        const data = await response.json();
        if (data.success) {
            await loadFavorites();
            updateFavoriteButton();
        }
    } catch (error) {
        favorites = isFavorited
            ? favorites.filter(f => f._id !== currentSong._id)
            : [...favorites, currentSong];

        saveLocalFavorites(favorites);
        updateFavoriteButton();
        console.log('Could not toggle favorite on server, using local favorites');
    }
}

function updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favorite-btn');
    const currentSong = songs[currentSongIndex];
    if (!favoriteBtn) return;

    if (!currentSong) {
        favoriteBtn.classList.remove('active');
        return;
    }

    if (favorites.some(f => f._id === currentSong._id)) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }
}

function showFavorites() {
    showPage('favorites');
}

// ===== PLAYLISTS FUNCTIONS =====

async function loadPlaylists() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(`${API_URL}/playlists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            playlists = data.playlists;
            displayPlaylists();
        }
    } catch (error) {
        console.log('Could not load playlists');
    }
}

function displayPlaylists() {
    const container = document.getElementById('playlists-list');
    if (!container) return;
    const html = playlists.map(p => `
        <div class="playlist-item" onclick="viewPlaylist('${p._id}')">
            <i class="fa-solid fa-music"></i> ${p.name}
        </div>
    `).join('');

    container.innerHTML = html;
}

function showPlaylistModal() {
    document.getElementById('playlist-modal').classList.remove('hidden');
    document.getElementById('playlist-modal-title').innerText = 'Create Playlist';
    document.getElementById('playlist-form').reset();
    currentPlaylistId = null;
}

async function handleCreatePlaylist(e) {
    e.preventDefault();
    const name = document.getElementById('playlist-name').value;
    const description = document.getElementById('playlist-description').value;
    const isPublic = document.getElementById('playlist-public').checked;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, isPublic })
        });

        const data = await response.json();
        if (data.success) {
            closeModal('playlist-modal');
            loadPlaylists();
        }
    } catch (error) {
        console.log('Could not create playlist');
    }
}

async function viewPlaylist(playlistId) {
    currentPlaylistId = playlistId;
    try {
        const response = await fetch(`${API_URL}/playlists/${playlistId}`);
        const data = await response.json();

        if (data.success) {
            const playlist = data.playlist;
            document.getElementById('playlist-title').innerText = playlist.name;
            document.getElementById('playlist-desc').innerText = playlist.description;
            displaySongs(playlist.songs, 'playlist-songs');
            showPage('playlist-view');
        }
    } catch (error) {
        console.log('Could not load playlist');
    }
}

function editCurrentPlaylist() {
    if (!currentPlaylistId) return;
}

async function deleteCurrentPlaylist() {
    if (!currentPlaylistId || !confirm('Delete this playlist?')) return;

    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/playlists/${currentPlaylistId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        loadPlaylists();
        showPage('home');
    } catch (error) {
        console.log('Could not delete playlist');
    }
}

// ===== MUSIC PLAYER FUNCTIONS =====

function togglePlay() {
    if (!audio.src) {
        if (!songs.length) return;
        playSong(songs[currentSongIndex]._id);
        return;
    }

    if (audio.paused) {
        audio.play();
        if (play) play.classList.add('fa-circle-pause');
        if (play) play.classList.remove('fa-circle-play');
    } else {
        audio.pause();
        if (play) play.classList.remove('fa-circle-pause');
        if (play) play.classList.add('fa-circle-play');
    }
}

function playSong(songId) {
    const songIndex = songs.findIndex(s => s._id === songId);
    if (songIndex !== -1) {
        currentSongIndex = songIndex;
        const song = songs[songIndex];
        audio.src = song.audioPath;
        audio.loop = repeatMode === 'one';
        audio.play();
        if (play) {
            play.classList.add('fa-circle-pause');
            play.classList.remove('fa-circle-play');
        }
        updatePlayerUI();
        updateFavoriteButton();
        updateListeningStats(song);
    }
}

function updatePlayerUI() {
    const song = songs[currentSongIndex];
    if (!song) return;
    if (document.getElementById('player-title')) {
        document.getElementById('player-title').innerText = song.title;
        document.getElementById('player-artist').innerText = song.artist;
        setImageSource(document.getElementById('player-img'), song.image, 'Images/1.jpg');
    }
}

function toggleMute() {
    const volumeBtn = document.getElementById('volume-btn');

    if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        audio.volume = lastVolume > 0 ? lastVolume : 1;
    } else {
        lastVolume = audio.volume;
        audio.muted = true;
    }

    localStorage.setItem('playerVolume', String(audio.volume));
    updateVolumeButton(volumeBtn);
}

function updateVolumeButton(volumeBtn = document.getElementById('volume-btn')) {
    if (!volumeBtn) return;

    volumeBtn.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-off', 'fa-volume-xmark', 'active');

    if (audio.muted || audio.volume === 0) {
        volumeBtn.classList.add('fa-volume-xmark');
        return;
    }

    if (audio.volume <= 0.5) {
        volumeBtn.classList.add('fa-volume-low', 'active');
        return;
    }

    volumeBtn.classList.add('fa-volume-high', 'active');
}

function playNextSong() {
    if (!songs.length) return;

    if (isShuffleEnabled && songs.length > 1) {
        let nextIndex = currentSongIndex;
        while (nextIndex === currentSongIndex) {
            nextIndex = Math.floor(Math.random() * songs.length);
        }
        currentSongIndex = nextIndex;
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
    }

    playSong(songs[currentSongIndex]._id);
}

function playPreviousSong() {
    if (!songs.length) return;

    if (isShuffleEnabled && songs.length > 1) {
        let previousIndex = currentSongIndex;
        while (previousIndex === currentSongIndex) {
            previousIndex = Math.floor(Math.random() * songs.length);
        }
        currentSongIndex = previousIndex;
    } else {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    }

    playSong(songs[currentSongIndex]._id);
}

function toggleShuffle() {
    isShuffleEnabled = !isShuffleEnabled;
    if (isShuffleEnabled) {
        repeatMode = 'off';
        audio.loop = false;
    }

    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffleEnabled);
    }
    if (repeatBtn) {
        repeatBtn.classList.remove('active');
    }

    if (isShuffleEnabled && songs.length > 1 && !audio.paused && audio.src) {
        playNextSong();
    }
}

function toggleRepeat() {
    repeatMode = repeatMode === 'one' ? 'off' : 'one';
    if (repeatMode === 'one') {
        isShuffleEnabled = false;
    }

    audio.loop = repeatMode === 'one';

    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    if (shuffleBtn) {
        shuffleBtn.classList.remove('active');
    }
    if (repeatBtn) {
        repeatBtn.classList.toggle('active', repeatMode === 'one');
    }

    if (repeatMode === 'one' && audio.src) {
        audio.currentTime = 0;
        if (audio.paused) {
            audio.play();
        }
    }
}

async function updateListeningStats(song) {
    if (!currentUser) return;

    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/users/listening-stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                songId: song._id,
                genre: song.genre,
                artist: song.artist,
                duration: song.duration
            })
        });
    } catch (error) {
        console.log('Could not update listening stats');
    }
}

function seek() {
    if (progressBar && audio.duration) {
        const seekTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    }
}

audio.addEventListener('timeupdate', () => {
    if (progressBar && audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        progressBar.style.background = `linear-gradient(to right, #21a600ff ${progressBar.value}%, #333 ${progressBar.value}%)`;
    }
});

audio.addEventListener('ended', () => {
    if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
        return;
    }

    playNextSong();
});

// ===== THEME TOGGLE =====

function toggleTheme() {
    const isDark = document.body.classList.toggle('light-theme');
    const theme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.checked = true;
    }
}

// ===== MODAL FUNCTIONS =====

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// ===== EVENT LISTENERS =====

function initializeEventListeners() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const playlistForm = document.getElementById('playlist-form');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (playlistForm) playlistForm.addEventListener('submit', handleCreatePlaylist);
    if (editProfileForm) editProfileForm.addEventListener('submit', handleEditProfile);

    const progressBarEl = document.getElementById('progressBar');
    const playEl = document.getElementById('play');
    const forwardEl = document.getElementById('forward');
    const backwardEl = document.getElementById('backward');
    const shuffleEl = document.getElementById('shuffle');
    const repeatEl = document.getElementById('repeat');
    const volumeEl = document.getElementById('volume-btn');

    if (progressBarEl) progressBarEl.addEventListener('input', seek);
    if (playEl) playEl.addEventListener('click', togglePlay);
    if (forwardEl) forwardEl.addEventListener('click', playNextSong);
    if (backwardEl) backwardEl.addEventListener('click', playPreviousSong);
    if (shuffleEl) shuffleEl.addEventListener('click', toggleShuffle);
    if (repeatEl) repeatEl.addEventListener('click', toggleRepeat);
    if (volumeEl) volumeEl.addEventListener('click', toggleMute);
    updateVolumeButton(volumeEl);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });
}
