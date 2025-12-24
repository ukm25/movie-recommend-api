# Movie Recommendation Backend

Backend API cho hệ thống đề xuất phim sử dụng Node.js + Express + PostgreSQL.

## 🚀 Cài Đặt

### 1. Cài Đặt Dependencies

```bash
npm install
```

### 2. Cấu Hình Database

Đảm bảo file `.env` đã được tạo ở root directory với thông tin database:

```env
DB_HOST=dpg-d4m61da4d50c73eeecd0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=movie_recommendation_system_seei
DB_USER=movie_recommendation_system_seei_user
DB_PASSWORD=FassQu6urZDRnOaeNKAxO5XcwCX19Ct0
DATABASE_URL=postgresql://movie_recommendation_system_seei_user:FassQu6urZDRnOaeNKAxO5XcwCX19Ct0@dpg-d4m61da4d50c73eeecd0-a.oregon-postgres.render.com/movie_recommendation_system_seei

PORT=5000
NODE_ENV=development
```

### 3. Khởi Tạo Database

Chạy SQL script để tạo tables và seed data:

```bash
# Sử dụng psql command line
psql $DATABASE_URL -f backend/database/init.sql

# Hoặc sử dụng Render Dashboard
# 1. Vào Render Dashboard
# 2. Chọn PostgreSQL instance
# 3. Vào tab "Shell"
# 4. Paste nội dung file init.sql và chạy
```

### 4. Chạy Server

#### Development Mode (với nodemon - auto restart)
```bash
npm run server
```

#### Production Mode
```bash
node backend/server.js
```

#### Chạy cả Backend + Frontend
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

---

## 📁 Cấu Trúc Thư Mục

```
backend/
├── database/
│   ├── config.js                    # Database connection pool
│   ├── movieQueries.js              # Movie-related queries
│   ├── userQueries.js               # User-related queries
│   ├── watchHistoryQueries.js       # Watch history queries
│   ├── recommendationQueries.js     # Recommendation algorithm
│   └── init.sql                     # Database schema & seed data
├── server.js                        # Express server & API routes
├── API_DOCUMENTATION.md             # API documentation
└── README.md                        # This file
```

---

## 🗄️ Database Schema

### Tables

1. **users**
   - id, username, password, role (admin/viewer), created_at

2. **genres**
   - id, name

3. **movies**
   - id, title, year, rating, description, image_url, created_at

4. **movie_genres** (junction table)
   - id, movie_id, genre_id

5. **watch_history**
   - id, user_id, movie_id, watched_at

### Default Users

```
Username: admin
Password: admin123
Role: admin

Username: viewer1
Password: viewer123
Role: viewer

Username: viewer2
Password: viewer123
Role: viewer
```

---

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Movies
```
GET    /api/movies                  # Get all movies
GET    /api/movies/:id              # Get movie by ID
GET    /api/movies/hot/list         # Get hot movies
GET    /api/movies/search/:term     # Search movies
GET    /api/movies/genre/:name      # Get movies by genre
GET    /api/genres                  # Get all genres
```

### Users & Authentication
```
GET    /api/users                   # Get all users
GET    /api/users/:id               # Get user by ID
POST   /api/auth/login              # Login
POST   /api/users                   # Create user
```

### Watch History
```
GET    /api/watch-history/user/:userId              # Get user watch history
GET    /api/watch-history/all                       # Get all users history (admin)
POST   /api/watch-history                           # Add to watch history
DELETE /api/watch-history/:userId/:movieId          # Remove from history
GET    /api/watch-history/user/:userId/preferences  # Get user preferences
GET    /api/watch-history/trends                    # Get genre trends (admin)
GET    /api/watch-history/check/:userId/:movieId    # Check if watched
```

### Recommendations
```
GET    /api/recommendations/user/:userId      # Get recommendations for user
GET    /api/recommendations/similar/:movieId  # Get similar movies
GET    /api/recommendations/trending          # Get trending movies
```

Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) để biết chi tiết.

---

## 🧪 Testing API

### Sử dụng cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get all movies
curl http://localhost:5000/api/movies

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer1","password":"viewer123"}'

# Get recommendations
curl http://localhost:5000/api/recommendations/user/2

# Add to watch history
curl -X POST http://localhost:5000/api/watch-history \
  -H "Content-Type: application/json" \
  -d '{"userId":2,"movieId":1}'
```

### Sử dụng Postman hoặc Thunder Client

Import collection từ [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🎯 Recommendation Algorithm

Thuật toán đề xuất phim dựa trên:

1. **User Genre Preferences**
   - Phân tích lịch sử xem của user
   - Xác định top 3 thể loại yêu thích
   - Tính điểm dựa trên số lượt xem mỗi thể loại

2. **Matching Score**
   - Tìm phim có thể loại trùng với sở thích user
   - Loại bỏ phim đã xem
   - Sắp xếp theo: số thể loại trùng khớp → rating cao

3. **Similar Movies**
   - Tìm phim có cùng thể loại với phim đang xem
   - Sắp xếp theo số thể loại trùng và rating

4. **Trending Movies**
   - Top phim được xem nhiều nhất trong N ngày gần đây
   - Mặc định: 7 ngày

---

## 🔧 Database Query Functions

### movieQueries.js
- `getAllMovies()` - Lấy tất cả phim
- `getMovieById(id)` - Lấy phim theo ID
- `getHotMovies(limit)` - Lấy phim hot (rating cao, năm gần)
- `searchMovies(term)` - Tìm kiếm phim
- `getMoviesByGenre(name)` - Lấy phim theo thể loại
- `getAllGenres()` - Lấy tất cả thể loại

### userQueries.js
- `getAllUsers()` - Lấy tất cả users
- `getUserById(id)` - Lấy user theo ID
- `getUserByUsername(username)` - Lấy user theo username
- `createUser(username, password, role)` - Tạo user mới
- `updateUserRole(id, role)` - Cập nhật role
- `deleteUser(id)` - Xóa user

### watchHistoryQueries.js
- `getUserWatchHistory(userId)` - Lấy lịch sử xem
- `getAllUsersWatchHistory()` - Lấy tổng hợp lịch sử tất cả users
- `addToWatchHistory(userId, movieId)` - Thêm phim đã xem
- `removeFromWatchHistory(userId, movieId)` - Xóa khỏi lịch sử
- `getUserGenrePreferences(userId)` - Lấy sở thích thể loại
- `getGenreTrends()` - Lấy xu hướng thể loại
- `hasWatchedMovie(userId, movieId)` - Kiểm tra đã xem chưa

### recommendationQueries.js
- `getRecommendations(userId, limit)` - Lấy đề xuất cho user
- `getSimilarMovies(movieId, limit)` - Lấy phim tương tự
- `getTrendingMovies(days, limit)` - Lấy phim trending

---

## 🐛 Troubleshooting

### Lỗi kết nối database

```
Error: connect ECONNREFUSED
```

**Giải pháp:**
1. Kiểm tra file `.env` có đúng thông tin
2. Kiểm tra PostgreSQL đã chạy chưa
3. Kiểm tra firewall/network có block không

### Lỗi SSL

```
Error: SSL connection required
```

**Giải pháp:**
Đã config SSL trong `backend/database/config.js`:

```javascript
ssl: {
  rejectUnauthorized: false
}
```

### Port đã được sử dụng

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Giải pháp:**
```bash
# Tìm process đang sử dụng port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Hoặc đổi port trong .env
PORT=5001
```

---

## 📝 Notes

- Database connection sử dụng **connection pool** để tối ưu performance
- Tất cả queries đều có **error handling** và logging
- Password hiện tại lưu plain text - **cần hash** khi deploy production (bcrypt)
- API hiện tại không có authentication middleware - cần thêm JWT khi deploy

---

## 🚀 Deployment

### Deploy Backend trên Render

1. Tạo **Web Service** mới trên Render
2. Connect GitHub repository
3. Cấu hình:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (nếu deploy từ Backend folder) hoặc `cd Backend && node server.js` (nếu deploy từ root)
   - **Environment Variables**: Copy từ `.env` (KHÔNG commit file .env lên git)
4. Add PostgreSQL database connection
5. Deploy!

### Environment Variables trên Render

```
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=production
```

Render sẽ tự động set `PORT` environment variable.

---

## 📚 Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js
- **dotenv** - Environment variables management
- **cors** - Enable CORS for frontend
- **nodemon** - Auto-restart development server
- **concurrently** - Run multiple commands

---

## 👨‍💻 Development

### Add More Movies

1. Insert vào table `movies`
2. Insert vào table `movie_genres` (liên kết movie với genres)

```sql
-- Add new movie
INSERT INTO movies (title, year, rating, description, image_url)
VALUES ('Movie Title', 2024, 8.5, 'Description...', 'https://...');

-- Get the movie ID (last inserted)
SELECT id FROM movies ORDER BY id DESC LIMIT 1;

-- Link movie with genres
INSERT INTO movie_genres (movie_id, genre_id)
VALUES
  (71, 1),  -- Action
  (71, 13); -- Sci-Fi
```

### Modify Recommendation Algorithm

Chỉnh sửa file `backend/database/recommendationQueries.js`:

- Thay đổi `LIMIT 3` trong `user_genres` để lấy nhiều/ít thể loại hơn
- Thêm weight cho rating
- Filter theo year, etc.

---

## 📄 License

Private project for learning purposes.

