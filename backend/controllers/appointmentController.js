const Appointment = require('../models/Appointment');
const Counsellor = require('../models/Counsellor');
const { sendBookingConfirmation } = require('../utils/mailer');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { 
      studentName, 
      studentEmail, 
      counsellorId,
      counsellorName: providedName,
      date, 
      time, 
      sessionType,
      issueCategory,
      duration,
      notes,
      price, 
      type,
      studentPhone,
      emergencyContact,
      reasonDescription
    } = req.body;

    // Verify counsellor exists (optional check for development)
    let finalCounsellorName = providedName;
    if (counsellorId && counsellorId.length === 24) { // Typical ObjectId length
      const counsellor = await Counsellor.findById(counsellorId);
      if (counsellor) finalCounsellorName = counsellor.name;
    }

    // Create the appointment with all 7 intake sections
    const appointment = new Appointment({
      studentName,
      studentEmail,
      counsellorId,
      counsellorName: finalCounsellorName || "UniCare Expert",
      date,
      time,
      sessionType,
      issueCategory,
      duration,
      notes: notes || "",
      emergencyContact,
      reasonDescription,
      price: Number(price),
      status: req.body.status || 'Pending',
      paymentStatus: req.body.paymentStatus || 'Unpaid',
      type: type || 'Video Session'
    });

    const newAppointment = await appointment.save();
    console.log("✅ Appointment Created Successfully:", newAppointment._id);

    res.status(201).json({ success: true, data: newAppointment });
  } catch (err) {
    console.error("❌ CREATE Appointment Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get appointments for a student by email
exports.getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ studentEmail: req.params.email })
      .sort({ date: -1, time: -1 });
    console.log(`🔍 Fetched ${appointments.length} appointments for student: ${req.params.email}`);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("❌ GET Student Appointments Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all appointments (Admin/Counsellor view)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: -1, time: -1 });
    console.log(`📋 Fetched all (${appointments.length}) appointments (Admin/Counsellor view)`);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("❌ GET All Appointments Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: Check if session is more than 2 hours away
const checkIsRefundable = (dateStr, timeStr) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours, minutes;
    
    // Support "HH:MM AM/PM" format
    const match12 = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (match12) {
      let [_, h, m, modifier] = match12;
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
      if (hours === 12) hours = modifier.toUpperCase() === "AM" ? 0 : 12;
      else if (modifier.toUpperCase() === "PM") hours += 12;
    } else {
      // Support "HH:MM" 24h format
      [hours, minutes] = timeStr.split(':').map(Number);
    }

    const appointmentDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);
    return diffHours >= 2;
  } catch (e) {
    console.error("Date Parsing Error:", e);
    return false;
  }
};

// Update appointment status or reschedule
exports.updateStatus = async (req, res) => {
  try {
    const { status, paymentStatus, date, time, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const prevPaymentStatus = appointment.paymentStatus;
    const prevStatus = appointment.status;

    // Handle Cancellation Logic
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      const isRefundable = checkIsRefundable(appointment.date, appointment.time);
      
      appointment.status = 'Cancelled';
      appointment.cancelReason = cancelReason || 'User requested cancellation';
      
      // If session was paid, determine refund eligibility
      if (appointment.paymentStatus === 'Paid') {
        appointment.refundStatus = isRefundable ? 'Eligible' : 'Not Eligible';
      } else {
        appointment.refundStatus = 'None';
      }

      await appointment.save();

      // Trigger Cancellation Email
      try {
        const { sendCancellationEmail } = require('../utils/mailer');
        await sendCancellationEmail(appointment, isRefundable);
      } catch (emailErr) {
        console.error("⚠️ Cancellation Email Failed:", emailErr);
      }

      return res.json({ success: true, data: appointment, refundEligible: isRefundable });
    }

    // Standard Updates
    if (status) appointment.status = status;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    if (date) appointment.date = date;
    if (time) appointment.time = time;

    await appointment.save();

    // Trigger Confirmation Email only when newly marked as 'Paid'
    if (paymentStatus === 'Paid' && prevPaymentStatus !== 'Paid') {
        try {
            await sendBookingConfirmation(appointment);
        } catch (emailErr) {
            console.error("⚠️ Confirmation Email Failed:", emailErr);
        }
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};
