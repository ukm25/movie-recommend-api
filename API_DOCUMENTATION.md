# Movie Recommendation API Documentation

## Base URL
```
http://localhost:5000/api
```

## Health Check

### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Movie Recommendation API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Movies Endpoints

### GET /api/movies
Get all movies with their genres.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Shawshank Redemption",
      "year": 1994,
      "rating": "9.3",
      "description": "Two imprisoned men bond...",
      "image_url": "https://...",
      "genres": ["Drama"]
    }
  ],
  "count": 70
}
```

### GET /api/movies/:id
Get a specific movie by ID.

**Parameters:**
- `id` (path): Movie ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "The Shawshank Redemption",
    "year": 1994,
    "rating": "9.3",
    "description": "Two imprisoned men bond...",
    "image_url": "https://...",
    "genres": ["Drama"]
  }
}
```

### GET /api/movies/hot/list
Get hot movies (high rating and recent year).

**Query Parameters:**
- `limit` (optional): Number of movies to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### GET /api/movies/search/:term
Search movies by title or genre.

**Parameters:**
- `term` (path): Search term

**Example:**
```
GET /api/movies/search/action
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 15
}
```

### GET /api/movies/genre/:name
Get movies by genre name.

**Parameters:**
- `name` (path): Genre name (e.g., "Action", "Drama")

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 20
}
```

### GET /api/genres
Get all available genres.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Action" },
    { "id": 2, "name": "Adventure" }
  ],
  "count": 20
}
```

---

## User Endpoints

### GET /api/users
Get all users (without passwords).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 3
}
```

### GET /api/users/:id
Get a specific user by ID.

**Parameters:**
- `id` (path): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "viewer1",
    "role": "viewer",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "username": "viewer1",
  "password": "viewer123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "viewer1",
    "role": "viewer",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "username": "newuser",
    "role": "viewer",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Watch History Endpoints

### GET /api/watch-history/user/:userId
Get watch history for a specific user.

**Parameters:**
- `userId` (path): User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "movie_id": 1,
      "watched_at": "2024-01-10T15:30:00.000Z",
      "title": "The Shawshank Redemption",
      "year": 1994,
      "rating": "9.3",
      "description": "...",
      "image_url": "https://...",
      "genres": ["Drama"]
    }
  ],
  "count": 5
}
```

### GET /api/watch-history/all
Get watch history summary for all users (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "username": "viewer1",
      "movies_watched": 5,
      "favorite_genres": ["Action", "Sci-Fi", "Drama"],
      "last_watched": "2024-01-14T10:00:00.000Z"
    }
  ],
  "count": 2
}
```

### POST /api/watch-history
Add a movie to watch history.

**Request Body:**
```json
{
  "userId": 2,
  "movieId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 2,
    "movie_id": 1,
    "watched_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### DELETE /api/watch-history/:userId/:movieId
Remove a movie from watch history.

**Parameters:**
- `userId` (path): User ID
- `movieId` (path): Movie ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 2,
    "movie_id": 1
  }
}
```

### GET /api/watch-history/user/:userId/preferences
Get user's genre preferences based on watch history.

**Parameters:**
- `userId` (path): User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "genre": "Action",
      "watch_count": 10,
      "avg_rating": "8.5"
    },
    {
      "genre": "Sci-Fi",
      "watch_count": 8,
      "avg_rating": "8.7"
    }
  ],
  "count": 5
}
```

### GET /api/watch-history/trends
Get genre trends across all users (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "genre": "Action",
      "users_count": 15,
      "total_watches": 45,
      "avg_rating": "8.2"
    }
  ],
  "count": 10
}
```

### GET /api/watch-history/check/:userId/:movieId
Check if a user has watched a specific movie.

**Parameters:**
- `userId` (path): User ID
- `movieId` (path): Movie ID

**Response:**
```json
{
  "success": true,
  "data": {
    "hasWatched": true
  }
}
```

---

## Recommendation Endpoints

### GET /api/recommendations/user/:userId
Get personalized movie recommendations for a user.

**Parameters:**
- `userId` (path): User ID

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "title": "Interstellar",
      "year": 2014,
      "rating": "8.6",
      "description": "...",
      "image_url": "https://...",
      "genres": ["Adventure", "Drama", "Sci-Fi"],
      "matching_genres": 2,
      "score": "8.6"
    }
  ],
  "count": 10
}
```

### GET /api/recommendations/similar/:movieId
Get movies similar to a specific movie.

**Parameters:**
- `movieId` (path): Movie ID

**Query Parameters:**
- `limit` (optional): Number of similar movies (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### GET /api/recommendations/trending
Get trending movies (most watched recently).

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7)
- `limit` (optional): Number of movies (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Shawshank Redemption",
      "year": 1994,
      "rating": "9.3",
      "description": "...",
      "image_url": "https://...",
      "genres": ["Drama"],
      "watch_count": 25
    }
  ],
  "count": 10
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Testing with cURL

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Movies
```bash
curl http://localhost:5000/api/movies
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer1","password":"viewer123"}'
```

### Get Recommendations
```bash
curl http://localhost:5000/api/recommendations/user/2
```

### Add to Watch History
```bash
curl -X POST http://localhost:5000/api/watch-history \
  -H "Content-Type: application/json" \
  -d '{"userId":2,"movieId":1}'
```

---

## Database Schema

### Tables

1. **users**: User accounts (admin, viewer)
2. **genres**: Movie genres
3. **movies**: Movie information
4. **movie_genres**: Many-to-many relationship between movies and genres
5. **watch_history**: User's watched movies

### Key Relationships

- A movie can have multiple genres (many-to-many)
- A user can watch multiple movies (one-to-many)
- Recommendations are based on user's genre preferences from watch history

