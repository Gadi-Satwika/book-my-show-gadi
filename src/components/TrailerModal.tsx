import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string | null;
  movieTitle: string;
}

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }: TrailerModalProps) => {
  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    
    // If it's already an embed URL or other video URL, return as is
    if (url.includes('embed') || url.includes('vimeo')) {
      return url;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{movieTitle} - Trailer</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="aspect-video w-full">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movieTitle} Trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Trailer not available</p>
                <p className="text-sm text-muted-foreground">
                  The trailer for this movie hasn't been added yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;
