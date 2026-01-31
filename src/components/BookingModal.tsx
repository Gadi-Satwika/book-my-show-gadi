import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Movie = Tables<'movies'>;

interface BookingModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const SHOW_TIMES = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEATS_PER_ROW = 8;
const SEAT_PRICE = 12.99;

const BookingModal = ({ movie, isOpen, onClose }: BookingModalProps) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<'time' | 'seats' | 'payment' | 'success'>('time');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { createBooking, processPayment } = useBookings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
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
    if (!movie || !selectedTime) return;

    setIsProcessing(true);

    // Create booking
    const showTimeDate = new Date();
    const [hours, minutes] = selectedTime.replace(/ (AM|PM)/, '').split(':');
    const isPM = selectedTime.includes('PM') && hours !== '12';
    const isAM = selectedTime.includes('AM') && hours === '12';
    showTimeDate.setHours(
      isPM ? parseInt(hours) + 12 : isAM ? 0 : parseInt(hours),
      parseInt(minutes)
    );

    const booking = await createBooking(
      movie.id,
      selectedSeats,
      showTimeDate.toISOString(),
      selectedSeats.length * SEAT_PRICE
    );

    if (booking) {
      // Process mock payment
      const success = await processPayment(booking.id);
      
      if (success) {
        setStep('success');
        
        // Alert notification (mock email)
        window.alert(
          `🎬 Booking Confirmed!\n\nMovie: ${movie.title}\nTime: ${selectedTime}\nSeats: ${selectedSeats.join(', ')}\nTotal: $${(selectedSeats.length * SEAT_PRICE).toFixed(2)}\n\nA confirmation email has been sent to your inbox.`
        );
      }
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('time');
    setSelectedTime(null);
    setSelectedSeats([]);
    onClose();
  };

  if (!movie) return null;

  const totalPrice = selectedSeats.length * SEAT_PRICE;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                {movie.rating > 0 && (
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

        {step === 'time' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Today's Show Times</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SHOW_TIMES.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => handleTimeSelect(time)}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 'seats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Selected: {selectedTime}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setStep('time')}>
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
                  <span>Total ({selectedSeats.length} tickets)</span>
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

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-semibold">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span>{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{selectedTime}</span>
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

        {step === 'success' && (
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
                <span className="text-muted-foreground">Time</span>
                <span>{selectedTime}</span>
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
