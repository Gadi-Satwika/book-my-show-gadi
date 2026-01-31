export interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  votes: string;
  genres: string[];
  language: string;
  releaseDate: string;
  duration: string;
  description?: string;
}
