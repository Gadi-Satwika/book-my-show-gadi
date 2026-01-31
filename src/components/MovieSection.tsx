import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "./MovieCard";
import { Movie } from "@/types/movie";
import { useRef } from "react";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
}

const MovieSection = ({ title, movies, viewAllLink }: MovieSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {viewAllLink && (
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 gap-1 p-0"
          >
            See All
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Movies Carousel */}
      <div className="relative group/section">
        {/* Scroll Buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:flex bg-background/90 backdrop-blur-sm hover:bg-background"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:flex bg-background/90 backdrop-blur-sm hover:bg-background"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Movies Grid */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-[160px] md:w-[200px]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieSection;
