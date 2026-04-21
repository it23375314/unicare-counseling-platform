import { useState } from "react";

import toast from "react-hot-toast";

function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    toast.success("Appointment Booked!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-md"
    >
      <input
        type="text"
        placeholder="Your Name"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="date"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      <input
        type="time"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, time: e.target.value })}
      />

      <button className="w-full bg-blue-500 text-white py-2 rounded">
        Book Now
      </button>
    </form>
  );
}

export default BookingForm;
