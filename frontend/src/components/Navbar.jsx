import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, HeartPulse, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  let navLinks = [];
  if (user.role === 'admin') {
    navLinks = [
      { name: "Home", path: "/" },
      { name: "Counsellors", path: "/admin/counsellors" },
    ];
  } else if (user.role === 'counsellor') {
    navLinks = [
      { name: "Home", path: "/" },
      { name: "Availability", path: "/counsellor/availability" },
      { name: "Appointments", path: "/counsellor/appointments" },
      { name: "Session Notes", path: "/counsellor/notes" },
      { name: "History", path: "/counsellor/history" },
    ];
  } else {
    navLinks = [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Find a Counsellor", path: "/appointment/counsellors" },
      { name: "Dashboard", path: "/dashboard" },
    ];
  }

  const isActive = (path) => location.pathname === path;

  const handleRoleSwitch = (role) => {
    if (role === 'admin') {
      login('admin', 'admin-1', 'System Admin');
    } else if (role === 'counsellor') {
      login('counsellor', '1', 'Dr. Sarah Jenkins'); // mock login as first counsellor
    } else {
      login('student', 'student-1', 'Current Student');
    }
    setShowRoleMenu(false);
  };

  return (
    <nav className="glass-nav sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                <HeartPulse size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent">
                UniCare
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-all px-5 py-2.5 rounded-xl ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200 mx-4" />

            {/* Role Switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{user.role.toUpperCase()} MODE</span>
                <UserCircle size={20} className="ml-1 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in-up">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Access Level</div>
                  <button onClick={() => handleRoleSwitch('student')} className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-between group">
                    Student 
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">→</span>
                  </button>
                  <button onClick={() => handleRoleSwitch('counsellor')} className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-between group">
                    Counsellor 
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">→</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={() => handleRoleSwitch('admin')} className="w-full text-left px-4 py-2.5 text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center justify-between group">
                    Admin
                    <span className="scale-110">⚡</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-blue-600 p-2 transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 animate-fade-in-up">
          <div className="px-4 pt-2 pb-8 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-5 py-4 rounded-2xl text-lg font-bold transition-all ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Role: {user.role}</div>
              <div className="grid grid-cols-1 gap-2 p-2">
                <button onClick={() => { handleRoleSwitch('student'); setIsOpen(false); }} className="w-full text-left px-5 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Switch to Student</button>
                <button onClick={() => { handleRoleSwitch('counsellor'); setIsOpen(false); }} className="w-full text-left px-5 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Switch to Counsellor</button>
                <button onClick={() => { handleRoleSwitch('admin'); setIsOpen(false); }} className="w-full text-left px-5 py-4 text-base font-black text-blue-700 bg-blue-50 rounded-xl">Switch to Admin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;