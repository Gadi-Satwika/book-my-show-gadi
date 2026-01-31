import { Play, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Movie } from "@/hooks/useMovies";

interface HeroSectionProps {
  movie: Movie | null;
  onBookClick: (movie: Movie) => void;
  onWatchTrailer: (movie: Movie) => void;
}

const HeroSection = ({ movie, onBookClick, onWatchTrailer }: HeroSectionProps) => {
  if (!movie) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading featured movie...</p>
      </section>
    );
  }

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={movie.poster_url || '/placeholder.svg'}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-genre text-foreground border-none"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            {movie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-rating text-rating" />
              <span className="font-semibold text-foreground">{movie.rating}</span>
              <span className="text-sm">({movie.votes?.toLocaleString()} votes)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(movie.duration || 0)}</span>
            </div>
            {movie.release_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(movie.release_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {movie.description && (
            <p className="text-muted-foreground mb-6 text-lg max-w-xl line-clamp-3">
              {movie.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => onBookClick(movie)}
            >
              <Play className="h-5 w-5 fill-current" />
              Book Tickets
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-foreground/30 hover:bg-foreground/10"
              onClick={() => onWatchTrailer(movie)}
            >
              Watch Trailer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
