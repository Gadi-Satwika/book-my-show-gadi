-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create payment_status enum for bookings
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  poster_url TEXT,
  description TEXT,
  genres TEXT[] DEFAULT '{}',
  rating NUMERIC(3,1) DEFAULT 0,
  votes INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 120,
  release_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  seats JSONB NOT NULL,
  show_time TIMESTAMPTZ NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  booking_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  favorite_genres TEXT[] DEFAULT '{}',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Movies policies (public read, admin write)
CREATE POLICY "Anyone can view available movies"
  ON public.movies FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert movies"
  ON public.movies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update movies"
  ON public.movies FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete movies"
  ON public.movies FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own pending bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING ((user_id = auth.uid() AND payment_status = 'pending') OR public.is_admin());

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default preferences
  INSERT INTO public.user_preferences (user_id, favorite_genres, notification_enabled)
  VALUES (NEW.id, '{}', true);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample movies
INSERT INTO public.movies (title, poster_url, description, genres, rating, votes, duration, release_date, is_available) VALUES
('Dune: Part Two', 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', ARRAY['Action', 'Adventure', 'Sci-Fi'], 8.8, 125000, 166, '2024-03-01', true),
('Oppenheimer', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', ARRAY['Biography', 'Drama', 'History'], 8.9, 850000, 180, '2023-07-21', true),
('The Batman', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop', 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.', ARRAY['Action', 'Crime', 'Drama'], 8.4, 720000, 176, '2022-03-04', true),
('Spider-Man: No Way Home', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop', 'With Spider-Man identity now revealed, Peter asks Doctor Strange for help.', ARRAY['Action', 'Adventure', 'Fantasy'], 8.7, 890000, 148, '2021-12-17', true),
('Avatar: The Way of Water', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop', 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.', ARRAY['Action', 'Adventure', 'Fantasy'], 7.8, 450000, 192, '2022-12-16', true),
('Guardians of the Galaxy Vol. 3', 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=400&h=600&fit=crop', 'Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe.', ARRAY['Action', 'Adventure', 'Comedy'], 8.1, 380000, 150, '2023-05-05', true),
('Furiosa: A Mad Max Saga', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', 'The origin story of renegade warrior Furiosa before her encounter with Mad Max.', ARRAY['Action', 'Adventure', 'Sci-Fi'], 0, 0, 148, '2024-05-24', false),
('Deadpool 3', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', 'Wade Wilson joins forces with Wolverine in a multiverse-spanning adventure.', ARRAY['Action', 'Comedy', 'Sci-Fi'], 0, 0, 127, '2024-07-26', false);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movies;