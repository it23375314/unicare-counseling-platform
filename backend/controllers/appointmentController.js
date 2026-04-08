const Appointment = require('../models/Appointment');
const Counsellor = require('../models/Counsellor');
const nodemailer = require('nodemailer');

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
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Get appointments for a student by email
exports.getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ studentEmail: req.params.email })
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments (Admin/Counsellor view)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update appointment status or reschedule
exports.updateStatus = async (req, res) => {
  try {
    const { status, paymentStatus, date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (status) appointment.status = status;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    if (date) appointment.date = date;
    if (time) appointment.time = time;

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ message: err.message });
  }
};
