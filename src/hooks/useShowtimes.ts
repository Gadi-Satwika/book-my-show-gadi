import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Theater {
  id: string;
  name: string;
  location: string;
  address: string | null;
  amenities: string[] | null;
}

export interface Showtime {
  id: string;
  movie_id: string;
  theater_id: string;
  show_date: string;
  show_time: string;
  available_seats: number;
  price: number;
  is_active: boolean;
  theater: Theater;
}

export interface TheaterWithShowtimes {
  theater: Theater;
  showtimes: Showtime[];
}

export const useShowtimes = (movieId: string | null) => {
  const [theatersWithShowtimes, setTheatersWithShowtimes] = useState<TheaterWithShowtimes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setTheatersWithShowtimes([]);
      return;
    }

    const fetchShowtimes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch showtimes with theater details for the selected movie
        const { data, error: fetchError } = await supabase
          .from('showtimes')
          .select(`
            id,
            movie_id,
            theater_id,
            show_date,
            show_time,
            available_seats,
            price,
            is_active,
            theaters (
              id,
              name,
              location,
              address,
              amenities
            )
          `)
          .eq('movie_id', movieId)
          .eq('is_active', true)
          .gte('show_date', new Date().toISOString().split('T')[0])
          .order('show_time', { ascending: true });

        if (fetchError) throw fetchError;

        // Group showtimes by theater
        const theaterMap = new Map<string, TheaterWithShowtimes>();

        data?.forEach((showtime: any) => {
          const theater = showtime.theaters as Theater;
          const showtimeData: Showtime = {
            id: showtime.id,
            movie_id: showtime.movie_id,
            theater_id: showtime.theater_id,
            show_date: showtime.show_date,
            show_time: showtime.show_time,
            available_seats: showtime.available_seats,
            price: showtime.price,
            is_active: showtime.is_active,
            theater,
          };

          if (theaterMap.has(theater.id)) {
            theaterMap.get(theater.id)!.showtimes.push(showtimeData);
          } else {
            theaterMap.set(theater.id, {
              theater,
              showtimes: [showtimeData],
            });
          }
        });

        setTheatersWithShowtimes(Array.from(theaterMap.values()));
      } catch (err: any) {
        console.error('Error fetching showtimes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`showtimes-${movieId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'showtimes',
          filter: `movie_id=eq.${movieId}`,
        },
        () => {
          fetchShowtimes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [movieId]);

  return { theatersWithShowtimes, loading, error };
};
