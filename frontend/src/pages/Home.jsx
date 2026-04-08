import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, CalendarCheck, CheckCircle2, Users, Award, Shield } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-40 lg:pb-52 overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] -ml-64 -mb-64 animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100/50">
                <Sparkles size={14} /> New: AI-Driven Matching
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] lg:leading-[0.85]">
                Mental wellness, <br />
                <span className="text-blue-600">reimagined.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                UniCare provides secure, anonymous, and professional counseling tailored specifically for the university ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                <Link to="/appointment/counsellors" className="btn-primary flex items-center justify-center gap-3 group">
                  Book a Session <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="btn-secondary flex items-center justify-center">
                  Explore Platform
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 pt-8 opacity-60">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Expert Accredited</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative animate-fade-in-up delay-200">
              {/* Main Image with Glass Frame */}
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border-[8px] border-white/50 p-1 bg-white/50 backdrop-blur-sm">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
                  alt="Student support"
                  className="w-full h-[600px] object-cover rounded-[2rem]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-indigo-600/10 pointer-events-none" />
              </div>

              {/* Floating Glass Stats */}
              <div className="absolute -bottom-10 -right-10 glass-card p-8 rounded-[2rem] space-y-2 animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">12.5k+</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Students Helped</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-20 -left-16 glass-card p-6 rounded-[2rem] flex items-center gap-4 animate-float">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">4.9/5 Rating</p>
                  <p className="text-[10px] font-bold text-slate-400">Average Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20 text-center lg:text-left">
            <div className="space-y-4 max-w-2xl">
              <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">Our Ecosystem</span>
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.9]">Built for the <br /> modern student life.</h2>
            </div>
            <p className="text-slate-500 max-w-sm mb-2 font-medium">
              We've redesigned the counseling experience to be as flexible and private as your digital life needs to be.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={<CalendarCheck className="w-8 h-8" />}
              title="Smart Scheduling"
              description="Seamlessly book sessions that align with your class schedule and academic workload."
              color="blue"
            />
            <FeatureItem 
              icon={<Shield className="w-8 h-8" />}
              title="Absolute Privacy"
              description="End-to-end encryption for every interaction. Your identity stays protected at every step."
              color="amber"
            />
            <FeatureItem 
              icon={<HeartPulse className="w-8 h-8" />}
              title="Continuous Care"
              description="A library of self-help tools and mood tracking beyond your scheduled appointments."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* How it Works Journey */}
      <section className="section-padding bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[0.9]">How to start <br /> your journey.</h2>
            <p className="text-slate-400 max-w-lg mx-auto font-medium">Simple steps to finding your mental balance with UniCare.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px border-t border-dashed border-slate-700 -z-0" />
            
            <StepCard 
              number="01" 
              title="Find Match" 
              desc="Browse specialized profiles and choose the right expert for your needs." 
            />
            <StepCard 
              number="02" 
              title="Choose Time" 
              desc="Pick a slot from their dynamic availability that fits your life perfectly." 
            />
            <StepCard 
              number="03" 
              title="Start Care" 
              desc="Connect securely from anywhere. Your healing journey officially begins." 
            />
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="section-padding relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative bg-blue-600 rounded-[3rem] p-12 lg:p-24 overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 scale-150 transition-transform group-hover:scale-110 duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 transition-transform group-hover:scale-150 duration-700" />
            
            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-10">
              <Sparkles className="w-16 h-16 text-white/50 mx-auto" />
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-none">Ready to feel <br /> better today?</h2>
              <p className="text-xl text-blue-100 font-medium opacity-80">
                Join thousands of students who have found their center. Your data is protected by best-in-class security protocols.
              </p>
              <div className="pt-6">
                <Link to="/appointment/counsellors" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 text-lg font-black rounded-2xl hover:bg-slate-50 transition-all hover:scale-105 shadow-xl">
                  Get Started Now <ArrowRight size={24} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, title, description, color }) => {
  const colors = {
    blue: "bg-blue-600/10 text-blue-600",
    amber: "bg-amber-600/10 text-amber-600",
    emerald: "bg-emerald-600/10 text-emerald-600"
  };

  return (
    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className={`w-16 h-16 rounded-[1.25rem] ${colors[color]} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
};

const StepCard = ({ number, title, desc }) => (
  <div className="relative z-10 space-y-8 group">
    <div className="text-7xl font-black text-white/10 group-hover:text-blue-500 transition-colors duration-500 leading-none">{number}</div>
    <div className="space-y-3">
      <h3 className="text-3xl font-black text-white">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
      <CheckCircle2 size={16} /> Verified Process
    </div>
  </div>
);

export default Home;
