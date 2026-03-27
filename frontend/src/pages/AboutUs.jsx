import { Users, Target, Shield } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-serif">
            About UniCare
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            We are dedicated to providing accessible, secure, and professional mental health support specifically tailored for university students. Because your mental well-being is the foundation of your success.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="bg-blue-50 p-10 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Target size={120} />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
              <span className="bg-blue-600 text-white p-2 rounded-lg"><Target size={24}/></span>
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg relative z-10">
              To dismantle the barriers of stigma, cost, and accessibility surrounding mental healthcare in universities, ensuring every student has a safe space to seek help.
            </p>
          </div>

          <div className="bg-teal-50 p-10 rounded-3xl border border-teal-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Users size={120} />
            </div>
            <h2 className="text-2xl font-bold text-teal-900 mb-4 flex items-center gap-3">
              <span className="bg-teal-600 text-white p-2 rounded-lg"><Users size={24}/></span>
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg relative z-10">
              A vibrant university culture where mental health is prioritized, openly discussed, and seamlessly supported by modern, student-centric platforms like UniCare.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 font-serif">Why Choose UniCare?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition">
              <Shield className="text-blue-600 w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">100% Confidential</h3>
              <p className="text-gray-600">Your privacy is our highest priority. All communication and records are fully encrypted.</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition">
              <Users className="text-teal-600 w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Expert Counsellors</h3>
              <p className="text-gray-600">Connect with licensed professionals who specialize in student mental health challenges.</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition">
              <Target className="text-pink-600 w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Tailored to Students</h3>
              <p className="text-gray-600">Flexible booking times, affordable plans, and resources built specifically for the student lifecycle.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
