import { useState, useEffect, useMemo } from 'react';
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

export const useShowtimes = (movieId: string | null, selectedDate?: string | null, location?: string) => {
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setAllShowtimes([]);
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
          .order('show_date', { ascending: true })
          .order('show_time', { ascending: true });

        if (fetchError) throw fetchError;

        let showtimes: Showtime[] = data?.map((showtime: any) => ({
          id: showtime.id,
          movie_id: showtime.movie_id,
          theater_id: showtime.theater_id,
          show_date: showtime.show_date,
          show_time: showtime.show_time,
          available_seats: showtime.available_seats,
          price: showtime.price,
          is_active: showtime.is_active,
          theater: showtime.theaters as Theater,
        })) || [];

        // Filter by location if provided
        if (location) {
          showtimes = showtimes.filter(
            (showtime) => showtime.theater?.location?.toLowerCase().includes(location.toLowerCase())
          );
        }

        setAllShowtimes(showtimes);
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
  }, [movieId, location]);

  // Get unique available dates
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    allShowtimes.forEach((showtime) => {
      dates.add(showtime.show_date);
    });
    return Array.from(dates).sort();
  }, [allShowtimes]);

  // Filter showtimes by selected date and group by theater
  const theatersWithShowtimes = useMemo(() => {
    const dateToFilter = selectedDate || availableDates[0] || null;
    if (!dateToFilter) return [];

    const filteredShowtimes = allShowtimes.filter(
      (showtime) => showtime.show_date === dateToFilter
    );

    // Group by theater
    const theaterMap = new Map<string, TheaterWithShowtimes>();

    filteredShowtimes.forEach((showtime) => {
      if (theaterMap.has(showtime.theater.id)) {
        theaterMap.get(showtime.theater.id)!.showtimes.push(showtime);
      } else {
        theaterMap.set(showtime.theater.id, {
          theater: showtime.theater,
          showtimes: [showtime],
        });
      }
    });

    return Array.from(theaterMap.values());
  }, [allShowtimes, selectedDate, availableDates]);

  return { theatersWithShowtimes, availableDates, loading, error };
};
