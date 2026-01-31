import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Movie } from './useMovies';
import { useDebounce } from './useDebounce';

export function useSearch(query: string) {
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchMovies = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
          .order('rating', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Search error:', error);
          setResults([]);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchMovies();
  }, [debouncedQuery]);

  return { results, isLoading };
}
