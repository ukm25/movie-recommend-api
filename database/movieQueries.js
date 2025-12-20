const { query } = require('./config');

/**
 * Get all movies with their genres (with pagination)
 */
const getAllMovies = async (limit = 20, offset = 0) => {
  const sql = `
    SELECT 
      m."movieId" as id,
      m.movie_title as title,
      m.release_year as year,
      COALESCE(AVG(r.rating)::numeric(3,1), 0) as rating,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres
    FROM movies m
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    GROUP BY m."movieId", m.movie_title, m.release_year
    ORDER BY m.movie_title ASC
    LIMIT $1 OFFSET $2
  `;
  
  try {
    const result = await query(sql, [limit, offset]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error getting all movies:', error);
    throw error;
  }
};

/**
 * Get movie by ID
 */
const getMovieById = async (movieId) => {
  const sql = `
    SELECT 
      m."movieId" as id,
      m.movie_title as title,
      m.release_year as year,
      COALESCE(AVG(r.rating)::numeric(3,1), 0) as rating,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres
    FROM movies m
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    WHERE m."movieId" = $1
    GROUP BY m."movieId", m.movie_title, m.release_year
  `;
  
  try {
    const result = await query(sql, [movieId]);
    if (result.rows.length === 0) return null;
    
    const movie = result.rows[0];
    return {
      ...movie,
      genres: movie.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(movie.title)}`
    };
  } catch (error) {
    console.error('Error getting movie by ID:', error);
    throw error;
  }
};

/**
 * Get hot movies (high rating and recent year)
 */
const getHotMovies = async (limit = 10) => {
  const sql = `
    SELECT 
      m."movieId" as id,
      m.movie_title as title,
      m.release_year as year,
      AVG(r.rating)::numeric(3,1) as rating,
      COUNT(r.rating) as rating_count,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres
    FROM movies m
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    WHERE m.release_year >= 2010
    GROUP BY m."movieId", m.movie_title, m.release_year
    HAVING COUNT(r.rating) >= 50 AND AVG(r.rating) >= 4.0
    ORDER BY AVG(r.rating) DESC, m.release_year DESC
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
    console.error('Error getting hot movies:', error);
    throw error;
  }
};

/**
 * Search movies by title or genre
 */
const searchMovies = async (searchTerm) => {
  const sql = `
    SELECT DISTINCT
      m."movieId" as id,
      m.movie_title as title,
      m.release_year as year,
      COALESCE(AVG(r.rating)::numeric(3,1), 0) as rating,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g.genre) FILTER (WHERE g.genre IS NOT NULL) as genres
    FROM movies m
    LEFT JOIN movie_genres mg ON m."movieId" = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    WHERE 
      LOWER(m.movie_title) LIKE LOWER($1) OR
      LOWER(g.genre) LIKE LOWER($1)
    GROUP BY m."movieId", m.movie_title, m.release_year
    ORDER BY m.movie_title ASC
    LIMIT 100
  `;
  
  try {
    const result = await query(sql, [`%${searchTerm}%`]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

/**
 * Get movies by genre
 */
const getMoviesByGenre = async (genreName) => {
  const sql = `
    SELECT 
      m."movieId" as id,
      m.movie_title as title,
      m.release_year as year,
      COALESCE(AVG(r.rating)::numeric(3,1), 0) as rating,
      m.movie_title as description,
      ARRAY_AGG(DISTINCT g2.genre) FILTER (WHERE g2.genre IS NOT NULL) as genres
    FROM movies m
    INNER JOIN movie_genres mg ON m."movieId" = mg.movie_id
    INNER JOIN genres g ON mg.genre_id = g.id
    LEFT JOIN movie_genres mg2 ON m."movieId" = mg2.movie_id
    LEFT JOIN genres g2 ON mg2.genre_id = g2.id
    LEFT JOIN ratings r ON m."movieId" = r."movieId"
    WHERE LOWER(g.genre) = LOWER($1)
    GROUP BY m."movieId", m.movie_title, m.release_year
    ORDER BY AVG(r.rating) DESC NULLS LAST
    LIMIT 100
  `;
  
  try {
    const result = await query(sql, [genreName]);
    return result.rows.map(row => ({
      ...row,
      genres: row.genres || [],
      image_url: `https://via.placeholder.com/300x450/1a1a1a/e0e0e0?text=${encodeURIComponent(row.title)}`
    }));
  } catch (error) {
    console.error('Error getting movies by genre:', error);
    throw error;
  }
};

/**
 * Get all genres
 */
const getAllGenres = async () => {
  const sql = `
    SELECT id, genre as name
    FROM genres
    ORDER BY genre ASC
  `;
  
  try {
    const result = await query(sql);
    return result.rows;
  } catch (error) {
    console.error('Error getting all genres:', error);
    throw error;
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  getHotMovies,
  searchMovies,
  getMoviesByGenre,
  getAllGenres,
};
