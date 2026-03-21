import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h1 className="text-4xl font-bold text-blue-600">
          UniCare Counseling Platform
        </h1>
        <p className="mt-4 text-gray-600">
          Book counseling sessions easily & manage your mental wellness
        </p>

        <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default Home;