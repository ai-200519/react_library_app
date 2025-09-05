const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all books for device
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT b.*, 
               COALESCE(
                 JSON_AGG(
                   JSON_BUILD_OBJECT('id', s.id, 'name', s.name)
                   ORDER BY s.id
                 ) FILTER (WHERE s.id IS NOT NULL), 
                 '[]'
               ) as shelves,
               COALESCE(
                 JSON_AGG(
                   DISTINCT t.name
                   ORDER BY t.name
                 ) FILTER (WHERE t.id IS NOT NULL), 
                 '[]'
               ) as tags
        FROM books b
        LEFT JOIN book_shelves bs ON b.id = bs.book_id
        LEFT JOIN shelves s ON bs.shelf_id = s.id
        LEFT JOIN book_tags bt ON b.id = bt.book_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.device_id = $1 
        GROUP BY b.id
        ORDER BY b.created_at DESC
      `, [req.deviceId]);

      res.json(rows);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single book
  router.get('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT b.*, 
               COALESCE(
                 JSON_AGG(
                   JSON_BUILD_OBJECT('id', s.id, 'name', s.name)
                   ORDER BY s.id
                 ) FILTER (WHERE s.id IS NOT NULL), 
                 '[]'
               ) as shelves,
               COALESCE(
                 JSON_AGG(
                   DISTINCT t.name
                   ORDER BY t.name
                 ) FILTER (WHERE t.id IS NOT NULL), 
                 '[]'
               ) as tags
        FROM books b
        LEFT JOIN book_shelves bs ON b.id = bs.book_id
        LEFT JOIN shelves s ON bs.shelf_id = s.id
        LEFT JOIN book_tags bt ON b.id = bt.book_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.id = $1 AND b.device_id = $2
        GROUP BY b.id
      `, [req.params.id, req.deviceId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create book
  router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      title, author, series, volume, publication_date, isbn,
      language, pages, genre, description, image_url, rating,
      published_year, work_key, pages_read, date_started,
      date_finished, due_date, lend_to, borrow_from, date_added,
      shelves = [], tags = []
    } = req.body;

    // Add debugging
    console.log('Creating book with due_date:', due_date);

    // Insert book
    const bookResult = await client.query(`
      INSERT INTO books (
        device_id, title, author, series, volume, publication_date,
        isbn, language, pages, genre, description, image_url,
        rating, published_year, work_key, pages_read, date_started,
        date_finished, due_date, lend_to, borrow_from, date_added
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `, [
      req.deviceId, title, author, series, volume, publication_date,
      isbn, language, pages, genre, description, image_url,
      rating, published_year, work_key, pages_read, date_started,
      date_finished, due_date, lend_to, borrow_from, date_added || new Date().toISOString()
    ]);

    const book = bookResult.rows[0];

    // Handle shelves
    if (shelves && shelves.length > 0) {
      for (const shelfId of shelves) {
        await client.query(`
          INSERT INTO book_shelves (book_id, shelf_id)
          VALUES ($1, $2)
          ON CONFLICT (book_id, shelf_id) DO NOTHING
        `, [book.id, shelfId]); // Now book.id is properly defined
      }
    }

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create tag if it doesn't exist
        const tagResult = await client.query(`
          INSERT INTO tags (device_id, name)
          VALUES ($1, $2)
          ON CONFLICT (device_id, name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [req.deviceId, tagName]);

        const tagId = tagResult.rows[0].id;

        // Link book to tag
        await client.query(`
          INSERT INTO book_tags (book_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT (book_id, tag_id) DO NOTHING
        `, [book.id, tagId]);
      }
    }

    await client.query('COMMIT');
    
    // Return book with relationships
    const finalResult = await client.query(`
      SELECT b.*, 
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT('id', s.id, 'name', s.name)
                 ORDER BY s.id
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'
             ) as shelves,
             COALESCE(
               JSON_AGG(
                 DISTINCT t.name
                 ORDER BY t.name
               ) FILTER (WHERE t.id IS NOT NULL), 
               '[]'
             ) as tags
      FROM books b
      LEFT JOIN book_shelves bs ON b.id = bs.book_id
      LEFT JOIN shelves s ON bs.shelf_id = s.id
      LEFT JOIN book_tags bt ON b.id = bt.book_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      WHERE b.id = $1
      GROUP BY b.id
    `, [book.id]);

    res.status(201).json(finalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating book:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

  // Update book - FIXED VERSION
  router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const {
        title, author, series, volume, publication_date, isbn,
        language, pages, genre, description, image_url, rating,
        published_year, work_key, pages_read, date_started,
        date_finished, due_date, lend_to, borrow_from, date_added,
        shelves = [], tags = []
      } = req.body;
      // Update book - FIXED: Correct parameter positioning
      const bookResult = await client.query(`
        UPDATE books SET 
          title = $2, author = $3, series = $4, volume = $5, publication_date = $6,
          isbn = $7, language = $8, pages = $9, genre = $10, description = $11,
          image_url = $12, rating = $13, published_year = $14, work_key = $15,
          pages_read = $16, date_started = $17, date_finished = $18,
          due_date = $19, lend_to = $20, borrow_from = $21, date_added = $22,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND device_id = $23
        RETURNING *
      `, [
        id, title, author, series, volume, publication_date, isbn,
        language, pages, genre, description, image_url, rating,
        published_year, work_key, pages_read, date_started,
        date_finished, due_date, lend_to, borrow_from, date_added, req.deviceId
      ]);

      console.log('Updated book due_date:', bookResult.rows[0]?.due_date);

      if (bookResult.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      // Clear existing relationships
      await client.query('DELETE FROM book_shelves WHERE book_id = $1', [id]);
      await client.query('DELETE FROM book_tags WHERE book_id = $1', [id]);

      // Handle shelves
      if (shelves && shelves.length > 0) {
        for (const shelfId of shelves) {
          await client.query(`
            INSERT INTO book_shelves (book_id, shelf_id)
            VALUES ($1, $2)
          `, [id, shelfId]);
        }
      }

      // Handle tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Create tag if it doesn't exist
          const tagResult = await client.query(`
            INSERT INTO tags (device_id, name)
            VALUES ($1, $2)
            ON CONFLICT (device_id, name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `, [req.deviceId, tagName]);

          const tagId = tagResult.rows[0].id;

          // Link book to tag
          await client.query(`
            INSERT INTO book_tags (book_id, tag_id)
            VALUES ($1, $2)
          `, [id, tagId]);
        }
      }

      await client.query('COMMIT');

      // Return updated book with relationships
      const finalResult = await client.query(`
        SELECT b.*, 
               COALESCE(
                 JSON_AGG(
                   JSON_BUILD_OBJECT('id', s.id, 'name', s.name)
                   ORDER BY s.id
                 ) FILTER (WHERE s.id IS NOT NULL), 
                 '[]'
               ) as shelves,
               COALESCE(
                 JSON_AGG(
                   DISTINCT t.name
                   ORDER BY t.name
                 ) FILTER (WHERE t.id IS NOT NULL), 
                 '[]'
               ) as tags
        FROM books b
        LEFT JOIN book_shelves bs ON b.id = bs.book_id
        LEFT JOIN shelves s ON bs.shelf_id = s.id
        LEFT JOIN book_tags bt ON b.id = bt.book_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.id = $1
        GROUP BY b.id
      `, [id]);

      res.json(finalResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating book:', error);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });

  // Update book review/rating (specific endpoint for personal reviews)
  router.patch('/:id/review', async (req, res) => {
    console.log('Review update request:', req.params.id, req.body) 
    try {
      const { id } = req.params;
      const { deviceId } = req;
      const { personal_rating, personal_review, reading_status, reading_notes } = req.body;

      // Check if book exists and belongs to device
      const bookCheck = await pool.query(
        'SELECT id FROM books WHERE id = $1 AND device_id = $2',
        [id, deviceId]
      );

      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const result = await pool.query(
        `UPDATE books 
         SET personal_rating = $1, personal_review = $2, reading_status = $3, reading_notes = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND device_id = $6
         RETURNING *`,
        [personal_rating, personal_review, reading_status, reading_notes, id, deviceId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating book review:', error);
      res.status(500).json({ error: 'Failed to update book review' });
    }
  });

  // Delete book
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { rows } = await pool.query(
        'DELETE FROM books WHERE id = $1 AND device_id = $2 RETURNING *',
        [id, req.deviceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};