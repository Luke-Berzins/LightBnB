SELECT properties.*, avg(property_reviews.rating) as average_rating
FROM properties
JOIN property_reviews on properties.id = property_id  
WHERE city LIKE 'Vancouver'
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;