import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

const BookingContext = createContext();

// Backend API Base URL
const API_BASE = "http://localhost:5005/api/appointments";

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data Normalization Helper
  const normalizeBooking = useCallback((b) => ({
    ...b,
    id: b._id || b.id,
    counsellor: b.counsellorName || b.counsellor, // Maintain BC for UI components
    counsellorImage: b.counsellorImage || b.image // Ensure both naming conventions are supported
  }), []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // If student, filter by their email on the backend
      const url = user?.role === "student" && user?.email 
        ? `${API_BASE}?email=${encodeURIComponent(user.email)}` 
        : API_BASE;

      console.log("🔄 Fetching appointments from:", url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load records");
      const data = await response.json();
      
      const bookingsArray = data.success ? data.data : (Array.isArray(data) ? data : []);
      setBookings(bookingsArray.map(normalizeBooking));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.role, normalizeBooking]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const syncBookingUpdate = useCallback(async (id, payload, successMsg) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server sync failed");
      }

      const resJson = await response.json();
      const updated = resJson.data || resJson;
      const normalized = normalizeBooking(updated);
      setBookings((prev) => prev.map((b) => (String(b.id) === String(id) ? normalized : b)));
      if (successMsg) addToast(successMsg, "success");
      return normalized;
    } catch (err) {
      console.error("Booking Update Failed:", err);
      addToast(err.message, "error");
      throw err;
    }
  }, [normalizeBooking, addToast]);

  const addBooking = useCallback(async (bookingData) => {
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
      const normalized = normalizeBooking(newBooking.data || newBooking);
      setBookings((prev) => [normalized, ...prev]);
      addToast("Session intake successfully recorded!", "success");
      return normalized.id;
    } catch (err) {
      addToast(err.message, "error");
      throw err;
    }
  }, [normalizeBooking, addToast]);

  const confirmPayment = useCallback(async (bookingId) => {
    await syncBookingUpdate(bookingId, { status: "Confirmed", paymentStatus: "Paid" }, "Payment Successful! Booking Confirmed.");
  }, [syncBookingUpdate]);

  const cancelBooking = useCallback(async (bookingId, reason = "") => {
    try {
      const response = await fetch(`${API_BASE}/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Cancelled",
          cancelReason: reason 
        })
      });

      if (!response.ok) throw new Error("Cancellation failed");
      
      const resJson = await response.json();
      const updated = resJson.data || resJson;
      const normalized = normalizeBooking(updated);
      
      setBookings((prev) => prev.map((b) => (String(b.id) === String(bookingId) ? normalized : b)));
      
      const msg = resJson.refundEligible 
        ? "✅ Refund initiated. Session cancelled." 
        : "Session cancelled. (Non-refundable window)";
      addToast(msg, resJson.refundEligible ? "success" : "warning");
      
      return normalized;
    } catch (err) {
      console.error("Cancellation Error:", err);
      addToast(err.message, "error");
      throw err;
    }
  }, [normalizeBooking, addToast]);

  const rescheduleBooking = useCallback(async (bookingId, newDate, newTime) => {
    await syncBookingUpdate(bookingId, { date: newDate, time: newTime }, "Appointment Rescheduled Successfully!");
  }, [syncBookingUpdate]);

  // Counsellor Management functions
  const acceptBooking = useCallback((bookingId) => syncBookingUpdate(bookingId, { status: "Accepted" }, "Booking Accepted!"), [syncBookingUpdate]);
  const rejectBooking = useCallback((bookingId, reason) => syncBookingUpdate(bookingId, { status: "Rejected", rejectReason: reason }, "Booking Rejected."), [syncBookingUpdate]);
  const completeBooking = useCallback((bookingId) => syncBookingUpdate(bookingId, { status: "Completed" }, "Session marked as Completed."), [syncBookingUpdate]);
  const confirmBookingByCounsellor = useCallback((bookingId) => syncBookingUpdate(bookingId, { status: "Confirmed" }, "Booking Confirmed!"), [syncBookingUpdate]);
  const cancelBookingByCounsellor = useCallback((bookingId, reason) => syncBookingUpdate(bookingId, { status: "Cancelled", rejectReason: reason }, "Booking Cancelled."), [syncBookingUpdate]);
  const addSessionNotes = useCallback((bookingId, notes) => syncBookingUpdate(bookingId, { notes }, "Session notes saved."), [syncBookingUpdate]);
  
  const startSession = useCallback(async (bookingId) => {
    addToast("Starting session... Redirecting to meeting room", "success");

    try {
      const response = await fetch(`${API_BASE}/${bookingId}/start-session`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || "Failed to initialize session link");
      }
      
      const normalized = normalizeBooking(resJson.data || resJson);
      setBookings((prev) => prev.map((b) => (String(b.id) === String(bookingId) ? normalized : b)));

      setTimeout(() => {
        window.open(normalized.sessionLink, "_blank");
      }, 1500);

      return normalized;
    } catch (err) {
      console.error("Session Start Error:", err);
      addToast(err.message, "error");
      throw err;
    }
  }, [normalizeBooking, addToast]);

  // Utility logic for slots
  const parseDateTime = useCallback((dateStr, timeStr) => {
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
  }, []);

  const checkIsFutureTime = useCallback((dateStr, timeStr) => {
    const requestedDate = parseDateTime(dateStr, timeStr);
    return requestedDate && requestedDate > new Date();
  }, [parseDateTime]);

  const checkIsRefundable = useCallback((dateStr, timeStr) => {
    const appointmentDate = parseDateTime(dateStr, timeStr);
    if (!appointmentDate) return false;
    const now = new Date();
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);
    return diffHours >= 2;
  }, [parseDateTime]);

  const getAvailableSlots = useCallback((counsellorName, date, allSlots) => {
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
  }, [bookings, checkIsFutureTime]);

  const value = useMemo(() => ({
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
    addSessionNotes,
    startSession
  }), [
    bookings, loading, addBooking, confirmPayment, cancelBooking, 
    rescheduleBooking, getAvailableSlots, checkIsRefundable, 
    fetchBookings, acceptBooking, rejectBooking, completeBooking, 
    confirmBookingByCounsellor, cancelBookingByCounsellor, 
    addSessionNotes, startSession
  ]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
