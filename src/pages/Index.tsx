import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieSection from "@/components/MovieSection";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import { useMovies, Movie } from "@/hooks/useMovies";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { nowShowingMovies, upcomingMovies, featuredMovie, loading, error } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedMovie(null);
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
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection movie={featuredMovie} onBookClick={handleBookClick} />

        {/* Movie Sections */}
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="py-8 space-y-8">
              <div>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="w-[200px] h-[300px] rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {nowShowingMovies.length > 0 && (
                <MovieSection
                  title="🎬 Now Showing"
                  movies={nowShowingMovies}
                  viewAllLink="/movies/now-showing"
                  onBookClick={handleBookClick}
                />
              )}

              {upcomingMovies.length > 0 && (
                <MovieSection
                  title="🎥 Coming Soon"
                  movies={upcomingMovies}
                  viewAllLink="/movies/upcoming"
                  onBookClick={handleBookClick}
                />
              )}

              {nowShowingMovies.length > 0 && (
                <MovieSection
                  title="⭐ Recommended For You"
                  movies={[...nowShowingMovies].reverse()}
                  viewAllLink="/movies/recommended"
                  onBookClick={handleBookClick}
                />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        movie={selectedMovie}
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />
    </div>
  );
};

export default Index;
