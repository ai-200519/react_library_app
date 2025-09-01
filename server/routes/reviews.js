const express = require('express');
const router = express.Router();

const normalizeString = (str) => {
  return str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

module.exports = (pool) => {
  // Get reviews for a book (by title and author)
  router.get('/book', async (req, res) => {
    try {
      const { title, author } = req.query;
      
      if (!title || !author) {
        return res.status(400).json({ error: 'Title and author required' });
      }

      const titleNorm = normalizeString(title);
      const authorNorm = normalizeString(author);

      const { rows } = await pool.query(`
        SELECT id, rating, review_text, reviewer_name, created_at
        FROM reviews 
        WHERE title_normalized = $1 AND author_normalized = $2
        ORDER BY created_at DESC
      `, [titleNorm, authorNorm]);

      // Calculate average rating
      const avgRating = rows.length > 0 
        ? rows.reduce((sum, review) => sum + review.rating, 0) / rows.length
        : null;

      res.json({
        reviews: rows,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: rows.length
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all reviews (for moderation, etc.)
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { rows } = await pool.query(`
        SELECT * FROM reviews 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      const countResult = await pool.query('SELECT COUNT(*) FROM reviews');
      const totalReviews = parseInt(countResult.rows[0].count);

      res.json({
        reviews: rows,
        pagination: {
          page,
          limit,
          totalReviews,
          totalPages: Math.ceil(totalReviews / limit),
          hasNextPage: page * limit < totalReviews,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create anonymous review
  router.post('/', async (req, res) => {
    try {
      const {
        bookTitle, bookAuthor, bookIsbn, rating, reviewText, 
        reviewerName, deviceId
      } = req.body;

      if (!bookTitle || !bookAuthor || !rating) {
        return res.status(400).json({ 
          error: 'Book title, author, and rating are required' 
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          error: 'Rating must be between 1 and 5' 
        });
      }

      const titleNorm = normalizeString(bookTitle);
      const authorNorm = normalizeString(bookAuthor);

      const { rows } = await pool.query(`
        INSERT INTO reviews (
          book_title, book_author, book_isbn, title_normalized, 
          author_normalized, device_id, rating, review_text, reviewer_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        bookTitle, bookAuthor, bookIsbn || null, titleNorm, authorNorm,
        deviceId || null, rating, reviewText || null, reviewerName || 'Anonymous'
      ]);

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update review (only by same device)
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, reviewText, reviewerName } = req.body;
      const deviceId = req.headers['x-device-id'];

      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID required' });
      }

      const { rows } = await pool.query(
        'DELETE FROM reviews WHERE id = $1 AND device_id = $2 RETURNING *',
        [id, deviceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Review not found or unauthorized' });
      }

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
