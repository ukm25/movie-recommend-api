const { query } = require('./config');

/**
 * Get watch history for a user
 */
const getUserWatchHistory = async (userId) => {
  const sql = `
    SELECT 
      wh.id,
      wh.user_id,
      wh.movie_id,
      wh.watched_at,
      m.movie_title as title,
      m.release_year as year,
      COALESCE(AVG(r.rating)::numeric(3,1), 0) as rating,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres
    FROM watch_history wh
    INNER JOIN movies m ON wh.movie_id = m."movieId"
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    WHERE wh.user_id = $1
    GROUP BY wh.id, wh.user_id, wh.movie_id, wh.watched_at, 
             m.movie_title, m.release_year
    ORDER BY wh.watched_at DESC
  `;
  
  try {
    const result = await query(sql, [userId]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error getting user watch history:', error);
    throw error;
  }
};

/**
 * Get all users watch history (for admin)
 */
const getAllUsersWatchHistory = async () => {
  const sql = `
    SELECT 
      u.id as user_id,
      u.username,
      COUNT(DISTINCT wh.id) as movies_watched,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as favorite_genres,
      MAX(wh.watched_at) as last_watched
    FROM users u
    LEFT JOIN watch_history wh ON u.id = wh.user_id
    LEFT JOIN movies m ON wh.movie_id = m.movieId
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    WHERE COALESCE(u.role, 'viewer') = 'viewer'
    GROUP BY u.id, u.username
    HAVING COUNT(DISTINCT wh.id) > 0
    ORDER BY movies_watched DESC
    LIMIT 50
  `;
  
  try {
    const result = await query(sql);
    return result.rows.map(row => ({
      ...row,
      favorite_genres: row.favorite_genres || []
    }));
  } catch (error) {
    console.error('Error getting all users watch history:', error);
    throw error;
  }
};

/**
 * Add movie to watch history
 */
const addToWatchHistory = async (userId, movieId) => {
  // Check if already watched
  const checkSql = `
    SELECT id FROM watch_history
    WHERE user_id = $1 AND movie_id = $2
  `;
  
  try {
    const checkResult = await query(checkSql, [userId, movieId]);
    
    if (checkResult.rows.length > 0) {
      // Already watched, update timestamp
      const updateSql = `
        UPDATE watch_history
        SET watched_at = NOW()
        WHERE user_id = $1 AND movie_id = $2
        RETURNING id, user_id, movie_id, watched_at
      `;
      const result = await query(updateSql, [userId, movieId]);
      return result.rows[0];
    } else {
      // New watch, insert
      const insertSql = `
        INSERT INTO watch_history (user_id, movie_id)
        VALUES ($1, $2)
        RETURNING id, user_id, movie_id, watched_at
      `;
      const result = await query(insertSql, [userId, movieId]);
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error adding to watch history:', error);
    throw error;
  }
};

/**
 * Remove movie from watch history
 */
const removeFromWatchHistory = async (userId, movieId) => {
  const sql = `
    DELETE FROM watch_history
    WHERE user_id = $1 AND movie_id = $2
    RETURNING id, user_id, movie_id
  `;
  
  try {
    const result = await query(sql, [userId, movieId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error removing from watch history:', error);
    throw error;
  }
};

/**
 * Get user genre preferences based on watch history
 */
const getUserGenrePreferences = async (userId) => {
  const sql = `
    SELECT 
      g.genre as genre,
      COUNT(*) as watch_count,
      ROUND(AVG(COALESCE(r.rating, 0))::numeric, 2) as avg_rating
    FROM watch_history wh
    INNER JOIN movies m ON wh.movie_id = m."movieId"
    INNER JOIN movie_genres mg ON m."movieId" = mg.movie_id
    INNER JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId" AND r."userId" = $1
    WHERE wh.user_id = $1
    GROUP BY g.genre
    ORDER BY watch_count DESC, avg_rating DESC
  `;
  
  try {
    const result = await query(sql, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting user genre preferences:', error);
    throw error;
  }
};

/**
 * Get genre trends across all users (for admin)
 */
const getGenreTrends = async () => {
  const sql = `
    SELECT 
      g.genre as genre,
      COUNT(DISTINCT wh.user_id) as users_count,
      COUNT(wh.id) as total_watches,
      ROUND(AVG(COALESCE(r.rating, 0))::numeric, 2) as avg_rating
    FROM watch_history wh
    INNER JOIN movies m ON wh.movie_id = m."movieId"
    INNER JOIN movie_genres mg ON m."movieId" = mg.movie_id
    INNER JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    GROUP BY g.genre
    ORDER BY total_watches DESC, users_count DESC
  `;
  
  try {
    const result = await query(sql);
    return result.rows;
  } catch (error) {
    console.error('Error getting genre trends:', error);
    throw error;
  }
};

/**
 * Check if user has watched a movie
 */
const hasWatchedMovie = async (userId, movieId) => {
  const sql = `
    SELECT id FROM watch_history
    WHERE user_id = $1 AND movie_id = $2
  `;
  
  try {
    const result = await query(sql, [userId, movieId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if movie watched:', error);
    throw error;
  }
};

module.exports = {
  getUserWatchHistory,
  getAllUsersWatchHistory,
  addToWatchHistory,
  removeFromWatchHistory,
  getUserGenrePreferences,
  getGenreTrends,
  hasWatchedMovie,
};
