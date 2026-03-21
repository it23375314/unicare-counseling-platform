function Navbar() {
  return (
    <div className="bg-white shadow-md p-4 flex justify-between">
      <h1 className="font-bold text-xl text-blue-600">UniCare</h1>

      <div className="space-x-4">
        <button>Home</button>
        <button>Appointments</button>
        <button>Payments</button>
      </div>
    </div>
  );
}

export default Navbar;