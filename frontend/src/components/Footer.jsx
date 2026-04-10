import { Link } from "react-router-dom";
import { HeartPulse, Globe, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-10 overflow-hidden relative z-20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/30">
                <HeartPulse size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                UniCare
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
              Dedicated to empowering students with accessible, professional, and private mental health support across all campuses.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Globe size={18} />} />
              <SocialIcon icon={<Mail size={18} />} />
              <SocialIcon icon={<Phone size={18} />} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:ml-auto">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/appointment/counsellors" label="Find Help" />
              <FooterLink to="/dashboard" label="Student Portal" />
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:ml-auto">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <FooterLink to="#" label="Privacy Policy" />
              <FooterLink to="#" label="Terms of Service" />
              <FooterLink to="#" label="Cookie Policy" />
              <FooterLink to="#" label="Security" />
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:ml-auto space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Support</h4>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm flex flex-col">
                <span className="text-slate-500 text-[10px] uppercase font-black tracking-tighter">Email Support</span>
                <span className="text-white font-medium">support@unicare.edu</span>
              </p>
              <p className="text-slate-400 text-sm flex flex-col">
                <span className="text-slate-500 text-[10px] uppercase font-black tracking-tighter">Crisis Hotline</span>
                <span className="text-white font-medium">1-800-UNICARE</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} UniCare platform. Built for university ecosystems worldwide.
          </p>
          <div className="flex gap-6 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-slate-400 hover:text-blue-500 text-sm font-medium transition-colors duration-200 flex items-center group">
      <span className="w-0 group-hover:w-2 h-px bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-300" />
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon }) => (
  <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
    {icon}
  </a>
);

export default Footer;
