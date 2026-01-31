-- Add trailer_url and category columns to movies table
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS trailer_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'movies';

-- Add comment for category values
COMMENT ON COLUMN public.movies.category IS 'Category type: movies, stream, events, plays, sports, activities';