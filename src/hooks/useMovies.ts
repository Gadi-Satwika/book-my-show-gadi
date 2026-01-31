import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Movie = Tables<'movies'> & {
  trailer_url?: string | null;
  category?: string | null;
};

export function useMovies(category?: string, location?: string) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('movies-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movies' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMovies((prev) => [...prev, payload.new as Movie]);
          } else if (payload.eventType === 'UPDATE') {
            setMovies((prev) =>
              prev.map((movie) =>
                movie.id === (payload.new as Movie).id ? (payload.new as Movie) : movie
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMovies((prev) =>
              prev.filter((movie) => movie.id !== (payload.old as Movie).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, location]);

  const fetchMovies = async () => {
    setLoading(true);
    
    let query = supabase
      .from('movies')
      .select('*')
      .order('rating', { ascending: false });

    // Filter by category if provided
    if (category && category !== 'Movies') {
      query = query.eq('category', category.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setMovies((data as Movie[]) || []);
    }
    setLoading(false);
  };

  const nowShowingMovies = movies.filter((m) => m.is_available && (m.rating ?? 0) > 0);
  const upcomingMovies = movies.filter((m) => !m.is_available || (m.rating ?? 0) === 0);
  const featuredMovie = nowShowingMovies[0] || null;

  return {
    movies,
    nowShowingMovies,
    upcomingMovies,
    featuredMovie,
    loading,
    error,
    refetch: fetchMovies,
  };
}
