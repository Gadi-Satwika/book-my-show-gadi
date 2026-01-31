import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="group cursor-pointer animate-fade-in">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 card-shadow transition-all duration-300 group-hover:elevated-shadow group-hover:scale-[1.02]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <Star className="h-3 w-3 fill-rating text-rating" />
            <span className="text-sm font-semibold">{movie.rating}</span>
          </div>
        )}

        {/* Coming Soon Badge */}
        {movie.rating === 0 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground border-none">
              Coming Soon
            </Badge>
          </div>
        )}

        {/* Book Button - Visible on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors">
            {movie.rating > 0 ? "Book Tickets" : "Notify Me"}
          </button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {movie.genres.join(" • ")}
        </p>
        {movie.rating > 0 && (
          <p className="text-xs text-muted-foreground">
            {movie.votes} votes
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
