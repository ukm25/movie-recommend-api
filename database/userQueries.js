const { query } = require('./config');

/**
 * Get all users
 */
const getAllUsers = async () => {
  const sql = `
    SELECT 
      id,
      username,
      COALESCE(role, 'viewer') as role
    FROM users
    ORDER BY id ASC
    LIMIT 100
  `;
  
  try {
    const result = await query(sql);
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const sql = `
    SELECT 
      id,
      username,
      COALESCE(role, 'viewer') as role
    FROM users
    WHERE id = $1
  `;
  
  try {
    const result = await query(sql, [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Get user by username (for login)
 */
const getUserByUsername = async (username) => {
  const sql = `
    SELECT 
      id,
      username,
      password,
      COALESCE(role, 'viewer') as role
    FROM users
    WHERE username = $1
  `;
  
  try {
    const result = await query(sql, [username]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

/**
 * Create new user
 */
const createUser = async (username, password, role = 'viewer') => {
  const sql = `
    INSERT INTO users (username, password, role)
    VALUES ($1, $2, $3)
    RETURNING id, username, role
  `;
  
  try {
    const result = await query(sql, [username, password, role]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update user role
 */
const updateUserRole = async (userId, role) => {
  const sql = `
    UPDATE users
    SET role = $2
    WHERE id = $1
    RETURNING id, username, role
  `;
  
  try {
    const result = await query(sql, [userId, role]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  const sql = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, username
  `;
  
  try {
    const result = await query(sql, [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserRole,
  deleteUser,
};
