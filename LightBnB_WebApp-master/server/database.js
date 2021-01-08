const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');


const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE email = $1
  `, [email])
  .then(res => res.rows[0]);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1
  `, [id])
  .then(res => res.rows[0]);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES
  ( $1, $2, $3)
  RETURNING *; 
  `, [user.name, user.email, user.password])
  .then(res => res.rows[0]);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
  SELECT * 
  FROM properties
  JOIN reservations on property_id = properties.id
  WHERE guest_id = $1
  LIMIT $2
  `, [guest_id, limit])
  .then(res => res.rows);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id 
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  
  if (options.owner_id) {
    queryParams.push(Number(options.owner_id));
    if (queryParams.length === 1) {
      console.log(options.owner_id)
      queryString += `
       WHERE properties.owner_id = $${queryParams.length} `;
    } else {
    queryString += ` AND properties.owner_id = $${queryParams.length} `;
    }
  }

  if (options.owner_id) {
    console.log(options.owner_id, 'this is options')
    console.log('this is query', queryParams)

  }

  if (options.minimum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night) * 100);
    if (queryParams.length === 1) {
      queryString += `
       WHERE properties.cost_per_night > $${queryParams.length} `;
    } else {
    queryString += ` AND properties.cost_per_night > $${queryParams.length} `;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(Number(options.maximum_price_per_night) * 100);
    if (queryParams.length === 1) {
      queryString += `
       WHERE properties.cost_per_night < $${queryParams.length} `;
    } else {
    queryString += ` AND properties.cost_per_night < $${queryParams.length} `;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += ` GROUP BY properties.id HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  if (!options.minimum_rating) {
    queryString += ` GROUP BY properties.id `;
  }
  queryParams.push(limit);
  queryString += ` 
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  console.log(queryString, queryParams)
  return pool.query(queryString, queryParams)
  .then(res => res.rows);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  console.log(property, 'proportyhhhhhhhhhchchhchchchhchchchhchchhchchhchchhchchchhchch')
  return pool.query(`
  INSERT INTO properties 
  (
    owner_id,
    title, 
    description,
    thumbnail_photo_url, 
    cover_photo_url, 
    cost_per_night, 
    parking_spaces, 
    number_of_bathrooms, 
    number_of_bedrooms, 
    country, 
    street, 
    city, 
    province, 
    post_code, 
    active
  )
  VALUES
  ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  RETURNING *; 
  `, [
    property.owner_id,
    property.title, 
    property.description,
    property.thumbnail_photo_url, 
    property.cover_photo_url, 
    property.cost_per_night, 
    property.parking_spaces, 
    property.number_of_bathrooms, 
    property.number_of_bedrooms, 
    property.country, 
    property.street, 
    property.city, 
    property.province, 
    property.post_code, 
    true
  ])
  .then(res => {
    console.log(res.rows[0])
    res.rows[0]}
  );
}
exports.addProperty = addProperty;
