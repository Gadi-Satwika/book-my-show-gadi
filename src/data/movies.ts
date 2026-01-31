import { Movie } from "@/types/movie";

export const featuredMovie: Movie = {
  id: 1,
  title: "Dune: Part Two",
  poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=1920&q=80",
  rating: 8.8,
  votes: "245.5K",
  genres: ["Action", "Adventure", "Sci-Fi"],
  language: "English",
  releaseDate: "March 1, 2024",
  duration: "2h 46m",
  description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
};

export const nowShowingMovies: Movie[] = [
  {
    id: 2,
    title: "Oppenheimer",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80",
    rating: 8.9,
    votes: "892K",
    genres: ["Biography", "Drama", "History"],
    language: "English",
    releaseDate: "July 21, 2023",
    duration: "3h 0m"
  },
  {
    id: 3,
    title: "The Batman",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80",
    rating: 8.1,
    votes: "756K",
    genres: ["Action", "Crime", "Drama"],
    language: "English",
    releaseDate: "March 4, 2022",
    duration: "2h 56m"
  },
  {
    id: 4,
    title: "Avatar: The Way of Water",
    poster: "https://images.unsplash.com/photo-1579566346927-c68383817a25?w=500&q=80",
    rating: 7.8,
    votes: "654K",
    genres: ["Action", "Adventure", "Fantasy"],
    language: "English",
    releaseDate: "December 16, 2022",
    duration: "3h 12m"
  },
  {
    id: 5,
    title: "John Wick 4",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    rating: 8.2,
    votes: "432K",
    genres: ["Action", "Crime", "Thriller"],
    language: "English",
    releaseDate: "March 24, 2023",
    duration: "2h 49m"
  },
  {
    id: 6,
    title: "Spider-Man: Across the Spider-Verse",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80",
    rating: 8.7,
    votes: "567K",
    genres: ["Animation", "Action", "Adventure"],
    language: "English",
    releaseDate: "June 2, 2023",
    duration: "2h 20m"
  },
  {
    id: 7,
    title: "Guardians of the Galaxy Vol. 3",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
    rating: 8.0,
    votes: "389K",
    genres: ["Action", "Adventure", "Comedy"],
    language: "English",
    releaseDate: "May 5, 2023",
    duration: "2h 30m"
  }
];

export const upcomingMovies: Movie[] = [
  {
    id: 8,
    title: "Deadpool 3",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&q=80",
    rating: 0,
    votes: "Coming Soon",
    genres: ["Action", "Comedy", "Sci-Fi"],
    language: "English",
    releaseDate: "July 26, 2024",
    duration: "TBA"
  },
  {
    id: 9,
    title: "Furiosa",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&q=80",
    rating: 0,
    votes: "Coming Soon",
    genres: ["Action", "Adventure", "Sci-Fi"],
    language: "English",
    releaseDate: "May 24, 2024",
    duration: "TBA"
  },
  {
    id: 10,
    title: "Kingdom of the Planet of the Apes",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80",
    rating: 0,
    votes: "Coming Soon",
    genres: ["Action", "Adventure", "Drama"],
    language: "English",
    releaseDate: "May 10, 2024",
    duration: "TBA"
  },
  {
    id: 11,
    title: "The Fall Guy",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
    rating: 0,
    votes: "Coming Soon",
    genres: ["Action", "Comedy"],
    language: "English",
    releaseDate: "May 3, 2024",
    duration: "TBA"
  },
  {
    id: 12,
    title: "Godzilla x Kong",
    poster: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=500&q=80",
    rating: 0,
    votes: "Coming Soon",
    genres: ["Action", "Sci-Fi", "Thriller"],
    language: "English",
    releaseDate: "March 29, 2024",
    duration: "TBA"
  }
];
