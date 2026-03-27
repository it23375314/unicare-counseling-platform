import { Search, Filter, Star, Clock, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const FindCounsellor = () => {
  const counsellors = [
    {
      id: 1,
      name: "Dr. Sarah Jenkins",
      specialty: "Anxiety & Academic Stress",
      rating: 4.8,
      experience: "12 years",
      location: "Online Global Support",
      nextAvailable: "Today at 3:30 PM",
      price: "$60",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Dr. Ahmed Rahman",
      specialty: "Depression & Career Counseling",
      rating: 4.8,
      experience: "15 years",
      location: "Online Global Support",
      nextAvailable: "Today at 3:30 PM",
      price: "$75",
      image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=2521&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Ms. Elena Rodriguez",
        specialty: "Relationship & Identity Support",
        rating: 4.9,
        experience: "8 years",
        location: "Online Global Support",
        nextAvailable: "Tomorrow at 10:00 AM",
        price: "$55",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2561&auto=format&fit=crop"
      }
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Section - Modern split layout style matching Home */}
      <section className="relative pt-24 pb-20 overflow-hidden border-b border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="lg:w-1/2">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8">
                        <ShieldCheck size={16} />
                        <span>Vetted Professionals</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                        Find Your <br />
                        <span className="text-blue-600">Ideal Counsellor.</span>
                    </h1>
                    <p className="text-lg text-gray-600 font-bold leading-relaxed max-w-xl">
                        Browse our directory of licensed professionals specializing in student mental health challenges. Your journey to wellness starts here.
                    </p>
                </div>
                <div className="lg:w-1/2 w-full max-w-xl">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-blue-50">
                        <div className="relative group mb-4">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                            <input 
                                type="text"
                                placeholder="Search by name, specialty, or condition..."
                                className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[2rem] transition-all text-gray-900 font-bold placeholder:text-gray-300 outline-none shadow-inner"
                            />
                        </div>
                        <button className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.75rem] hover:bg-blue-600 transition-all shadow-xl">
                            <Filter size={18} />
                            Advanced Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-12">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Showing <span className="text-gray-900">3 Results</span></p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort by:</span>
            <select className="bg-transparent text-[10px] font-black text-gray-900 uppercase tracking-widest border-none focus:ring-0 cursor-pointer">
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Price: Low to High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {counsellors.map((counsellor) => (
            <div key={counsellor.id} className="group bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-2/5 relative overflow-hidden">
                <img 
                  src={counsellor.image} 
                  alt={counsellor.name}
                  className="w-full h-full object-cover aspect-[4/5] sm:aspect-auto group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-teal-400/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Available Now
                </div>
              </div>
              <div className="sm:w-3/5 p-10 flex flex-col justify-between bg-white relative">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{counsellor.name}</h3>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-xl">
                      <Star size={14} fill="currentColor" />
                      <span className="font-black text-xs">{counsellor.rating}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-8">{counsellor.specialty}</p>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                      <MapPin size={18} className="text-blue-100 group-hover:text-blue-200" />
                      <span className="text-xs font-bold">{counsellor.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                      <Clock size={18} className="text-blue-100 group-hover:text-blue-200" />
                      <span className="text-xs font-bold">Next Slot: {counsellor.nextAvailable}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                  <div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{counsellor.price}<span className="text-xs text-gray-400 font-bold ml-1">/Session</span></p>
                  </div>
                  <Link 
                    to="/appointment/booking" 
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                  >
                    View Schedule <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindCounsellor;
