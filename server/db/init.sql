-- server/db/init.sql
-- Fixed SQL syntax errors

-- Device sessions table
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table (linked to device)
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(device_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500),
    series VARCHAR(255),
    volume VARCHAR(50),
    publication_date DATE,
    isbn VARCHAR(20),
    language VARCHAR(100),
    pages INTEGER,
    genre VARCHAR(100),
    description TEXT,
    image_url TEXT,
    rating DECIMAL(3,1),
    published_year INTEGER,
    work_key VARCHAR(255),
    pages_read INTEGER DEFAULT 0,
    date_started DATE,
    date_finished DATE,
    lend_to VARCHAR(255),
    borrow_from VARCHAR(255),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shelves table
CREATE TABLE IF NOT EXISTS shelves (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(device_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, name)
);

-- Tags table (FIXED: Added missing comma)
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(device_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, name)
);

-- Book-Shelf relationship (many-to-many)
CREATE TABLE IF NOT EXISTS book_shelves (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    shelf_id INTEGER REFERENCES shelves(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, shelf_id)
);

-- Book-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS book_tags (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, tag_id)
);

-- Public reviews (no authentication required - anonymous)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    book_title VARCHAR(500) NOT NULL,
    book_author VARCHAR(500) NOT NULL,
    book_isbn VARCHAR(20),
    title_normalized VARCHAR(500),
    author_normalized VARCHAR(500),
    device_id VARCHAR(255) REFERENCES devices(device_id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    reviewer_name VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_device_id ON books(device_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

CREATE INDEX IF NOT EXISTS idx_shelves_device_id ON shelves(device_id);
CREATE INDEX IF NOT EXISTS idx_shelves_name ON shelves(device_id, name);

CREATE INDEX IF NOT EXISTS idx_tags_device_id ON tags(device_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(device_id, name);

CREATE INDEX IF NOT EXISTS idx_book_shelves_book_id ON book_shelves(book_id);
CREATE INDEX IF NOT EXISTS idx_book_shelves_shelf_id ON book_shelves(shelf_id);

CREATE INDEX IF NOT EXISTS idx_book_tags_book_id ON book_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_book_tags_tag_id ON book_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_reviews_normalized ON reviews(title_normalized, author_normalized);
CREATE INDEX IF NOT EXISTS idx_reviews_device_id ON reviews(device_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Function to automatically create default shelf for new devices
CREATE OR REPLACE FUNCTION create_default_shelf()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO shelves (device_id, name, description)
    VALUES (NEW.device_id, 'Ma Bibliothèque', 'Étagère par défaut')
    ON CONFLICT (device_id, name) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default shelf when new device is registered
DROP TRIGGER IF EXISTS trigger_create_default_shelf ON devices;
CREATE TRIGGER trigger_create_default_shelf
    AFTER INSERT ON devices
    FOR EACH ROW
    EXECUTE FUNCTION create_default_shelf();

-- Insert some test data to verify everything works
INSERT INTO devices (device_id) VALUES ('test_setup_device') ON CONFLICT DO NOTHING;

-- Verify the trigger worked
DO $$
DECLARE
    shelf_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO shelf_count FROM shelves WHERE device_id = 'test_setup_device';
    IF shelf_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Default shelf creation trigger is working!';
    ELSE
        RAISE WARNING 'Default shelf was not created automatically';
    END IF;
END;
$$;

-- Clean up test data
DELETE FROM devices WHERE device_id = 'test_setup_device';

-- Final verification
SELECT 'Database initialization completed successfully!' as status;

CREATE USER ayman WITH PASSWORD '2005';
GRANT ALL PRIVILEGES ON DATABASE library_db TO ayman;