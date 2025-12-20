const express = require('express');
const cors = require('cors');
require('dotenv').config();

const movieQueries = require('./database/movieQueries');
const userQueries = require('./database/userQueries');
const watchHistoryQueries = require('./database/watchHistoryQueries');
const recommendationQueries = require('./database/recommendationQueries');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// CORS configuration - allow both localhost and production frontend
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, '') // Remove trailing slash if present
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development, restrict in production if needed
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Movie Recommendation API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== MOVIE ROUTES ====================

// Get all movies (with pagination)
app.get('/api/movies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const movies = await movieQueries.getAllMovies(limit, offset);
    res.json({
      success: true,
      data: movies,
      count: movies.length,
      limit,
      offset,
      hasMore: movies.length === limit
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = await movieQueries.getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get hot movies
app.get('/api/movies/hot/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await movieQueries.getHotMovies(limit);
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Search movies
app.get('/api/movies/search/:term', async (req, res) => {
  try {
    const movies = await movieQueries.searchMovies(req.params.term);
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get movies by genre
app.get('/api/movies/genre/:name', async (req, res) => {
  try {
    const movies = await movieQueries.getMoviesByGenre(req.params.name);
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get all genres
app.get('/api/genres', async (req, res) => {
  try {
    const genres = await movieQueries.getAllGenres();
    res.json({
      success: true,
      data: genres,
      count: genres.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== USER ROUTES ====================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await userQueries.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userQueries.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    const user = await userQueries.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    const user = await userQueries.createUser(username, password, role);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== WATCH HISTORY ROUTES ====================

// Get user watch history
app.get('/api/watch-history/user/:userId', async (req, res) => {
  try {
    const history = await watchHistoryQueries.getUserWatchHistory(req.params.userId);
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get all users watch history (admin)
app.get('/api/watch-history/all', async (req, res) => {
  try {
    const history = await watchHistoryQueries.getAllUsersWatchHistory();
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Add to watch history
app.post('/api/watch-history', async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    
    if (!userId || !movieId) {
      return res.status(400).json({
        success: false,
        error: 'userId and movieId are required'
      });
    }
    
    const result = await watchHistoryQueries.addToWatchHistory(userId, movieId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Remove from watch history
app.delete('/api/watch-history/:userId/:movieId', async (req, res) => {
  try {
    const result = await watchHistoryQueries.removeFromWatchHistory(
      req.params.userId,
      req.params.movieId
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Watch history entry not found'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get user genre preferences
app.get('/api/watch-history/user/:userId/preferences', async (req, res) => {
  try {
    const preferences = await watchHistoryQueries.getUserGenrePreferences(req.params.userId);
    res.json({
      success: true,
      data: preferences,
      count: preferences.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get genre trends (admin)
app.get('/api/watch-history/trends', async (req, res) => {
  try {
    const trends = await watchHistoryQueries.getGenreTrends();
    res.json({
      success: true,
      data: trends,
      count: trends.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Check if user has watched a movie
app.get('/api/watch-history/check/:userId/:movieId', async (req, res) => {
  try {
    const hasWatched = await watchHistoryQueries.hasWatchedMovie(
      req.params.userId,
      req.params.movieId
    );
    res.json({
      success: true,
      data: { hasWatched }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== RECOMMENDATION ROUTES ====================

// Get recommendations for a user
app.get('/api/recommendations/user/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await recommendationQueries.getRecommendations(
      req.params.userId,
      limit
    );
    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get similar movies
app.get('/api/recommendations/similar/:movieId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const similar = await recommendationQueries.getSimilarMovies(
      req.params.movieId,
      limit
    );
    res.json({
      success: true,
      data: similar,
      count: similar.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Get trending movies
app.get('/api/recommendations/trending', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    const trending = await recommendationQueries.getTrendingMovies(days, limit);
    res.json({
      success: true,
      data: trending,
      count: trending.length
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// ==================== START SERVER ====================

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

