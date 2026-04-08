const Appointment = require('../models/Appointment');
const Counsellor = require('../models/Counsellor');

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
      type 
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
      price: Number(price),
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
