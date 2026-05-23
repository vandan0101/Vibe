# Quick Start Guide 🚀

## Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

## Step 2: Setup MongoDB
**Option A - Local MongoDB:**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service

**Option B - MongoDB Atlas (Cloud):**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create cluster and get connection string
- Update `backend/.env` with your connection string

## Step 3: Update .env File
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spotify-app
JWT_SECRET=your_secret_key_change_me
JWT_EXPIRE=7d
NODE_ENV=development
```

## Step 4: Start Backend Server
```bash
cd backend
npm start
```
✅ Server running at http://localhost:5000

## Step 5: Open Frontend
- Open `index.html` in your browser
- Or run a local server:
```bash
# In another terminal from project root
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Step 6: Create Account & Start Using!
1. Sign up with email and password
2. Browse and play music
3. Create playlists
4. Add favorites
5. Edit profile
6. Toggle dark/light theme

---

## Useful Commands

### Backend
```bash
cd backend

# Start server
npm start

# Start with auto-reload (dev mode)
npm run dev

# Install new package
npm install package-name
```

### Test the API
```bash
# In another terminal, test if API is running
curl http://localhost:5000
# Should return: "Welcome to Spotify App API"
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Cannot connect to API` | Make sure backend is running on port 5000 |
| `MongoDB connection error` | Check MongoDB is running or update connection string |
| `Module not found` | Run `npm install` in backend folder |
| `CORS error` | Backend might not be running |
| `Port already in use` | Change PORT in `.env` or kill process using port 5000 |

---

## Features to Try

- ✅ Sign up and create account
- ✅ Play music from library
- ✅ Create new playlist
- ✅ Add songs to favorites
- ✅ View profile and stats
- ✅ Edit bio and avatar
- ✅ Toggle dark/light theme
- ✅ Search for songs

---

## File Locations

| What | Where |
|------|-------|
| Frontend | `/index.html`, `/script.js`, `/style.css` |
| Backend | `/backend/server.js` |
| Database Models | `/backend/models/` |
| API Routes | `/backend/routes/` |
| Music Files | `/Audio/` |
| Images | `/Images/` |

---

## Architecture Overview

```
Browser (Frontend)
    ↓↑
HTML/CSS/JS (index.html, script.js, style.css)
    ↓↑
HTTP Requests (Fetch API)
    ↓↑
Node.js/Express Server (PORT 5000)
    ↓↑
MongoDB Database
    ↓↑
Mongoose Models (User, Song, Playlist)
```

---

Happy coding! 🎵

Questions? Check README.md for detailed information.
