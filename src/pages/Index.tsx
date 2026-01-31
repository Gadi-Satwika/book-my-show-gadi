import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieSection from "@/components/MovieSection";
import Footer from "@/components/Footer";
import { featuredMovie, nowShowingMovies, upcomingMovies } from "@/data/movies";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection movie={featuredMovie} />

        {/* Movie Sections */}
        <div className="container mx-auto px-4">
          <MovieSection
            title="🎬 Now Showing"
            movies={nowShowingMovies}
            viewAllLink="/movies/now-showing"
          />

          <MovieSection
            title="🎥 Coming Soon"
            movies={upcomingMovies}
            viewAllLink="/movies/upcoming"
          />

          {/* Recommended Section - Using same movies for demo */}
          <MovieSection
            title="⭐ Recommended For You"
            movies={[...nowShowingMovies].reverse()}
            viewAllLink="/movies/recommended"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
