import { Search, MapPin, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useSearch } from "@/hooks/useSearch";
import SearchResults from "./SearchResults";
import { Movie } from "@/hooks/useMovies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onMovieClick?: (movie: Movie) => void;
}

const CATEGORIES = ["Movies", "Stream", "Events", "Plays", "Sports", "Activities"];

const Header = ({ activeCategory = "Movies", onCategoryChange, onMovieClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut, loading } = useAuth();
  const { selectedLocation, setShowLocationModal } = useLocation();
  const { results, isLoading } = useSearch(searchQuery);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCategoryClick = (category: string) => {
    onCategoryChange?.(category);
  };

  const handleSearchClose = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleMovieClick = (movie: Movie) => {
    onMovieClick?.(movie);
    handleSearchClose();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gradient">
              BookMyShow
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports..."
                className="pl-10 bg-secondary border-none focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {isSearchFocused && (searchQuery || isLoading) && (
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onMovieClick={handleMovieClick}
                  onClose={handleSearchClose}
                />
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowLocationModal(true)}
            >
              <MapPin className="h-4 w-4" />
              <span>{selectedLocation || 'Select Location'}</span>
            </Button>
            
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate">
                        {profile?.name || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for Movies, Events..."
                className="pl-10 bg-secondary border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {isSearchFocused && (searchQuery || isLoading) && (
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onMovieClick={handleMovieClick}
                  onClose={handleSearchClose}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="justify-start gap-2"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowLocationModal(true);
                }}
              >
                <MapPin className="h-4 w-4" />
                <span>{selectedLocation || 'Select Location'}</span>
              </Button>
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {profile?.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-2 text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth');
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-border bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-12 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => handleCategoryClick(item)}
                className={`text-sm font-medium transition-colors whitespace-nowrap pb-1 border-b-2 ${
                  activeCategory === item
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground hover:text-primary border-transparent'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
