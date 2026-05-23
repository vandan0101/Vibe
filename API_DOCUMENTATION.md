# API Documentation 📚

## Base URL
```
http://localhost:5000/api
```

## Authentication Header
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth Endpoints

### 1. Sign Up
**POST** `/auth/signup`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://via.placeholder.com/100?text=User"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://via.placeholder.com/100?text=User",
    "bio": "Music lover",
    "theme": "dark"
  }
}
```

---

### 3. Logout
**POST** `/auth/logout`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### 1. Get User Profile
**GET** `/users/profile`  
**Auth**: Required ✅

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Music lover",
    "theme": "dark",
    "listeningStats": {
      "totalListeningTime": 3600,
      "topGenres": ["Rock", "Jazz"],
      "topArtists": ["Artist1", "Artist2"],
      "songsPlayed": 45
    },
    "favorites": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
    "playlists": ["607f1f77bcf86cd799439011", "607f1f77bcf86cd799439012"],
    "followers": [],
    "following": []
  }
}
```

---

### 2. Update User Profile
**PUT** `/users/profile`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "bio": "New bio text",
  "avatar": "https://new-avatar-url.com/image.jpg",
  "theme": "light"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "user": { ...updated user object... }
}
```

---

### 3. Get Favorites
**GET** `/users/favorites`  
**Auth**: Required ✅

**Response (200):**
```json
{
  "success": true,
  "favorites": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "genre": "Rock",
      "duration": 240,
      "image": "https://example.com/song.jpg",
      "audioPath": "Audio/1.mp3",
      "plays": 10
    }
  ]
}
```

---

### 4. Add to Favorites
**POST** `/users/favorites`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "songId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Song added to favorites"
}
```

---

### 5. Remove from Favorites
**DELETE** `/users/favorites`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "songId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Song removed from favorites"
}
```

---

### 6. Update Listening Stats
**POST** `/users/listening-stats`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "songId": "507f1f77bcf86cd799439012",
  "genre": "Rock",
  "artist": "Artist Name",
  "duration": 240
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Listening stats updated"
}
```

---

## Playlist Endpoints

### 1. Create Playlist
**POST** `/playlists`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "name": "My Favorites",
  "description": "My favorite tracks",
  "isPublic": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Playlist created",
  "playlist": {
    "_id": "607f1f77bcf86cd799439011",
    "name": "My Favorites",
    "description": "My favorite tracks",
    "owner": "507f1f77bcf86cd799439011",
    "songs": [],
    "isPublic": false,
    "views": 0,
    "createdAt": "2024-05-23T10:30:00Z"
  }
}
```

---

### 2. Get User Playlists
**GET** `/playlists`  
**Auth**: Required ✅

**Response (200):**
```json
{
  "success": true,
  "playlists": [
    {
      "_id": "607f1f77bcf86cd799439011",
      "name": "Rock Classics",
      "description": "Greatest rock songs",
      "owner": "507f1f77bcf86cd799439011",
      "songs": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
      "image": "https://via.placeholder.com/150?text=Playlist",
      "isPublic": true,
      "views": 5
    }
  ]
}
```

---

### 3. Get Specific Playlist
**GET** `/playlists/:id`

**Response (200):**
```json
{
  "success": true,
  "playlist": {
    "_id": "607f1f77bcf86cd799439011",
    "name": "Rock Classics",
    "description": "Greatest rock songs",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe"
    },
    "songs": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Imagine",
        "artist": "John Lennon",
        "duration": 183,
        "image": "https://example.com/imagine.jpg"
      }
    ],
    "isPublic": true
  }
}
```

---

### 4. Add Song to Playlist
**POST** `/playlists/:playlistId/songs`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "songId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Song added to playlist"
}
```

---

### 5. Remove Song from Playlist
**DELETE** `/playlists/:playlistId/songs`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "songId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Song removed from playlist"
}
```

---

### 6. Update Playlist
**PUT** `/playlists/:playlistId`  
**Auth**: Required ✅

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": true,
  "image": "https://new-image-url.com/image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Playlist updated",
  "playlist": { ...updated playlist... }
}
```

---

### 7. Delete Playlist
**DELETE** `/playlists/:playlistId`  
**Auth**: Required ✅

**Response (200):**
```json
{
  "success": true,
  "message": "Playlist deleted"
}
```

---

## Song Endpoints

### 1. Get All Songs
**GET** `/songs`

**Query Parameters:**
- `limit` (optional): Number of songs to return
- `skip` (optional): Number of songs to skip

**Response (200):**
```json
{
  "success": true,
  "songs": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Imagine",
      "artist": "John Lennon",
      "album": "Imagine",
      "genre": "Rock",
      "duration": 183,
      "image": "https://example.com/imagine.jpg",
      "audioPath": "Audio/1.mp3",
      "plays": 150,
      "likes": []
    }
  ]
}
```

---

### 2. Get Specific Song
**GET** `/songs/:id`

**Response (200):**
```json
{
  "success": true,
  "song": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Imagine",
    "artist": "John Lennon",
    "album": "Imagine",
    "genre": "Rock",
    "duration": 183,
    "image": "https://example.com/imagine.jpg",
    "audioPath": "Audio/1.mp3",
    "plays": 150,
    "likes": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439010"]
  }
}
```

---

### 3. Search Songs
**GET** `/songs/search?query=imagine`

**Query Parameters:**
- `query` (required): Search term

**Response (200):**
```json
{
  "success": true,
  "songs": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Imagine",
      "artist": "John Lennon",
      "album": "Imagine",
      "genre": "Rock",
      "duration": 183,
      "image": "https://example.com/imagine.jpg"
    }
  ]
}
```

---

### 4. Create Song (Admin Only)
**POST** `/songs`

**Request Body:**
```json
{
  "title": "New Song",
  "artist": "Artist Name",
  "album": "Album Name",
  "genre": "Rock",
  "duration": 240,
  "image": "https://example.com/image.jpg",
  "audioPath": "Audio/new-song.mp3"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Song created",
  "song": { ...song object... }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## Testing with cURL

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Example: Get Profile
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Create Playlist
```bash
curl -X POST http://localhost:5000/api/playlists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Playlist",
    "description": "A great playlist",
    "isPublic": false
  }'
```

---

## Rate Limiting
Currently not implemented. Can be added with `express-rate-limit` package.

## Pagination
Not implemented in current version. Can be added using `skip` and `limit` query parameters.

## Caching
Not implemented. Consider adding Redis for better performance.

---

## Status Codes Used
- **200**: Success (GET, PUT, DELETE)
- **201**: Created (POST)
- **400**: Bad Request
- **401**: Unauthorized (Missing/Invalid token)
- **403**: Forbidden (Not authorized for resource)
- **404**: Not Found
- **500**: Server Error

---

Happy API testing! 🚀
