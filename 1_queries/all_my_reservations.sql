SELECT properties.*, reservations.*,
avg(rating) as average_rating
FROM reservations
JOIN users on reservations.guest_id = users.id
JOIN properties on reservations.property_id = properties.id
JOIN property_reviews on property_reviews.property_id = properties.id
WHERE reservations.guest_id = 1
AND end_date - now()::date < 0
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date;