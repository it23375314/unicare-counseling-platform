import { CheckCircle2, HeartPulse, ShieldCheck, Sparkles, Target, Users, BookOpen, Quote } from "lucide-react";

// Use relative public paths for images
const BUILDING_IMAGE = "/assets/building.png";
const ILLUSTRATION = "/assets/illustration.png";
const TEAM_IMAGE = "/assets/team.png";

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Official Top Banner */}
      <div className="bg-gray-900 text-white py-2.5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">
        Our Mission & Institutional Commitment
      </div>

      {/* Hero Section - Professional Split Layout */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden border-b border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-10">
                <Sparkles size={16} />
                <span>Empowering Student Success</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-8">
                Supporting Your <br />
                <span className="text-blue-600">Growth & Wellness.</span>
              </h1>
              <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-xl">
                UniCare is the official digital bridge connecting university students with licensed mental health professionals in a secure, confidential environment.
              </p>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] blur-2xl opacity-30 -z-10 rotate-3"></div>
                <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white animate-fade-in-up animation-delay-500">
                    <img src={TEAM_IMAGE} alt="UniCare Team" className="w-full h-auto object-cover aspect-[4/3]" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision & Mission - With Professional Illustration */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
                <div className="grid grid-cols-1 gap-12">
                     <div className="group">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="bg-teal-100 text-teal-600 p-4 rounded-2xl shadow-lg border border-teal-50 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Our Mission</h2>
                        </div>
                        <p className="text-gray-500 font-bold text-lg leading-relaxed">
                            To ensure that no student's academic potential is hindered by mental health challenges. We strive to provide accessible, 24/7 support that integrates seamlessly into campus life.
                        </p>
                    </div>

                    <div className="group">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl shadow-lg border border-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <Users size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Our Vision</h2>
                        </div>
                        <p className="text-gray-500 font-bold text-lg leading-relaxed">
                            A global academic community where mental wellness is prioritized, destigmatized, and easily accessible to every student, everywhere.
                        </p>
                    </div>
                </div>
            </div>
            <div className="order-1 lg:order-2">
                <div className="relative">
                    <div className="absolute -inset-10 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
                    <img 
                        src={ILLUSTRATION} 
                        alt="Mental Health Illustration" 
                        className="w-full h-auto rounded-[3rem] shadow-2xl hover:scale-105 transition-transform duration-700"
                    />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Story Section - With Building Image */}
      <section className="py-32 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-20">
                <div className="lg:w-1/2">
                    <div className="relative group">
                        <img 
                            src={BUILDING_IMAGE} 
                            alt="University Campus" 
                            className="rounded-[3rem] shadow-2xl border-8 border-white group-hover:rotate-0 transition-transform duration-700 -rotate-2" 
                        />
                        <div className="absolute inset-0 bg-blue-900/10 rounded-[3rem] group-hover:opacity-0 transition-opacity duration-700"></div>
                    </div>
                </div>
                <div className="lg:w-1/2">
                    <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-[0.3em] mb-6">
                        <div className="w-8 h-1 bg-blue-600"></div>
                        Institutional Excellence
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 tracking-tighter leading-none">Rooted in <br />Academic Integrity.</h2>
                    <p className="text-lg text-gray-500 font-bold leading-relaxed mb-10">
                        Founded by a consortium of university healthcare experts and digital researchers, 
                        UniCare was built to address the unique pressures of student life—from exam anxiety 
                        to international relocation stress.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl font-black text-gray-900">10+</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Institutions</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl font-black text-gray-900">100k+</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Users</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Our Core Pillars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ValueCard 
              icon={<ShieldCheck size={32} className="text-blue-600" />}
              title="Absolute Privacy"
              desc="Your data is encrypted and stays between you and your counselor."
            />
            <ValueCard 
              icon={<HeartPulse size={32} className="text-teal-600" />}
              title="Empathy Driven"
              desc="We select professionals who specialize in student-centric challenges."
            />
            <ValueCard 
              icon={<BookOpen size={32} className="text-indigo-600" />}
              title="Academic Focused"
              desc="Support that understands your deadlines and research pressures."
            />
          </div>
        </div>
      </section>

      {/* Professional Quote */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1),_transparent)]"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <Quote size={48} className="text-blue-500 mx-auto mb-10 opacity-50" />
            <p className="text-3xl lg:text-4xl font-black italic mb-10 leading-tight">
                "Our goal is to make mental wellness a fundamental part of the university experience, not just an afterthought."
            </p>
            <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-1 bg-blue-600"></div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">The UniCare Leadership Board</p>
                <div className="w-12 h-1 bg-blue-600"></div>
            </div>
        </div>
      </section>
    </div>
  );
};

const ValueCard = ({ icon, title, desc }) => (
  <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition duration-500 text-center">
    <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">{title}</h3>
    <p className="text-gray-500 font-bold leading-relaxed">{desc}</p>
  </div>
);

export default AboutUs;
