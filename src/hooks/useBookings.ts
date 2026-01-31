import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type Booking = Tables<'bookings'>;

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();

      // Subscribe to real-time changes
      const channel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'bookings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBookings((prev) => [...prev, payload.new as Booking]);
            } else if (payload.eventType === 'UPDATE') {
              setBookings((prev) =>
                prev.map((booking) =>
                  booking.id === (payload.new as Booking).id ? (payload.new as Booking) : booking
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setBookings((prev) =>
                prev.filter((booking) => booking.id !== (payload.old as Booking).id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const createBooking = async (
    movieId: string,
    seats: string[],
    showTime: string,
    totalPrice: number
  ): Promise<Booking | null> => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to book tickets.',
        variant: 'destructive',
      });
      return null;
    }

    const bookingData: TablesInsert<'bookings'> = {
      user_id: user.id,
      movie_id: movieId,
      seats: seats,
      show_time: showTime,
      total_price: totalPrice,
      payment_status: 'pending',
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    return data;
  };

  // Mock payment function
  const processPayment = async (bookingId: string): Promise<boolean> => {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    // Mock email notification via toast
    toast({
      title: '📧 Confirmation Email Sent!',
      description: 'Your booking confirmation has been sent to your email address.',
    });

    return true;
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: 'Cancellation failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Booking cancelled',
      description: 'Your booking has been cancelled successfully.',
    });
    return true;
  };

  return {
    bookings,
    loading,
    createBooking,
    processPayment,
    cancelBooking,
    refetch: fetchBookings,
  };
}
