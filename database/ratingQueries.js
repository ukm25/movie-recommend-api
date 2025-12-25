const { query } = require('./config');

/**
 * Get user rating for a specific movie
 */
const getUserRating = async (userId, movieId) => {
  const sql = `
    SELECT rating
    FROM ratings
    WHERE "userId" = $1 AND "movieId" = $2
  `;
  
  try {
    const result = await query(sql, [userId, movieId]);
    return result.rows.length > 0 ? result.rows[0].rating : null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    throw error;
  }
};

/**
 * Add or update user rating for a movie
 */
const addOrUpdateRating = async (userId, movieId, rating) => {
  // Validate rating (0.5 to 5.0, in 0.5 increments)
  if (rating < 0.5 || rating > 5.0 || (rating * 2) % 1 !== 0) {
    throw new Error('Rating must be between 0.5 and 5.0 in 0.5 increments');
  }

  // Check if rating already exists
  const checkSql = `
    SELECT "userId", "movieId", rating, timestamp
    FROM ratings
    WHERE "userId" = $1 AND "movieId" = $2
  `;
  
  try {
    const checkResult = await query(checkSql, [userId, movieId]);
    
    if (checkResult.rows.length > 0) {
      // Update existing rating
      const updateSql = `
        UPDATE ratings
        SET rating = $3, timestamp = EXTRACT(EPOCH FROM NOW())
        WHERE "userId" = $1 AND "movieId" = $2
        RETURNING "userId", "movieId", rating, timestamp
      `;
      const result = await query(updateSql, [userId, movieId, rating]);
      return result.rows[0];
    } else {
      // Insert new rating
      const insertSql = `
        INSERT INTO ratings ("userId", "movieId", rating, timestamp)
        VALUES ($1, $2, $3, EXTRACT(EPOCH FROM NOW()))
        RETURNING "userId", "movieId", rating, timestamp
      `;
      const result = await query(insertSql, [userId, movieId, rating]);
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error adding/updating rating:', error);
    throw error;
  }
};

/**
 * Get all ratings for a movie
 */
const getMovieRatings = async (movieId) => {
  const sql = `
    SELECT 
      r.rating,
      COUNT(*) as count
    FROM ratings r
    WHERE r."movieId" = $1
    GROUP BY r.rating
    ORDER BY r.rating DESC
  `;
  
  try {
    const result = await query(sql, [movieId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting movie ratings:', error);
    throw error;
  }
};

module.exports = {
  getUserRating,
  addOrUpdateRating,
  getMovieRatings,
};

