import { Star, Clock, MapPin } from "lucide-react";
import { Movie } from "@/hooks/useMovies";
import { Badge } from "@/components/ui/badge";

interface SearchResultsProps {
  results: Movie[];
  isLoading: boolean;
  searchQuery: string;
  onMovieClick: (movie: Movie) => void;
  onClose: () => void;
}

const SearchResults = ({ results, isLoading, searchQuery, onMovieClick, onClose }: SearchResultsProps) => {
  if (!searchQuery) return null;

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="py-2">
          <p className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wide">
            {results.length} Result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
          {results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => {
                onMovieClick(movie);
                onClose();
              }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
            >
              {/* Thumbnail */}
              <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                <img
                  src={movie.poster_url || '/placeholder.svg'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{movie.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {movie.rating && movie.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-rating text-rating" />
                      {movie.rating}
                    </span>
                  )}
                  {movie.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(movie.duration)}
                    </span>
                  )}
                </div>
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {movie.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs py-0">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
