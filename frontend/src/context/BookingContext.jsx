import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const BookingContext = createContext();

// Backend API Base URL
const API_BASE = "http://localhost:5001/api/appointments";

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data Normalization Helper
  const normalizeBooking = (b) => ({
    ...b,
    id: b._id || b.id,
    counsellor: b.counsellorName || b.counsellor // Maintain BC for UI components
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching appointments from:", API_BASE);
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error("Failed to load records");
      const data = await response.json();
      
      const bookingsArray = data.success ? data.data : (Array.isArray(data) ? data : []);
      setBookings(bookingsArray.map(normalizeBooking));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const syncBookingUpdate = async (id, payload, successMsg) => {
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
  };

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
      const normalized = normalizeBooking(newBooking.data || newBooking);
      setBookings((prev) => [normalized, ...prev]);
      addToast("Session intake successfully recorded!", "success");
      return normalized.id;
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
    const isPaid = b.paymentStatus === "Paid";

    await syncBookingUpdate(bookingId, { 
      status: "Cancelled", 
      refundStatus: isPaid ? (isRefundable ? "Processing" : "Ineligible") : "None",
      paymentStatus: isPaid ? (isRefundable ? "Refund Processing" : b.paymentStatus) : b.paymentStatus 
    }, isPaid && isRefundable ? "✅ Refund initiated. Session cancelled." : "Session cancelled successfully.");
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

  // Helper functions
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
        fetchBookings,
        acceptBooking,
        rejectBooking,
        completeBooking,
        confirmBookingByCounsellor,
        cancelBookingByCounsellor,
        addSessionNotes
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
