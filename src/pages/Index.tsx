import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieSection from "@/components/MovieSection";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import LocationModal from "@/components/LocationModal";
import TrailerModal from "@/components/TrailerModal";
import { useMovies, Movie } from "@/hooks/useMovies";
import { useLocation } from "@/contexts/LocationContext";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("Movies");
  const { selectedLocation } = useLocation();
  const { nowShowingMovies, upcomingMovies, featuredMovie, loading, error } = useMovies(activeCategory, selectedLocation);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const handleBookClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedMovie(null);
  };

  const handleWatchTrailer = (movie: Movie) => {
    setTrailerMovie(movie);
    setIsTrailerOpen(true);
  };

  const handleCloseTrailer = () => {
    setIsTrailerOpen(false);
    setTrailerMovie(null);
  };

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'Movies': return '🎬';
      case 'Stream': return '📺';
      case 'Events': return '🎉';
      case 'Plays': return '🎭';
      case 'Sports': return '⚽';
      case 'Activities': return '🎯';
      default: return '🎬';
    }
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
      <LocationModal />
      
      <main>
        {/* Hero Section */}
        <HeroSection 
          movie={featuredMovie} 
          onBookClick={handleBookClick} 
          onWatchTrailer={handleWatchTrailer}
        />

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
                  title={`${getCategoryTitle()} Now Showing${selectedLocation ? ` in ${selectedLocation}` : ''}`}
                  movies={nowShowingMovies}
                  viewAllLink={`/${activeCategory.toLowerCase()}/now-showing`}
                  onBookClick={handleBookClick}
                />
              )}

              {upcomingMovies.length > 0 && (
                <MovieSection
                  title={`${getCategoryTitle()} Coming Soon`}
                  movies={upcomingMovies}
                  viewAllLink={`/${activeCategory.toLowerCase()}/upcoming`}
                  onBookClick={handleBookClick}
                />
              )}

              {nowShowingMovies.length > 0 && (
                <MovieSection
                  title="⭐ Recommended For You"
                  movies={[...nowShowingMovies].reverse()}
                  viewAllLink={`/${activeCategory.toLowerCase()}/recommended`}
                  onBookClick={handleBookClick}
                />
              )}

              {nowShowingMovies.length === 0 && upcomingMovies.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-xl text-muted-foreground">
                    No {activeCategory.toLowerCase()} available{selectedLocation ? ` in ${selectedLocation}` : ''} right now.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Check back later for updates!
                  </p>
                </div>
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

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={handleCloseTrailer}
        trailerUrl={trailerMovie?.trailer_url || null}
        movieTitle={trailerMovie?.title || ''}
      />
    </div>
  );
};

export default Index;
