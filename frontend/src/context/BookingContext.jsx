import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

// Backend API Base URL
const API_BASE = "http://localhost:5000/api/appointments";

export const BookingProvider = ({ children }) => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Data Normalization Helper
  const normalizeBooking = (b) => ({
    ...b,
    id: b._id || b.id,
    counsellor: b.counsellorName || b.counsellor // Maintain BC for UI components
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error("Failed to load records");
      const data = await response.json();
      setBookings(data.map(normalizeBooking));
    } catch (err) {
      console.error("Fetch Error:", err);
      addToast("Connection to server failed. Using offline data.", "warning");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic slot availability logic
  const getAvailableSlots = (counsellorName, date, allSlots) => {
    const bookedTimes = bookings
      .filter(b => (b.counsellorName === counsellorName || b.counsellor === counsellorName) && b.date === date && b.status !== "Cancelled")
      .map(b => b.time);
    
    return allSlots.map(time => {
      const isPast = !checkIsFutureTime(date, time);
      const isBooked = bookedTimes.includes(time);
      return {
        time,
        disabled: isPast || isBooked,
        reason: isBooked ? "Already booked" : (isPast ? "Time passed" : "")
      };
    });
  };

  const addBooking = async (bookingData) => {
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          counsellorName: bookingData.counsellor // Map frontend field to backend
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Booking failed");
      }

      const newBooking = await response.json();
      const normalized = normalizeBooking(newBooking);
      setBookings((prev) => [normalized, ...prev]);
      addToast("Session intake successfully recorded!", "success");
      return normalized.id;
    } catch (err) {
      addToast(err.message, "error");
      throw err;
    }
  };

  const confirmPayment = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE}/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Confirmed", paymentStatus: "Paid" })
      });

      if (!response.ok) throw new Error("Payment server sync failed");

      const updated = await response.json();
      const normalized = normalizeBooking(updated);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? normalized : b)));
      addToast("Payment Successful! Booking Confirmed.", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const b = bookings.find(x => x.id === bookingId);
      const isRefundable = checkIsRefundable(b.date, b.time);

      const response = await fetch(`${API_BASE}/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Cancelled", 
          paymentStatus: isRefundable ? "Refunded" : b.paymentStatus 
        })
      });

      if (!response.ok) throw new Error("Cancellation sync failed");

      const updated = await response.json();
      const normalized = normalizeBooking(updated);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? normalized : b)));
      
      if (isRefundable) {
        addToast("✅ Refund processed. Session cancelled.", "success");
      } else {
        addToast("❌ No refund (< 2hrs). Session cancelled.", "warning");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const rescheduleBooking = async (bookingId, newDate, newTime) => {
    try {
      const response = await fetch(`${API_BASE}/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, time: newTime })
      });

      if (!response.ok) throw new Error("Reschedule sync failed");

      const updated = await response.json();
      const normalized = normalizeBooking(updated);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? normalized : b)));
      addToast("Appointment Rescheduled Successfully!", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
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
     return requestedDate && requestedDate > new Date();
  }

  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    try {
      const match12 = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (match12) {
        let [_, hours, minutes, modifier] = match12;
        hours = parseInt(hours, 10);
        if (hours === 12) hours = modifier.toUpperCase() === "AM" ? 0 : 12;
        else if (modifier.toUpperCase() === "PM") hours += 12;
        return new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
      }
      const match24 = timeStr.match(/(\d+):(\d+)/);
      if (match24) {
        let [_, hours, minutes] = match24;
        return new Date(`${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        addBooking,
        confirmPayment,
        cancelBooking,
        rescheduleBooking,
        getAvailableSlots,
        checkIsRefundable,
        fetchBookings
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
