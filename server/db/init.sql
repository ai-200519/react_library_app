-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Anonymous users (device-based)
CREATE TABLE IF NOT EXISTS user_profiles (
  device_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canonical book data
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT UNIQUE,
  pages INTEGER,
  language TEXT,
  genre TEXT,
  image_url TEXT,
  description TEXT,
  series TEXT,
  volume TEXT,
  published_year INTEGER,
);

-- User-specific metadata for a book
CREATE TABLE IF NOT EXISTS user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_device_id TEXT NOT NULL REFERENCES user_profiles(device_id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  pages_read INTEGER DEFAULT 0,
  date_started DATE,
  date_finished DATE,
  
  tags TEXT[] DEFAULT '{}',
  shelves TEXT[] DEFAULT '{}',
  lend_to TEXT,
  borrow_from TEXT,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_device_id, book_id),
);

-- Helpful index if you upsert on isbn
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
