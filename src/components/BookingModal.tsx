import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, CreditCard, Loader2, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useShowtimes, Showtime, TheaterWithShowtimes } from '@/hooks/useShowtimes';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type Movie = Tables<'movies'>;

interface BookingModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEATS_PER_ROW = 8;

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const BookingModal = ({ movie, isOpen, onClose }: BookingModalProps) => {
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<'theater' | 'seats' | 'payment' | 'success'>('theater');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { createBooking, processPayment } = useBookings();
  const { theatersWithShowtimes, loading: showtimesLoading } = useShowtimes(movie?.id || null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset state when modal opens with a new movie
  useEffect(() => {
    if (isOpen && movie) {
      setStep('theater');
      setSelectedShowtime(null);
      setSelectedSeats([]);
    }
  }, [isOpen, movie?.id]);

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setStep('seats');
  };

  const toggleSeat = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleProceedToPayment = () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to book tickets.',
        variant: 'destructive',
      });
      onClose();
      navigate('/auth');
      return;
    }

    if (selectedSeats.length === 0) {
      toast({
        title: 'No seats selected',
        description: 'Please select at least one seat.',
        variant: 'destructive',
      });
      return;
    }

    setStep('payment');
  };

  const handlePayment = async () => {
    if (!movie || !selectedShowtime) return;

    setIsProcessing(true);

    // Create booking with the showtime date and time
    const showTimeDate = new Date(`${selectedShowtime.show_date}T${selectedShowtime.show_time}`);

    const totalPrice = selectedSeats.length * selectedShowtime.price;

    const booking = await createBooking(
      movie.id,
      selectedSeats,
      showTimeDate.toISOString(),
      totalPrice
    );

    if (booking) {
      // Process mock payment
      const success = await processPayment(booking.id);
      
      if (success) {
        setStep('success');
        
        // Alert notification (mock email)
        window.alert(
          `🎬 Booking Confirmed!\n\nMovie: ${movie.title}\nTheater: ${selectedShowtime.theater.name}\nLocation: ${selectedShowtime.theater.location}\nTime: ${formatTime(selectedShowtime.show_time)}\nSeats: ${selectedSeats.join(', ')}\nTotal: $${totalPrice.toFixed(2)}\n\nA confirmation email has been sent to your inbox.`
        );
      }
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('theater');
    setSelectedShowtime(null);
    setSelectedSeats([]);
    onClose();
  };

  if (!movie) return null;

  const totalPrice = selectedShowtime ? selectedSeats.length * selectedShowtime.price : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={movie.poster_url || '/placeholder.svg'}
              alt={movie.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div>
              <h3 className="text-lg font-bold">{movie.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {movie.rating && movie.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-rating text-rating" />
                    {movie.rating}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {movie.duration}m
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === 'theater' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Theaters Showing {movie.title}
            </h2>

            {showtimesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : theatersWithShowtimes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No showtimes available for this movie.</p>
                <p className="text-sm text-muted-foreground mt-2">Please check back later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {theatersWithShowtimes.map(({ theater, showtimes }) => (
                  <div
                    key={theater.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{theater.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {theater.location}
                        </p>
                        {theater.address && (
                          <p className="text-xs text-muted-foreground mt-1">{theater.address}</p>
                        )}
                      </div>
                      {theater.amenities && theater.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-[180px] justify-end">
                          {theater.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Today's Showtimes</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {showtimes.map((showtime) => (
                        <Button
                          key={showtime.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowtimeSelect(showtime)}
                          className="hover:bg-primary hover:text-primary-foreground group"
                        >
                          <span>{formatTime(showtime.show_time)}</span>
                          <span className="ml-2 text-xs text-muted-foreground group-hover:text-primary-foreground/80">
                            ${showtime.price}
                          </span>
                          <ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'seats' && selectedShowtime && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{selectedShowtime.theater.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedShowtime.theater.location} • {formatTime(selectedShowtime.show_time)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('theater')}>
                Change
              </Button>
            </div>

            {/* Screen indicator */}
            <div className="text-center">
              <div className="w-3/4 mx-auto h-2 bg-primary/30 rounded-t-full mb-4" />
              <span className="text-xs text-muted-foreground">SCREEN</span>
            </div>

            {/* Seat grid */}
            <div className="space-y-2">
              {SEAT_ROWS.map((row) => (
                <div key={row} className="flex items-center gap-2 justify-center">
                  <span className="w-6 text-sm text-muted-foreground">{row}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-t bg-muted" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-t bg-primary" />
                <span className="text-muted-foreground">Selected</span>
              </div>
            </div>

            {/* Summary */}
            {selectedSeats.length > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Seats: {selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total ({selectedSeats.length} tickets @ ${selectedShowtime.price})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0}
            >
              Proceed to Payment
            </Button>
          </div>
        )}

        {step === 'payment' && selectedShowtime && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-semibold">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span>{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span>{selectedShowtime.theater.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{selectedShowtime.theater.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{formatTime(selectedShowtime.show_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span>{selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">Mock Payment</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This is a simulated payment. Click "Pay Now" to complete your booking.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('seats')}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${totalPrice.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && selectedShowtime && (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">Booking Confirmed!</h3>
              <p className="text-muted-foreground mt-2">
                Your tickets have been booked successfully.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-left space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Movie</span>
                <span>{movie.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Theater</span>
                <span>{selectedShowtime.theater.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{formatTime(selectedShowtime.show_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span>{selectedSeats.join(', ')}</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
