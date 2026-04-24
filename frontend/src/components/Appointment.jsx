import BookingForm from "../modules/appointment/BookingForm";

function Appointment() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>

      <BookingForm />
    </div>
  );
}

export default Appointment;
