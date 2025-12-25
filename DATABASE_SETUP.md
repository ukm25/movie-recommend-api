# Database Setup Guide

## ✅ Đã Hoàn Thành

Đã viết lại tất cả SQL queries để kết nối với **PostgreSQL database thực tế** trên Render.

### 📊 Database Schema Hiện Tại

```
┌──────────────────┬──────────────────────────────┐
│ Table            │ Description                   │
├──────────────────┼──────────────────────────────┤
│ genres           │ 20 rows - Movie genres        │
│ movies           │ 86,537 rows - Movie data      │
│ movie_genres     │ 152,288 rows - Movie-Genre    │
│ users            │ 19,470 rows - User accounts   │
│ ratings          │ 2,480,000 rows - User ratings │
│ watch_history    │ 0 rows - CẦN TẠO MỚI!        │
└──────────────────┴──────────────────────────────┘
```

## 🔧 Bước 1: Tạo Bảng `watch_history`

Bảng này cần thiết để track movies mà user đã xem.

### Cách 1: Sử dụng Render Dashboard (Khuyến nghị)

1. Vào [Render Dashboard](https://dashboard.render.com/)
2. Chọn PostgreSQL instance: `your-database-name`
3. Click tab **"Shell"**
4. Copy và paste nội dung file `backend/database/setup_watch_history.sql`
5. Chạy script

### Cách 2: Sử dụng psql command line

```bash
psql $DATABASE_URL -f backend/database/setup_watch_history.sql

# Or with explicit connection string:
# psql postgresql://user:password@host:port/database -f backend/database/setup_watch_history.sql
```

### Script sẽ làm gì?

1. ✅ Tạo bảng `watch_history` (id, user_id, movie_id, watched_at)
2. ✅ Tạo indexes để query nhanh hơn
3. ✅ Thêm column `role` vào table `users` (nếu chưa có)
4. ✅ Set user đầu tiên làm `admin`
5. ✅ Seed 100 watch history records từ ratings table

## 📋 Bảng `watch_history` Schema

```sql
CREATE TABLE watch_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    watched_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, movie_id)
);
```

## 🗄️ Mapping Database → Code

### Table: `genres`
```
DB Column  → Code Field
─────────────────────────
id         → id
genre      → name
```

### Table: `movies`
```
DB Column     → Code Field
──────────────────────────
movieId       → id
movie_title   → title
release_year  → year
AVG(rating)   → rating (calculated from ratings table)
```

### Table: `users`
```
DB Column  → Code Field
─────────────────────────
id         → id
username   → username
password   → password
role       → role (admin/viewer)
```

### Table: `watch_history`
```
DB Column   → Code Field
─────────────────────────
id          → id
user_id     → user_id
movie_id    → movie_id
watched_at  → watched_at
```

## 🔄 Updated Query Files

Đã update tất cả files trong `backend/database/`:

### ✅ `movieQueries.js`
- `getAllMovies()` - Query 500 movies với avg rating
- `getMovieById(id)` - Query movie by movieId
- `getHotMovies(limit)` - Movies từ 2010+, rating ≥ 4.0, có ≥ 50 ratings
- `searchMovies(term)` - Search by title hoặc genre
- `getMoviesByGenre(name)` - Filter by genre
- `getAllGenres()` - Lấy 20 genres

### ✅ `userQueries.js`
- `getAllUsers()` - Query users với role
- `getUserById(id)` - Get user by id
- `getUserByUsername(username)` - For login
- `createUser()` - Tạo user mới
- `updateUserRole()` - Cập nhật role
- `deleteUser()` - Xóa user

### ✅ `watchHistoryQueries.js`
- `getUserWatchHistory(userId)` - Lịch sử xem của user
- `getAllUsersWatchHistory()` - Summary tất cả users (admin)
- `addToWatchHistory(userId, movieId)` - Mark movie as watched
- `removeFromWatchHistory()` - Xóa khỏi lịch sử
- `getUserGenrePreferences(userId)` - Sở thích thể loại
- `getGenreTrends()` - Xu hướng thể loại (admin)
- `hasWatchedMovie(userId, movieId)` - Check đã xem chưa

### ✅ `recommendationQueries.js`
- `getRecommendations(userId, limit)` - Đề xuất dựa trên watch history
- `getSimilarMovies(movieId, limit)` - Phim tương tự
- `getTrendingMovies(days, limit)` - Phim trending

## 🚀 Test Backend API

### 1. Chạy server
```bash
npm run server
```

### 2. Test endpoints

#### Health check
```bash
curl http://localhost:5000/api/health
```

#### Get all movies
```bash
curl http://localhost:5000/api/movies
```

#### Get hot movies
```bash
curl http://localhost:5000/api/movies/hot/list
```

#### Login (sau khi setup watch_history)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"username_here","password":"password_here"}'
```

#### Get recommendations
```bash
curl http://localhost:5000/api/recommendations/user/1
```

## 📝 Notes

### ⚠️ Important Changes

1. **Database fields khác với dummy data:**
   - `genres.name` → `genres.genre` trong DB
   - `movies.id` → `movies.movieId` trong DB
   - Không có `description` field → dùng `movie_title` làm description
   - Không có `image_url` → generate placeholder images

2. **Rating calculation:**
   - Ratings được calculate từ bảng `ratings` (2.4M rows)
   - Sử dụng `AVG(rating)` và filter movies có ≥ 10 ratings

3. **Users:**
   - 19,470 users có sẵn trong DB
   - Cần add column `role` để phân biệt admin/viewer
   - Password là plain text (cần hash khi production)

4. **Performance:**
   - Queries có LIMIT để tránh timeout
   - Đã tạo indexes cho watch_history
   - Connection timeout tăng lên 10 seconds

## 🔍 Verify Setup

Sau khi chạy setup script, verify bằng queries này:

```sql
-- Check watch_history table exists
SELECT COUNT(*) FROM watch_history;

-- Check users have role column
SELECT id, username, role FROM users LIMIT 5;

-- Check admin user
SELECT * FROM users WHERE role = 'admin' LIMIT 1;

-- Check sample watch history with movie details
SELECT 
    wh.user_id,
    u.username,
    wh.movie_id,
    m.movie_title,
    wh.watched_at
FROM watch_history wh
JOIN users u ON wh.user_id = u.id
JOIN movies m ON wh.movie_id = m.movieId
LIMIT 10;
```

## 🎯 Next Steps

1. ✅ Chạy `setup_watch_history.sql` trên Render
2. ⏳ Test backend APIs
3. ⏳ Kết nối Frontend với Backend APIs
4. ⏳ Replace dummy data trong `src/services/movieService.js`

## 🐛 Troubleshooting

### Connection timeout
```
Error: Connection terminated due to connection timeout
```
**Solution:** Đã tăng `connectionTimeoutMillis` lên 10000ms trong `config.js`

### Table already exists
```
ERROR: relation "watch_history" already exists
```
**Solution:** Script có `DROP TABLE IF EXISTS` ở đầu

### No data in watch_history
```
SELECT COUNT(*) FROM watch_history; -- Returns 0
```
**Solution:** Chạy lại phần seed trong `setup_watch_history.sql`

---

✅ **Database queries đã sẵn sàng!**  
⏳ **Cần chạy setup script để tạo watch_history table**

