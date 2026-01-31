-- Create theaters table
CREATE TABLE public.theaters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;

-- Anyone can view theaters
CREATE POLICY "Anyone can view theaters" 
ON public.theaters 
FOR SELECT 
USING (true);

-- Only admins can manage theaters
CREATE POLICY "Only admins can insert theaters" 
ON public.theaters 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update theaters" 
ON public.theaters 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete theaters" 
ON public.theaters 
FOR DELETE 
USING (is_admin());

-- Create showtimes table linking movies to theaters
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  theater_id UUID NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  show_date DATE NOT NULL DEFAULT CURRENT_DATE,
  show_time TIME NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 40,
  price NUMERIC NOT NULL DEFAULT 12.99,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active showtimes
CREATE POLICY "Anyone can view showtimes" 
ON public.showtimes 
FOR SELECT 
USING (true);

-- Only admins can manage showtimes
CREATE POLICY "Only admins can insert showtimes" 
ON public.showtimes 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update showtimes" 
ON public.showtimes 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete showtimes" 
ON public.showtimes 
FOR DELETE 
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_showtimes_movie_id ON public.showtimes(movie_id);
CREATE INDEX idx_showtimes_theater_id ON public.showtimes(theater_id);
CREATE INDEX idx_showtimes_show_date ON public.showtimes(show_date);

-- Insert sample theaters
INSERT INTO public.theaters (name, location, address, amenities) VALUES
  ('PVR Cinemas', 'Phoenix Mall', '123 Phoenix Mall, Downtown', ARRAY['Dolby Atmos', 'IMAX', 'Recliner Seats']),
  ('INOX Movies', 'City Center', '456 City Center, Midtown', ARRAY['4DX', 'Premium Lounge', 'F&B Service']),
  ('Cinepolis', 'Metro Junction', '789 Metro Junction, Uptown', ARRAY['ScreenX', 'VIP Seats', 'Parking']),
  ('Carnival Cinemas', 'Central Plaza', '321 Central Plaza, Eastside', ARRAY['Dolby Digital', 'Wheelchair Access']),
  ('Miraj Cinemas', 'Galaxy Mall', '654 Galaxy Mall, Westside', ARRAY['3D', 'Party Hall', 'Gaming Zone']);