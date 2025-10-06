-- Create genres table
CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create prefectures table
CREATE TABLE prefectures (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create areas table
CREATE TABLE areas (
  id SERIAL PRIMARY KEY,
  prefecture_id INTEGER NOT NULL REFERENCES prefectures(id),
  name TEXT NOT NULL
);

-- Create clinics table
CREATE TABLE clinics (
  id SERIAL PRIMARY KEY,
  genre_id INTEGER NOT NULL REFERENCES genres(id),
  prefecture_id INTEGER NOT NULL REFERENCES prefectures(id),
  area_id INTEGER REFERENCES areas(id),
  name TEXT NOT NULL,
  star NUMERIC,
  user_review_count INTEGER,
  lat NUMERIC,
  lng NUMERIC
);
