import { Users, Target, Shield, Sparkles, Heart, Globe, ArrowRight, Zap } from "lucide-react";
import { useEffect } from "react";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Dynamic Hero Header */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -ml-64 -mt-64" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 animate-fade-in-up">
            <Sparkles size={12} /> The UniCare Promise
          </div>
          <h1 className="text-5xl lg:text-8xl font-black text-slate-900 tracking-tight leading-none italic animate-fade-in-up delay-100">
            About <span className="text-blue-600 not-italic">UniCare.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
            We are dedicated to providing accessible, secure, and professional mental health support specifically tailored for the university ecosystem.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Core Philosophy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24 anim-sequence">
          <PhilosophyCard 
            icon={<Target className="text-blue-600" size={32} />}
            title="Our Mission"
            description="To dismantle the barriers of stigma, cost, and accessibility surrounding mental healthcare in universities, ensuring every student has a safe space to seek help."
            accent="bg-blue-600"
          />
          <PhilosophyCard 
            icon={<Globe className="text-emerald-500" size={32} />}
            title="Our Vision"
            description="A vibrant university culture where mental health is prioritized, openly discussed, and seamlessly supported by modern, student-centric digital infrastructure."
            accent="bg-emerald-500"
          />
        </div>

        {/* Strategic Pillars */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">The UniCare Framework</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield size={24} />}
              title="100% Confidential"
              description="Your privacy is encoded at the kernel level. All session records and communications are protected by bank-level encryption."
              color="text-blue-600"
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Expert Professionals"
              description="Connect with licensed clinical experts who specialize specifically in student mental health and academic pressures."
              color="text-emerald-500"
            />
            <FeatureCard 
              icon={<Zap size={24} />}
              title="Tailored Experience"
              description="Flexible scheduling, instant matching, and specialized resources designed perfectly for the high-pressure student lifecycle."
              color="text-amber-500"
            />
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-32 glass-card p-12 lg:p-20 rounded-[3rem] text-center space-y-10 border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">Your Growth is <br /><span className="text-blue-600">Our Motivation.</span></h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Join thousands of students who have taken control of their mental well-being with UniCare's professional support network.
          </p>
          <div className="pt-4">
            <button className="bg-blue-600 text-white font-black uppercase tracking-widest text-xs px-12 py-6 rounded-[2rem] hover:bg-slate-900 transition-all duration-500 shadow-2xl shadow-blue-600/20 group">
              Join the Network <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const PhilosophyCard = ({ icon, title, description, accent }) => (
  <div className="glass-card p-12 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-2 h-full ${accent} transition-transform duration-500 origin-left`} />
    <div className="space-y-6 relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-6">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
    <div className={`mb-8 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${color} transition-colors group-hover:bg-slate-900 group-hover:text-white`}>
      {icon}
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{description}</p>
  </div>
);

export default AboutUs;
