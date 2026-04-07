import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const BookingContext = createContext();
const API_URL = "http://localhost:5000/api";

export const useBooking = () => useContext(BookingContext);

// Backend API Base URL
const API_BASE = "http://localhost:5000/api/appointments";

export const BookingProvider = ({ children }) => {
  const { addToast } = useToast();
<<<<<<< HEAD
  
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
=======
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
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708

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
=======
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
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708

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
<<<<<<< HEAD

    try {
        const payload = { ...bookingData, status: "Pending", createdAt: new Date().toISOString() };
        const res = await fetch(`${API_URL}/bookings`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        if(json.success && json.data) {
            setBookings((prev) => [...prev, { ...json.data, id: json.data._id }]);
            return json.data._id;
        }
    } catch(e) {
        const fallbackId = Date.now().toString();
        setBookings((prev) => [...prev, { ...bookingData, status: "Pending", id: fallbackId }]);
        return fallbackId;
    }
  };

  const confirmPayment = (bookingId) => {
    syncBookingUpdate(bookingId, { status: "Confirmed", paymentStatus: "Paid" }, "Payment Successful! Booking Confirmed.");
  };

  const cancelBooking = (bookingId) => {
    const b = bookings.find(x => x.id === bookingId);
    if(!b) return;
    const isRefundable = checkIsRefundable(b.date, b.time);
    
    syncBookingUpdate(bookingId, { 
        status: "Cancelled", 
        paymentStatus: isRefundable ? "Refunded" : b.paymentStatus,
        refundStatus: isRefundable ? "Eligible" : "Not Eligible"
    }, isRefundable ? "✅ Refund will be processed. Cancelled successfully." : "❌ Refund not eligible (< 2hrs). Cancelled successfully.");
  };

  const rescheduleBooking = (bookingId, newDate, newTime) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    const isDuplicate = bookings.some(
      (b) => b.id !== bookingId && b.counsellor === targetBooking.counsellor && b.date === newDate && b.time === newTime && b.status !== "Cancelled"
    );
    if (isDuplicate) throw new Error("That slot is already booked. Please choose another.");
    syncBookingUpdate(bookingId, { date: newDate, time: newTime }, "Appointment Rescheduled Successfully!");
  };

  const acceptBooking = (bookingId) => syncBookingUpdate(bookingId, { status: "Accepted" }, "Booking Accepted!");
  const rejectBooking = (bookingId, reason) => syncBookingUpdate(bookingId, { status: "Rejected", rejectReason: reason }, "Booking Rejected.");
  const completeBooking = (bookingId) => syncBookingUpdate(bookingId, { status: "Completed" }, "Session marked as Completed.");
  const confirmBookingByCounsellor = (bookingId) => syncBookingUpdate(bookingId, { status: "Confirmed" }, "Booking Confirmed!");
  const cancelBookingByCounsellor = (bookingId, reason) => syncBookingUpdate(bookingId, { status: "Cancelled", rejectReason: reason }, "Booking Cancelled.");
  const addSessionNotes = (bookingId, notes) => syncBookingUpdate(bookingId, { notes }, "Session notes saved.");

  const checkIsRefundable = (dateStr, timeStr) => {
    const appointmentDate = parseDateTime(dateStr, timeStr);
    if (!appointmentDate) return false;
    const diffHours = (appointmentDate - new Date()) / (1000 * 60 * 60);
=======
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
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708
    return diffHours >= 2;
  };

  const checkIsFutureTime = (dateStr, timeStr) => {
     const requestedDate = parseDateTime(dateStr, timeStr);
     return requestedDate && requestedDate > new Date();
  }

  const parseDateTime = (dateStr, timeStr) => {
<<<<<<< HEAD
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
=======
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
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708
    return null;
  }

  return (
<<<<<<< HEAD
    <BookingContext.Provider value={{
        bookings, addBooking, confirmPayment, cancelBooking, rescheduleBooking,
        getAvailableSlots, checkIsRefundable, acceptBooking, rejectBooking,
        confirmBookingByCounsellor, cancelBookingByCounsellor, completeBooking, addSessionNotes
    }}>
=======
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
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708
      {children}
    </BookingContext.Provider>
  );
};
