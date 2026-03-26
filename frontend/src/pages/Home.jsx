import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, CalendarCheck } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Your mental wellness, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                prioritized.
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              UniCare is a secure, private counseling platform designed for university students. Overcome academic pressure and stress with professional support, whenever you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/appointment/counsellors"
                className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Find a Counsellor <ArrowRight size={20} />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 rounded-full bg-white text-gray-800 font-semibold text-lg hover:bg-gray-50 border border-gray-200 transition shadow-sm flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white">
              <img
                src="/hero_counseling.png"
                alt="Mental health support"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2620&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce-slow">
              <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">100% Private</p>
                <p className="text-gray-900 font-bold">Secure Sessions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Core Features Designed for You</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage your mental health journey safely and anonymously.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-8 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CalendarCheck className="w-8 h-8 text-blue-600" />}
              title="Smart Appointment Booking"
              description="Easily schedule sessions with AI-curated time recommendations that fit your busy student lifestyle."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-teal-600" />}
              title="Anonymous & Secure"
              description="We prioritize your privacy. All your sessions and personal data are heavily encrypted and strictly confidential."
            />
            <FeatureCard 
              icon={<HeartPulse className="w-8 h-8 text-pink-600" />}
              title="Continuous Support"
              description="Access well-being resources, track your mood, and receive guidance beyond just your scheduled sessions."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <Sparkles className="w-12 h-12 text-white mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">Take the first step towards a healthier you</h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of university students who have found balance and peace of mind with UniCare.
          </p>
          <Link
            to="/appointment/counsellors"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-white text-blue-600 hover:bg-gray-50 transition shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
    <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Home;