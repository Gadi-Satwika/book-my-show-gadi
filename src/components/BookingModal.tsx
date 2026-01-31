import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, CreditCard, Loader2, MapPin, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useShowtimes, Showtime, TheaterWithShowtimes } from '@/hooks/useShowtimes';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Movie = Tables<'movies'>;

interface BookingModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;

// Generate mock booked seats (simulating seats already taken)
const generateBookedSeats = (showtimeId: string): Set<string> => {
  const bookedSeats = new Set<string>();
  // Use showtime ID to create deterministic "random" booked seats
  const seed = showtimeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  SEAT_ROWS.forEach((row, rowIndex) => {
    for (let i = 1; i <= SEATS_PER_ROW; i++) {
      // Create a pseudo-random pattern based on seat position and showtime
      const seatValue = (seed + rowIndex * 10 + i) % 7;
      if (seatValue === 0 || seatValue === 3) {
        bookedSeats.add(`${row}${i}`);
      }
    }
  });
  
  return bookedSeats;
};

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
  const [ticketCount, setTicketCount] = useState<number>(2);
  const [step, setStep] = useState<'theater' | 'tickets' | 'seats' | 'payment' | 'success'>('theater');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { createBooking, processPayment } = useBookings();
  const { theatersWithShowtimes, loading: showtimesLoading } = useShowtimes(movie?.id || null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Memoize booked seats based on selected showtime
  const bookedSeats = useMemo(() => {
    if (!selectedShowtime) return new Set<string>();
    return generateBookedSeats(selectedShowtime.id);
  }, [selectedShowtime?.id]);

  // Reset state when modal opens with a new movie
  useEffect(() => {
    if (isOpen && movie) {
      setStep('theater');
      setSelectedShowtime(null);
      setSelectedSeats([]);
      setTicketCount(2);
    }
  }, [isOpen, movie?.id]);

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setStep('tickets');
  };

  const handleTicketCountConfirm = () => {
    setStep('seats');
  };

  const toggleSeat = (seat: string) => {
    if (bookedSeats.has(seat)) return; // Can't select booked seats
    
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      // Only allow selecting up to ticketCount seats
      if (prev.length >= ticketCount) {
        toast({
          title: 'Seat limit reached',
          description: `You can only select ${ticketCount} seat${ticketCount > 1 ? 's' : ''}.`,
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, seat];
    });
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

        {step === 'tickets' && selectedShowtime && (
          <div className="space-y-6">
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

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">How many tickets?</h3>
              </div>
              
              <Select 
                value={ticketCount.toString()} 
                onValueChange={(val) => setTicketCount(parseInt(val))}
              >
                <SelectTrigger className="w-32 mx-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Ticket' : 'Tickets'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground">
                Total: ${(ticketCount * selectedShowtime.price).toFixed(2)}
              </p>
            </div>

            <Button className="w-full" onClick={handleTicketCountConfirm}>
              Select Seats
            </Button>
          </div>
        )}

        {step === 'seats' && selectedShowtime && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{selectedShowtime.theater.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedShowtime.theater.location} • {formatTime(selectedShowtime.show_time)} • {ticketCount} ticket{ticketCount > 1 ? 's' : ''}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('tickets')}>
                Change
              </Button>
            </div>

            {/* Screen indicator */}
            <div className="text-center">
              <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-t-full mb-4" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Screen</span>
            </div>

            {/* Seat grid */}
            <div className="space-y-2 py-4">
              {SEAT_ROWS.map((row) => (
                <div key={row} className="flex items-center gap-2 justify-center">
                  <span className="w-6 text-sm font-medium text-muted-foreground">{row}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isBooked = bookedSeats.has(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      
                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          disabled={isBooked}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg text-xs font-medium transition-all duration-200 ${
                            isBooked
                              ? 'bg-muted-foreground/40 text-muted-foreground/60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                              : 'border-2 border-green-500 text-green-500 hover:bg-green-500/10 hover:scale-105'
                          }`}
                          title={isBooked ? 'Seat unavailable' : `Seat ${seatId}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-6 text-sm font-medium text-muted-foreground">{row}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm border-t border-b py-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t border-2 border-green-500" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t bg-primary" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t bg-muted-foreground/40" />
                <span className="text-muted-foreground">Filled</span>
              </div>
            </div>

            {/* Selection status */}
            <div className="text-center py-2">
              <p className="text-sm">
                {selectedSeats.length === 0 ? (
                  <span className="text-muted-foreground">Select {ticketCount} seat{ticketCount > 1 ? 's' : ''}</span>
                ) : selectedSeats.length < ticketCount ? (
                  <span className="text-amber-500">
                    Select {ticketCount - selectedSeats.length} more seat{ticketCount - selectedSeats.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-green-500 font-medium">All seats selected ✓</span>
                )}
              </p>
            </div>

            {/* Summary */}
            {selectedSeats.length > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Selected Seats:</span>
                  <span className="font-medium">{selectedSeats.sort().join(', ')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total ({selectedSeats.length} × ${selectedShowtime.price})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length !== ticketCount}
            >
              {selectedSeats.length !== ticketCount 
                ? `Select ${ticketCount} Seat${ticketCount > 1 ? 's' : ''} to Continue`
                : 'Proceed to Payment'
              }
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
