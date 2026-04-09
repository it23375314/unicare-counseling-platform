import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import counsellorBg from "../../assets/find_counsellor_bg.png";

const FindCounsellor = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { counsellors } = useCounsellorContext();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Stress", "Anxiety", "Academic", "Relationships", "Career"];

  const handleBookClick = (counsellorId) => {
    if (!isAuthenticated) {
      addToast("Please sign in to book a counseling session.", "info");
      navigate("/login", { state: { from: { pathname: `/appointment/book/${counsellorId}` } } });
      return;
    }
    navigate(`/appointment/book/${counsellorId}`);
  };

  const filteredCounsellors = counsellors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.specialization.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Immersive Header Section */}
      <div className="relative pt-32 pb-44 lg:pt-48 lg:pb-64 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src={counsellorBg} 
            alt="Wellness Center" 
            className="w-full h-full object-cover"
          />
          {/* Layered Overlay for Depth & Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/70 to-slate-50/100" />
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-md text-blue-300 text-[11px] font-black uppercase tracking-widest border border-blue-400/20 shadow-xl shadow-blue-500/10">
              <ShieldCheck size={14} className="text-emerald-400 animate-pulse" /> University Verified Experts
            </div>
            <h1 className="text-6xl lg:text-9xl font-black text-white tracking-tight leading-[0.85] drop-shadow-2xl">
              Find your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">perfect match.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-200 font-medium max-w-xl leading-relaxed drop-shadow-md">
              Connect with university-approved experts specializing in the unique challenges of student life. Private, secure, and ready when you are.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-24 lg:-mt-32 relative z-20">
        {/* Search & Filter Bar - Premium Refinement */}
        <div className="glass-card p-4 lg:p-6 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 mb-20 animate-fade-in-up delay-100 bg-white/40 backdrop-blur-3xl border border-white/40">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Search by name, expertise, or key challenge..."
                className="pl-14 w-full bg-white/60 border border-slate-100 text-slate-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:bg-white block p-5 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar px-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                    activeCategory === cat 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/40" 
                      : "bg-white/80 text-slate-500 hover:text-blue-600 border border-slate-100 hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCounsellors.map((counsellor, idx) => (
            <div 
              key={counsellor.id} 
              className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 flex flex-col animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
              
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-600/5 rounded-[2rem] group-hover:scale-105 transition-transform duration-700" />
                <img 
                  src={"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"} 
                  alt={counsellor.name} 
                  className="w-full h-72 rounded-[2rem] object-cover relative z-10 group-hover:-translate-y-3 transition-transform duration-700 shadow-lg"
                />
                <div className="absolute top-5 right-5 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-white/50">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-slate-900">{counsellor.rating || "4.8"}</span>
                </div>
              </div>

              <div className="flex flex-col flex-grow space-y-6 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{counsellor.name}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                    {counsellor.specialization}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black tracking-widest uppercase border border-slate-100">
                    <MapPin size={12} className="text-slate-400" /> {counsellor.location || "Online"}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest uppercase border border-emerald-100/50">
                    <Clock size={12} /> Available Now
                  </div>
                </div>

                <div className="pt-8 mt-auto flex items-center justify-between border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Rate</span>
                    {isAuthenticated ? (
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        Rs. {counsellor.price || "3000"}<span className="text-sm font-medium text-slate-400">/sess</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Zap size={12} className="fill-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Login to view rates</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleBookClick(counsellor.id)}
                    className="w-14 h-14 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 flex items-center justify-center transition-all duration-500 shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-95 group/btn"
                  >
                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCounsellors.length === 0 && (
            <div className="col-span-full py-40 text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-slate-200 border border-slate-50">
                <Search size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">No match found.</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Try broadening your search criteria or choosing a different specialty category.</p>
              </div>
              <button 
                onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                className="bg-blue-50 text-blue-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
              >
                Reset Filter Settings
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FindCounsellor;
