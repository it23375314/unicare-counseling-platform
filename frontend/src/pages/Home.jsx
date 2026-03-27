import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Sparkles, 
  CalendarCheck, 
  Users, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  LayoutDashboard, 
  PhoneCall,
  Clock,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Use relative paths for images in the public/assets directory
const HERO_IMAGE = "/assets/hero.png";
const COUNSELOR_IMAGE = "/assets/counselor.png";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Official Top Banner */}
      <div className="bg-gray-900 text-white py-2.5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">
        Official University Student Counseling & Mental Health Service
      </div>

      {/* Hero Section - Professional Split Layout */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden border-b border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-10">
                <ShieldCheck size={16} />
                <span>Secure • Private • Professional</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.05]">
                Supporting Your <br />
                <span className="text-blue-600">Mental Well-being</span> <br />
                Across Campus.
              </h1>
              
              <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-bold">
                Access confidential counseling and mental health resources 
                tailored for the university student experience.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to={user ? "/appointment/counsellors" : "/login"} className="px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:-translate-y-1">
                    Book a Session
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all hover:-translate-y-1">
                    Urgent Support
                </Link>
              </div>
            </div>

            <div className="relative">
                <div className="absolute -inset-4 bg-blue-200 rounded-[3rem] blur-2xl opacity-20 -z-10 rotate-3"></div>
                <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white animate-fade-in-up animation-delay-500">
                    <img src={HERO_IMAGE} alt="University Students" className="w-full h-auto object-cover aspect-[4/3]" />
                </div>
                {/* Floating Trust Card */}
                <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 hidden sm:block animate-bounce-slow">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-100 p-3 rounded-2xl text-teal-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-900">100%</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidential</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Action Portal - GRID TILES */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ServiceTile 
                to={user ? "/appointment/counsellors" : "/login"}
                icon={<CalendarCheck className="w-8 h-8" />}
                title="Book a Session"
                description="Schedule a 1-on-1 talk with a professional."
                color="blue"
                />
                <ServiceTile 
                to="/about"
                icon={<AlertCircle className="w-8 h-8" />}
                title="Urgent Support"
                description="Immediate help for critical situations."
                color="red"
                urgent
                />
                <ServiceTile 
                to="/about"
                icon={<BookOpen className="w-8 h-8" />}
                title="Self-Help Tools"
                description="Guided resources and wellness guides."
                color="teal"
                />
                <ServiceTile 
                to="/dashboard"
                icon={<LayoutDashboard className="w-8 h-8" />}
                title="My Dashboard"
                description="Manage your history and appointments."
                color="indigo"
                />
            </div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="max-w-md text-center lg:text-left">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Why Trust UniCare?</h2>
                    <p className="text-gray-500 font-bold leading-relaxed">We provide a bridge between students and mental health professionals, ensuring privacy and academic integration.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-grow">
                    <TrustBadge icon={<CheckCircle2 size={20}/>} label="Vetted Professionals" />
                    <TrustBadge icon={<ShieldCheck size={20}/>} label="Institutional Trust" />
                    <TrustBadge icon={<Clock size={20}/>} label="24hr Emergency Line" />
                </div>
            </div>
        </div>
      </section>

      {/* Professional Content: Counselor Spotlight */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
                <div className="relative">
                    <div className="absolute -inset-4 bg-teal-100 rounded-[3rem] blur-2xl opacity-30 -z-10 rotate-3"></div>
                    <img 
                        src={COUNSELOR_IMAGE} 
                        alt="Professional Counseling" 
                        className="rounded-[2.5rem] shadow-2xl border-8 border-white object-cover aspect-video"
                    />
                    <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 hidden sm:block">
                        <p className="text-teal-600 font-black text-4xl mb-1">50+</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Licensed Experts</p>
                    </div>
                </div>
            </div>
            <div className="lg:w-1/2">
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 tracking-tight">Access Support in <br /><span className="text-blue-600">Three Easy Steps.</span></h2>
                <div className="space-y-10">
                    <StepItem 
                        num="01" 
                        title="Search Professionals" 
                        desc="Browse our directory of university-vetted counsellors by their specialization and student reviews."
                    />
                    <StepItem 
                        num="02" 
                        title="Choose Your Slot" 
                        desc="Our AI-powered scheduling helps you find a balance between your studies and wellness needs."
                    />
                    <StepItem 
                        num="03" 
                        title="Connect Securely" 
                        desc="Join high-definition video sessions directly within your dashboard—completely private and secure."
                    />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter - Dark Academic Look */}
      <section className="py-24 bg-gray-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-blue-600 opacity-5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <StatBox value="15k+" label="Support Sessions" />
            <StatBox value="4.9/5" label="Student Rating" />
            <StatBox value="20min" label="Avg Response Time" />
            <StatBox value="100%" label="Anonymity Guaranteed" />
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div className="lg:col-span-1">
                    <Link to="/" className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <HeartPulse size={24} />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase font-serif">UniCare</span>
                    </Link>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed uppercase tracking-tight">Department of Student Wellness & Academic Success.</p>
                </div>
                <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Emergency Help</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-sm font-black text-red-500 hover:underline">24/7 Crisis Line: 011-234-567</a></li>
                        <li><a href="#" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Counseling Triage: Mon-Fri</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Student Links</h4>
                    <ul className="space-y-4">
                        <li><Link to="/appointment/counsellors" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Find a Counsellor</Link></li>
                        <li><Link to="/about" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Privacy Information</Link></li>
                        <li><Link to="/login" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Portal Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Campus Partners</h4>
                    <div className="flex flex-wrap gap-4 opacity-30 grayscale">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
            <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">© 2026 University Mental Health Services. All Rights Reserved.</p>
                <div className="flex gap-8">
                    <a href="#" className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em]">Terms of Service</a>
                    <a href="#" className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em]">Confidentiality Policy</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

const ServiceTile = ({ to, icon, title, description, color, urgent }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-blue-100",
        red: "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white border-red-100",
        teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white border-teal-100",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white border-indigo-100"
    };

    return (
        <Link to={to} className="group flex flex-col items-center text-center p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500">
            <div className={`${colors[color]} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-lg`}>
                {icon}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">{description}</p>
            {urgent && (
                 <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-red-600 animate-pulse">
                    <PhoneCall size={12} /> AVAILABLE 24/7
                 </div>
            )}
        </Link>
    );
};

const TrustBadge = ({ icon, label }) => (
    <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-blue-600">{icon}</div>
        <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.15em]">{label}</span>
    </div>
);

const StepItem = ({ num, title, desc }) => (
    <div className="flex gap-6 group">
        <div className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition-colors uppercase leading-none">{num}</div>
        <div>
            <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{title}</h4>
            <p className="text-gray-500 font-bold leading-relaxed">{desc}</p>
        </div>
    </div>
);

const StatBox = ({ value, label }) => (
    <div className="text-center group">
        <p className="text-4xl lg:text-6xl font-black text-white mb-3 tracking-tighter">{value}</p>
        <div className="w-8 h-1 bg-blue-600 mx-auto mb-4 group-hover:w-16 transition-all duration-500"></div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{label}</p>
    </div>
);

export default Home;