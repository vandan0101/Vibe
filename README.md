# Vibe - Music Streaming App 🎵

A full-featured music streaming application with user authentication, playlists, favorites, and dark/light theme support.

## Features Implemented ✨

### Authentication & User Management
- ✅ User Registration (Signup)
- ✅ User Login with JWT tokens
- ✅ Password encryption with bcryptjs
- ✅ User profiles with avatar and bio
- ✅ Listening statistics tracking

### Music Player
- ✅ Play/Pause functionality
- ✅ Next/Previous track navigation
- ✅ Progress bar with seeking
- ✅ Now playing display
- ✅ Music card interactions

### Playlist Management
- ✅ Create custom playlists
- ✅ Add/remove songs from playlists
- ✅ Edit playlist details
- ✅ Delete playlists

### Favorites System
- ✅ Add/remove favorite songs
- ✅ View all favorites
- ✅ Heart button indicator
- ✅ Persistent storage

### User Dashboard
- ✅ User profile page with stats
- ✅ Listening history
- ✅ Top genres
- ✅ Created playlists display
- ✅ Edit profile modal

### Theme Support
- ✅ Dark theme (default)
- ✅ Light theme toggle
- ✅ Theme persistence in localStorage
- ✅ Smooth transitions

### Responsive Design
- ✅ Mobile friendly
- ✅ Tablet optimized
- ✅ Desktop view
- ✅ Flexible layouts

---

## Project Structure

```
Spotify app/
├── index.html              # Main HTML with auth and app pages
├── script.js               # Frontend JavaScript with API calls
├── style.css               # Stylesheet with themes
├── Audio/                  # Music files
├── Images/                 # Album artwork
└── backend/                # Node.js/Express API
    ├── server.js           # Main server file
    ├── package.json        # Dependencies
    ├── .env                # Environment variables
    ├── config/
    │   └── db.js           # MongoDB connection
    ├── models/
    │   ├── User.js         # User schema
    │   ├── Song.js         # Song schema
    │   └── Playlist.js     # Playlist schema
    ├── routes/
    │   ├── auth.js         # Authentication routes
    │   ├── users.js        # User routes
    │   ├── playlists.js    # Playlist routes
    │   └── songs.js        # Song routes
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── playlistController.js
    │   └── songController.js
    └── middleware/
        └── auth.js         # JWT verification
```

---

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd "Spotify app/backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure MongoDB:**
   - Option A: Local MongoDB (ensure MongoDB is running)
   - Option B: MongoDB Atlas
     - Create account at https://www.mongodb.com/cloud/atlas
     - Copy connection string
     - Update `.env` file with your connection string

4. **Update .env file:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/spotify-app
   (or your MongoDB Atlas connection string)
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development with hot reload:
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Open in browser:**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/favorites` - Get favorite songs
- `POST /api/users/favorites` - Add to favorites
- `DELETE /api/users/favorites` - Remove from favorites
- `POST /api/users/listening-stats` - Update listening statistics

### Playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists` - Get user's playlists
- `GET /api/playlists/:id` - Get specific playlist
- `PUT /api/playlists/:playlistId` - Update playlist
- `DELETE /api/playlists/:playlistId` - Delete playlist
- `POST /api/playlists/:playlistId/songs` - Add song to playlist
- `DELETE /api/playlists/:playlistId/songs` - Remove song from playlist

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get specific song
- `GET /api/songs/search?query=` - Search songs
- `POST /api/songs` - Create new song

---

## How to Use

### 1. **Sign Up**
   - Click "Sign up" on login page
   - Enter username, email, password
   - Account is created and you're logged in

### 2. **Log In**
   - Enter email and password
   - You'll be redirected to the home page

### 3. **Browse Music**
   - View "Popular songs", "Recommended", and "Recently played"
   - Click play button on any card to start playing

### 4. **Create Playlist**
   - Click "+" in "Your Library" section
   - Enter playlist name and description
   - Click "Create"

### 5. **Add to Favorites**
   - Click heart icon in player controls
   - View all favorites in "Your Favorite Songs" section

### 6. **Edit Profile**
   - Click profile button in top right
   - View your stats and playlists
   - Click "Edit Profile" to update bio and avatar

### 7. **Toggle Theme**
   - Click the toggle switch in navbar
   - Switch between dark and light themes

---

## Troubleshooting

### "Cannot connect to API"
- Ensure backend server is running on port 5000
- Check if MongoDB is running
- Verify `.env` file has correct settings

### "Module not found" error
- Run `npm install` in backend folder
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Music not playing
- Ensure audio files exist in `Audio/` folder
- Check browser console for errors (F12)
- Try different audio file format

### Login not working
- Check MongoDB connection
- Verify user credentials
- Check browser's localStorage isn't full

---

## Future Enhancements

- [ ] Queue management system
- [ ] Audio visualizer
- [ ] Equalizer effects
- [ ] Social features (follow users)
- [ ] Playlist sharing
- [ ] Advanced search filters
- [ ] Recommendations algorithm
- [ ] Podcast support
- [ ] Lyrics display
- [ ] Export playlists

---

## Technologies Used

### Frontend
- HTML5
- CSS3 (with media queries for responsiveness)
- JavaScript (ES6+)
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)
- CORS
- dotenv

---

## License

This project is open source and available for educational purposes.

---

## Support

For issues or questions, please check:
1. Console errors (F12 in browser)
2. Backend logs
3. MongoDB connection status
4. Network tab in browser DevTools

Enjoy your music! 🎶
