import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const BookingContext = createContext();
<<<<<<< HEAD

// Backend API Base URL
const API_BASE = "http://localhost:5001/api/appointments";

export const useBooking = () => useContext(BookingContext);

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
      // Ensure data is an array
      const bookingsArray = Array.isArray(data) ? data : (data.data || []);
      setBookings(bookingsArray.map(normalizeBooking));
    } catch (err) {
      console.error("Fetch Error:", err);
      // We don't want to show error toast every time if it's just a sync issue, 
      // but for "fix the error" we should be aware.
    } finally {
      setLoading(false);
    }
  };
=======
const API_URL = "http://localhost:5001/api";

export const useBooking = () => useContext(BookingContext);

// Backend API Base URL
const API_BASE = "http://localhost:5001/api/appointments";

export const BookingProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/bookings`);
            if (res.ok) {
                const json = await res.json();
                if(json.success) setBookings(json.data.map(b => ({ ...b, id: b._id || b.id })));
            }
        } catch(e) {
            console.error("Booking API Failed", e);
        }
    };
    fetchBookings();
  }, []);
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc

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

<<<<<<< HEAD
  const addBooking = async (bookingData) => {
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
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
=======
  const syncBookingUpdate = async (id, payload, successMsg, errorMsg) => {
      try {
          const res = await fetch(`${API_URL}/bookings/${id}`, {
              method: "PUT", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.success) {
              setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...payload } : b));
              if(successMsg) addToast(successMsg, "success");
          }
      } catch(e) {
           // Fallback
           setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...payload } : b));
           if(successMsg) addToast(`Offline: ${successMsg}`, "success");
      }
  };

  const addBooking = async (bookingData) => {
    const isDuplicate = bookings.some(
      (b) =>
        b.counsellor === bookingData.counsellor &&
        b.date === bookingData.date &&
        b.time === bookingData.time &&
        b.status !== "Cancelled"
    );
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc

  const syncBookingUpdate = async (id, payload, successMsg) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Server sync failed");

      const updated = await response.json();
      const normalized = normalizeBooking(updated);
      setBookings((prev) => prev.map((b) => (b.id === id ? normalized : b)));
      if (successMsg) addToast(successMsg, "success");
      return normalized;
    } catch (err) {
      addToast(err.message, "error");
      throw err;
    }
  };

  const confirmPayment = async (bookingId) => {
    await syncBookingUpdate(bookingId, { status: "Confirmed", paymentStatus: "Paid" }, "Payment Successful! Booking Confirmed.");
  };

  const cancelBooking = async (bookingId) => {
    const b = bookings.find(x => x.id === bookingId);
    if (!b) return;
    const isRefundable = checkIsRefundable(b.date, b.time);
<<<<<<< HEAD

    await syncBookingUpdate(bookingId, { 
      status: "Cancelled", 
      paymentStatus: isRefundable ? "Refunded" : b.paymentStatus 
    }, isRefundable ? "✅ Refund processed. Session cancelled." : "❌ No refund (< 2hrs). Session cancelled.");
=======
    
    syncBookingUpdate(bookingId, { 
        status: "Cancelled", 
        paymentStatus: isRefundable ? "Refunded" : b.paymentStatus,
        refundStatus: isRefundable ? "Eligible" : "Not Eligible"
    }, isRefundable ? "âœ… Refund will be processed. Cancelled successfully." : "âŒ Refund not eligible (< 2hrs). Cancelled successfully.");
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
  };

  const rescheduleBooking = async (bookingId, newDate, newTime) => {
    await syncBookingUpdate(bookingId, { date: newDate, time: newTime }, "Appointment Rescheduled Successfully!");
  };

  // Counsellor Management functions
  const acceptBooking = (bookingId) => syncBookingUpdate(bookingId, { status: "Accepted" }, "Booking Accepted!");
  const rejectBooking = (bookingId, reason) => syncBookingUpdate(bookingId, { status: "Rejected", rejectReason: reason }, "Booking Rejected.");
  const completeBooking = (bookingId) => syncBookingUpdate(bookingId, { status: "Completed" }, "Session marked as Completed.");
  const confirmBookingByCounsellor = (bookingId) => syncBookingUpdate(bookingId, { status: "Confirmed" }, "Booking Confirmed!");
  const cancelBookingByCounsellor = (bookingId, reason) => syncBookingUpdate(bookingId, { status: "Cancelled", rejectReason: reason }, "Booking Cancelled.");
  const addSessionNotes = (bookingId, notes) => syncBookingUpdate(bookingId, { notes }, "Session notes saved.");

<<<<<<< HEAD
  // Helper functions
  const checkIsRefundable = (dateStr, timeStr) => {
    const appointmentDate = parseDateTime(dateStr, timeStr);
    if (!appointmentDate) return false;
    const now = new Date();
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);
=======
  const checkIsRefundable = (dateStr, timeStr) => {
    const appointmentDate = parseDateTime(dateStr, timeStr);
    if (!appointmentDate) return false;
    const diffHours = (appointmentDate - new Date()) / (1000 * 60 * 60);
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
    return diffHours >= 2;
  };

  const checkIsFutureTime = (dateStr, timeStr) => {
     const requestedDate = parseDateTime(dateStr, timeStr);
     return requestedDate && requestedDate > new Date();
  }

  const parseDateTime = (dateStr, timeStr) => {
<<<<<<< HEAD
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
=======
    if (!timeStr) return null; // safety
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
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
    }
    return null;
  }

  return (
<<<<<<< HEAD
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
        fetchBookings,
        acceptBooking,
        rejectBooking,
        completeBooking,
        confirmBookingByCounsellor,
        cancelBookingByCounsellor,
        addSessionNotes
      }}
    >
=======
    <BookingContext.Provider value={{
        bookings, addBooking, confirmPayment, cancelBooking, rescheduleBooking,
        getAvailableSlots, checkIsRefundable, acceptBooking, rejectBooking,
        confirmBookingByCounsellor, cancelBookingByCounsellor, completeBooking, addSessionNotes
    }}>
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
      {children}
    </BookingContext.Provider>
  );
};
