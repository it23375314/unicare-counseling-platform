import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("unicare_bookings");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Booking data corrupted:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("unicare_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Dynamic slot availability logic
  const getAvailableSlots = (counsellorName, date, allSlots) => {
    // 1. Find all active bookings for this doctor on this day
    const bookedTimes = bookings
      .filter(b => b.counsellor === counsellorName && b.date === date && b.status !== "Cancelled")
      .map(b => b.time);
    
    // 2. Map all slots against booked times to see what's open
    return allSlots.map(time => {
      // Basic check: has time already passed today?
      const isPast = !checkIsFutureTime(date, time);
      const isBooked = bookedTimes.includes(time);
      return {
        time,
        disabled: isPast || isBooked,
        reason: isBooked ? "Already booked" : (isPast ? "Time passed" : "")
      };
    });
  };

  const addBooking = (bookingData) => {
    const isDuplicate = bookings.some(
      (b) =>
        b.counsellor === bookingData.counsellor &&
        b.date === bookingData.date &&
        b.time === bookingData.time &&
        b.status !== "Cancelled"
    );

    if (isDuplicate) {
      throw new Error("This slot was just booked! Please select another time.");
    }

    const newBooking = {
      ...bookingData,
      id: Date.now().toString(),
      status: "Pending", // Default = Pending
      createdAt: new Date().toISOString()
    };
    
    setBookings((prev) => [...prev, newBooking]);
    return newBooking.id;
  };

  const confirmPayment = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "Confirmed", paymentStatus: "Paid" } : b
      )
    );
    addToast("Payment Successful! Booking Confirmed.", "success");
  };

  const cancelBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        
        // Calculate refund logic
        const isRefundable = checkIsRefundable(b.date, b.time);

        if (isRefundable) {
          addToast("✅ Refund will be processed. Cancelled successfully.", "success");
        } else {
          addToast("❌ Refund not eligible (< 2hrs). Cancelled successfully.", "warning");
        }

        return {
          ...b,
          status: "Cancelled",
          paymentStatus: isRefundable ? "Refunded" : b.paymentStatus,
          refundStatus: isRefundable ? "Eligible" : "Not Eligible"
        };
      })
    );
  };

  const rescheduleBooking = (bookingId, newDate, newTime) => {
    // Check duplicate
    const targetBooking = bookings.find(b => b.id === bookingId);
    
    const isDuplicate = bookings.some(
      (b) =>
        b.id !== bookingId &&
        b.counsellor === targetBooking.counsellor &&
        b.date === newDate &&
        b.time === newTime &&
        b.status !== "Cancelled"
    );

    if (isDuplicate) {
      throw new Error("That slot is already booked. Please choose another.");
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          date: newDate,
          time: newTime
        };
      })
    );
    addToast("Appointment Rescheduled Successfully!", "success");
  };

  const acceptBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Accepted" } : b))
    );
    addToast("Booking Accepted! Student will be notified.", "success");
  };

  const rejectBooking = (bookingId, reason) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Rejected", rejectReason: reason } : b))
    );
    addToast("Booking Rejected.", "warning");
  };

  const completeBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Completed" } : b))
    );
    addToast("Session marked as Completed.", "success");
  };

  const confirmBookingByCounsellor = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Confirmed" } : b))
    );
    addToast("Booking Confirmed! Student will be notified.", "success");
  };

  const cancelBookingByCounsellor = (bookingId, reason) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled", rejectReason: reason } : b))
    );
    addToast("Booking Cancelled.", "warning");
  };

  const addSessionNotes = (bookingId, notes) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, notes } : b))
    );
    addToast("Session notes saved.", "success");
  };

  // Helper function to check if booking is > 2 hours away
  const checkIsRefundable = (dateStr, timeStr) => {
    const appointmentDate = parseDateTime(dateStr, timeStr);
    if (!appointmentDate) return false;
    
    const now = new Date();
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);

    return diffHours >= 2;
  };

  const checkIsFutureTime = (dateStr, timeStr) => {
     const requestedDate = parseDateTime(dateStr, timeStr);
     if(!requestedDate) return false;
     return requestedDate > new Date();
  }

  const parseDateTime = (dateStr, timeStr) => {
    // Try 12-hour AM/PM format
    const match12 = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (match12) {
      let [_, hours, minutes, modifier] = match12;
      hours = parseInt(hours, 10);
      if (hours === 12) {
        hours = modifier.toUpperCase() === "AM" ? 0 : 12;
      } else if (modifier.toUpperCase() === "PM") {
        hours += 12;
      }
      return new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
    }

    // Try 24-hour format
    const match24 = timeStr.match(/(\d+):(\d+)/);
    if (match24) {
      let [_, hours, minutes] = match24;
      return new Date(`${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
    }

    return null;
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        confirmPayment,
        cancelBooking,
        rescheduleBooking,
        getAvailableSlots,
        checkIsRefundable,
        acceptBooking,
        rejectBooking,
        confirmBookingByCounsellor,
        cancelBookingByCounsellor,
        completeBooking,
        addSessionNotes
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
