import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, HeartPulse, UserCircle, LogOut, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const role = user?.role || 'guest';

  let navLinks = [];
  if (role === 'admin') {
    navLinks = [
      { name: "Home", path: "/" },
      { name: "Counsellors", path: "/admin/counsellors" },
      { name: "Resources", path: "/admin/resources" },
      { name: "Wellness Admin", path: "/admin-dashboard" },
    ];
  } else if (role === 'counsellor') {
    navLinks = [
      { name: "Home", path: "/" },
      { name: "Availability", path: "/counsellor/availability" },
      { name: "Appointments", path: "/counsellor/appointments" },
      { name: "Session Notes", path: "/counsellor/notes" },
      { name: "History", path: "/history" },
    ];
  } else {
    // Student or guest
    navLinks = [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Find a Counsellor", path: "/appointment/counsellors" },
      { name: "My Wellness Portal", path: "/wellness-dashboard" },
      { name: "Resources", path: "/resources" },
    ];
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <nav className="glass-nav sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
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
                className={`text-sm font-semibold transition-all px-4 py-2.5 rounded-xl ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-3" />

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{user.name?.split(' ')[0] || role.toUpperCase()}</span>
                  <UserCircle size={18} className="text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{role}</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      {user.itNumber && <p className="text-xs text-slate-500">{user.itNumber}</p>}
                    </div>
                    {role === 'student' && (
                      <>
                        <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 text-slate-700 rounded-lg">
                          📅 My Appointments
                        </Link>
                        <Link to="/saved" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 text-slate-700 rounded-lg">
                          🔖 Saved Resources
                        </Link>
                      </>
                    )}
                    {role === 'counsellor' && (
                      <Link to="/counsellor/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 text-slate-700 rounded-lg">
                        👤 My Profile
                      </Link>
                    )}
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2.5">
                  Register
                </Link>
              </div>
            )}
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
              {isAuthenticated ? (
                <>
                  <div className="px-5 text-xs font-bold text-slate-500">
                    Signed in as <span className="text-slate-800">{user.name}</span> ({role})
                  </div>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full text-left px-5 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-5 py-3 text-center font-bold text-blue-600 border border-blue-200 rounded-xl">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block px-5 py-3 text-center font-bold text-white bg-blue-600 rounded-xl">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
