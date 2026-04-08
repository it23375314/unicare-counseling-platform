import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

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
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <ShieldCheck size={12} /> Verified Professionals
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none">
              Find your <br /> <span className="text-blue-600">perfect match.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl">
              Connect with university-approved experts specializing in the unique challenges of student life. Private, secure, and ready when you are.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-10 relative z-20">
        {/* Search & Filter Bar */}
        <div className="glass-card p-4 rounded-[2rem] shadow-2xl shadow-blue-900/10 mb-16 animate-fade-in-up delay-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, expertise, or key challenge..."
                className="pl-14 w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                      : "bg-white text-slate-500 hover:text-blue-600 border border-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCounsellors.map((counsellor, idx) => (
            <div 
              key={counsellor.id} 
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-600/10 rounded-3xl group-hover:scale-105 transition-transform duration-500" />
                <img 
                  src={"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"} 
                  alt={counsellor.name} 
                  className="w-full h-64 rounded-3xl object-cover relative z-10 group-hover:-translate-y-2 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 z-20 glass-card px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-slate-900">{counsellor.rating || "4.8"}</span>
                </div>
              </div>

              <div className="flex flex-col flex-grow space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{counsellor.name}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{counsellor.specialization}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
                    <MapPin size={12} className="text-slate-400" /> {counsellor.location || "Online"}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                    <Clock size={12} /> Verified Available
                  </div>
                </div>

                <div className="pt-6 mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                    <span className="text-xl font-black text-slate-900">Rs. {counsellor.price || "3000"}<span className="text-sm font-medium text-slate-400">/sess</span></span>
                  </div>
                  <button 
                    onClick={() => handleBookClick(counsellor.id)}
                    className="p-4 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-600/40 group/btn"
                  >
                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCounsellors.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                <Zap size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-slate-900 tracking-tight">No experts found.</p>
                <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
              </div>
              <button 
                onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                className="text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FindCounsellor;
