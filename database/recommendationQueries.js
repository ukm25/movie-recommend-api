const { query } = require('./config');

/**
 * Get movie recommendations for a user based on their watch history
 */
const getRecommendations = async (userId, limit = 10) => {
  const sql = `
    WITH user_genres AS (
      -- Get user's favorite genres based on watch history
      SELECT 
        g.id as genre_id,
        g.genre as genre_name,
        COUNT(*) as watch_count
      FROM watch_history wh
      INNER JOIN movies m ON wh.movie_id = m."movieId"
      INNER JOIN movie_genres mg ON m."movieId" = mg.movie_id
      INNER JOIN genres g ON mg.genre_id = g.id
      WHERE wh.user_id = $1
      GROUP BY g.id, g.genre
      ORDER BY watch_count DESC
      LIMIT 3
    ),
    watched_movies AS (
      -- Get movies already watched by user
      SELECT movie_id
      FROM watch_history
      WHERE user_id = $1
    ),
    recommended_movies AS (
      -- Get movies with user's favorite genres that haven't been watched
      SELECT DISTINCT
        m."movieId" as id,
        m.movie_title as title,
        m.release_year as year,
        AVG(r.rating)::numeric(3,1) as rating,
        m.movie_title as description,
        ARRAY_AGG(DISTINCT g2.genre) FILTER (WHERE g2.genre IS NOT NULL) as genres,
        COUNT(DISTINCT ug.genre_id) as matching_genres
      FROM movies m
      INNER JOIN movie_genres mg ON m."movieId" = mg.movie_id
      INNER JOIN user_genres ug ON mg.genre_id = ug.genre_id
      LEFT JOIN movie_genres mg2 ON m."movieId" = mg2.movie_id
      LEFT JOIN genres g2 ON mg2.genre_id = g2.id
      LEFT JOIN ratings r ON m."movieId" = r."movieId"
      WHERE m."movieId" NOT IN (SELECT movie_id FROM watched_movies)
      GROUP BY m."movieId", m.movie_title, m.release_year
      HAVING COUNT(r.rating) >= 10
      ORDER BY matching_genres DESC, AVG(r.rating) DESC NULLS LAST
      LIMIT $2
    )
    SELECT * FROM recommended_movies;
  `;
  
  try {
    const result = await query(sql, [userId, limit]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

/**
 * Get similar movies based on genres
 */
const getSimilarMovies = async (movieId, limit = 5) => {
  const sql = `
    WITH movie_genres_list AS (
      -- Get genres of the reference movie
      SELECT genre_id
      FROM movie_genres
      WHERE movie_id = $1
    ),
    similar_movies AS (
      -- Find movies with similar genres
      SELECT DISTINCT
        m."movieId" as id,
        m.movie_title as title,
        m.release_year as year,
        AVG(r.rating)::numeric(3,1) as rating,
        m.movie_title as description,
        ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres,
        COUNT(DISTINCT mg2.genre_id) as matching_genres
      FROM movies m
      INNER JOIN movie_genres mg2 ON m."movieId" = mg2.movie_id
      LEFT JOIN genres g ON mg2.genre_id = g.id
      LEFT JOIN ratings r ON m."movieId" = r."movieId"
      WHERE mg2.genre_id IN (SELECT genre_id FROM movie_genres_list)
        AND m."movieId" != $1
      GROUP BY m."movieId", m.movie_title, m.release_year
      HAVING COUNT(r.rating) >= 10
      ORDER BY matching_genres DESC, AVG(r.rating) DESC NULLS LAST
      LIMIT $2
    )
    SELECT * FROM similar_movies;
  `;
  
  try {
    const result = await query(sql, [movieId, limit]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error getting similar movies:', error);
    throw error;
  }
};

/**
 * Get trending movies (most watched recently)
 */
const getTrendingMovies = async (days = 7, limit = 10) => {
  const sql = `
    SELECT 
      m."movieId" as id,
      m.movie_title as title,
      m.release_year as year,
      AVG(r.rating)::numeric(3,1) as rating,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres,
      COUNT(wh.id) as watch_count
    FROM movies m
    INNER JOIN watch_history wh ON m."movieId" = wh.movie_id
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    WHERE wh.watched_at >= NOW() - INTERVAL '${days} days'
    GROUP BY m."movieId", m.movie_title, m.release_year
    ORDER BY watch_count DESC, AVG(r.rating) DESC NULLS LAST
    LIMIT $1
  `;
  
  try {
    const result = await query(sql, [limit]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error getting trending movies:', error);
    throw error;
  }
};

module.exports = {
  getRecommendations,
  getSimilarMovies,
  getTrendingMovies,
};
