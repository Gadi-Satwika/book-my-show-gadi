import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import BookingModal from "@/components/BookingModal";
import { useMovies, Movie } from "@/hooks/useMovies";
import { useLocation } from "@/contexts/LocationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

const AllMovies = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category") || "Movies";
  const section = searchParams.get("section") || "now-showing";
  
  const [activeCategory, setActiveCategory] = useState(category);
  const { selectedLocation } = useLocation();
  const { movies, loading, error } = useMovies(activeCategory, selectedLocation);
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Extract all unique genres from movies
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((movie) => {
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((genre) => genreSet.add(genre));
      }
    });
    return Array.from(genreSet).sort();
  }, [movies]);

  // Filter movies based on section and genre
  const filteredMovies = useMemo(() => {
    let filtered = movies;

    // Filter by section
    if (section === "now-showing") {
      filtered = filtered.filter((m) => m.is_available && (m.rating ?? 0) > 0);
    } else if (section === "upcoming") {
      filtered = filtered.filter((m) => !m.is_available || (m.rating ?? 0) === 0);
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(
        (m) => m.genres && m.genres.includes(selectedGenre)
      );
    }

    return filtered;
  }, [movies, section, selectedGenre]);

  const handleBookClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedMovie(null);
  };

  const getSectionTitle = () => {
    const categoryEmoji = {
      Movies: "🎬",
      Stream: "📺",
      Events: "🎉",
      Plays: "🎭",
      Sports: "⚽",
      Activities: "🎯",
    }[activeCategory] || "🎬";

    const sectionName = {
      "now-showing": "Now Showing",
      upcoming: "Coming Soon",
      recommended: "Recommended For You",
    }[section] || "All";

    return `${categoryEmoji} ${sectionName}${selectedLocation ? ` in ${selectedLocation}` : ""}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">Failed to load movies</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onMovieClick={handleBookClick}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{getSectionTitle()}</h1>
        </div>

        {/* Genre Filter */}
        {allGenres.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Filter by Genre
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedGenre && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGenre(null)}
                  className="gap-1 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                  Clear Filter
                </Button>
              )}
              {allGenres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedGenre(selectedGenre === genre ? null : genre)
                  }
                  className={
                    selectedGenre === genre
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onBookClick={handleBookClick}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-xl text-muted-foreground">
              No {activeCategory.toLowerCase()} found
              {selectedGenre ? ` in "${selectedGenre}" genre` : ""}
              {selectedLocation ? ` in ${selectedLocation}` : ""}.
            </p>
            {selectedGenre && (
              <Button
                variant="outline"
                onClick={() => setSelectedGenre(null)}
                className="mt-4"
              >
                Clear Genre Filter
              </Button>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && filteredMovies.length > 0 && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Showing {filteredMovies.length}{" "}
            {filteredMovies.length === 1 ? "result" : "results"}
            {selectedGenre ? ` in "${selectedGenre}"` : ""}
          </p>
        )}
      </main>

      <Footer />

      <BookingModal
        movie={selectedMovie}
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />
    </div>
  );
};

export default AllMovies;
