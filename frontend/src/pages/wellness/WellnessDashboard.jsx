import React from "react";
import { 
  Brain, 
  History, 
  Target, 
  BookOpen, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  PlusCircle,
  MessageSquare,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

const WellnessDashboard = () => {
  const features = [
    {
      title: "Mood Support Assistant",
      description: "Chat with our empathetic AI designed to provide instant emotional support and guidance.",
      icon: <MessageSquare className="text-blue-600" size={28} />,
      link: "/chat",
      color: "blue"
    },
    {
      title: "Mood History",
      description: "Track your emotional journey over time with detailed insights and daily check-ins.",
      icon: <History className="text-teal-600" size={28} />,
      link: "#",
      color: "teal"
    },
    {
      title: "Personal Wellness Goals",
      description: "Create and track customized wellness goals to improve your mental health systematically.",
      icon: <Target className="text-purple-600" size={28} />,
      link: "#",
      color: "purple"
    },
    {
      title: "Wellness Resource Library",
      description: "Access a curated collection of articles, exercises, and videos for your mental well-being.",
      icon: <BookOpen className="text-indigo-600" size={28} />,
      link: "#",
      color: "indigo"
    }
  ];

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-teal-50 rounded-full opacity-50 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                <Sparkles size={16} />
                <span>New: AI-Powered Wellness</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Mood Assistance & <br />
                <span className="bg-gradient-to-r from-blue-700 to-teal-500 bg-clip-text text-transparent">
                  Wellness Resource Management
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Take control of your mental well-being with our comprehensive suite of tools. 
                From AI-driven emotional support to personalized goal tracking, we're here for you every step of the way.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                  Start Daily Check-in
                  <ArrowRight size={20} />
                </button>
                <button className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Browse Resources
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="w-full max-w-md mx-auto relative antialiased">
                {/* Illustration placeholder - could be an image or SVG */}
                <div className="bg-gradient-to-tr from-blue-100 to-teal-100 rounded-2xl aspect-square flex items-center justify-center p-8 relative shadow-inner border border-white">
                    <img 
                        src="https://img.freepik.com/free-vector/mental-health-concept-illustration_114360-1415.jpg" 
                        alt="Mental Wellness" 
                        className="rounded-xl shadow-lg w-full h-full object-cover"
                    />
                </div>
                {/* Floating elements for visual interest */}
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 animate-bounce-slow">
                   <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <CheckCircle size={20} />
                   </div>
                   <div className="text-left">
                     <p className="text-xs text-gray-500 font-semibold">Mood Status</p>
                     <p className="text-sm font-bold text-gray-800">Stable & Positive</p>
                   </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 animate-pulse-slow">
                   <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <TrendingUp size={20} />
                   </div>
                   <div className="text-left">
                     <p className="text-xs text-gray-500 font-semibold">Weekly Goal</p>
                     <p className="text-sm font-bold text-gray-800">85% Complete</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link 
              key={index}
              to={feature.link}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="flex items-center text-blue-600 font-bold text-sm">
                <span>Explore more</span>
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Special Feature Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white mb-16 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white bg-opacity-5 -skew-x-12 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-2/3">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-2 rounded-lg backdrop-blur-md">
                    <Sparkles className="text-blue-300" size={24} />
                </div>
                <span className="text-blue-300 font-bold tracking-widest uppercase text-sm">Special Feature</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                AI Mood Support Assistant
              </h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed italic border-l-4 border-blue-400 pl-6">
                "Our advanced AI model listens without judgment, providing a safe space for you to express your feelings any time of day or night."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    "Immediate emotional crisis support",
                    "Daily mindfulness recommendations",
                    "Safe and anonymous conversations",
                    "Seamless escalation to human counsellors"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                        <CheckCircle size={18} className="text-teal-400" />
                        <span className="text-sm font-medium">{item}</span>
                    </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/3 w-full">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-teal-400 flex items-center justify-center">
                        <Brain size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">UniCare AI Assistant</p>
                        <p className="text-xs text-blue-300">Active and Ready to Help</p>
                    </div>
                </div>
                <div className="space-y-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-none">
                        <p className="text-sm">Hello! How are you feeling today? I'm here to listen and support you.</p>
                    </div>
                    <div className="bg-blue-600/30 p-3 rounded-xl rounded-tr-none ml-auto max-w-[80%] border border-blue-500/30">
                        <p className="text-sm">I've been feeling a bit overwhelmed with exams lately.</p>
                    </div>
                </div>
                <Link to="/chat" className="block w-full text-center bg-white text-blue-900 py-3 rounded-xl font-extrabold hover:bg-gray-100 transition-colors shadow-lg">
                    Start Chatting Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 text-teal-600 mb-8 border-4 border-teal-100 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">The Outcome</h2>
          <p className="text-xl text-gray-600 mb-0 font-medium leading-relaxed">
            "Students receive <span className="text-blue-600 font-bold">continuous emotional support</span> and 
            <span className="text-teal-600 font-bold"> guided wellness improvement</span> through personalized care and accessible resources."
          </p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default WellnessDashboard;
