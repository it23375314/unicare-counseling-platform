import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, HeartPulse, UserCircle, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  let navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Find a Counsellor", path: "/appointment/counsellors" },
  ];

  if (user) {
    if (user.role === 'admin') {
      navLinks = [
        { name: "Home", path: "/" },
        { name: "Counsellors", path: "/admin/counsellors" },
      ];
    } else if (user.role === 'counsellor') {
      navLinks = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/counsellor/dashboard" },
      ];
    } else {
      navLinks = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Find a Counsellor", path: "/appointment/counsellors" },
        { name: "Dashboard", path: "/dashboard" },
      ];
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                <HeartPulse size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 bg-clip-text text-transparent">
                UniCare
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100 mr-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                    isActive(link.path)
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-white border border-gray-200 text-gray-700 pl-1.5 pr-4 py-1.5 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserCircle size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-none mb-0.5">{user.name}</div>
                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 group-hover:text-blue-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">My Account</div>
                        <div className="text-sm font-semibold text-gray-700 truncate">{user.name}</div>
                      </div>
                      <Link 
                        to={user.role === 'student' ? '/dashboard' : `/${user.role}/dashboard`}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 text-gray-700 transition-colors"
                      >
                        <UserCircle size={18} className="text-gray-400" />
                        <span>Dashboard</span>
                      </Link>
                      <button 
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 font-semibold transition-colors mt-1"
                      >
                        <LogOut size={18} className="text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 bg-gray-50 rounded-xl"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-2xl text-base font-semibold ${
                  isActive(link.path)
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      <div className="text-xs font-medium text-gray-400 uppercase">{user.role}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-base font-bold text-red-600 bg-red-50 rounded-2xl"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex justify-center py-4 text-base font-bold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;