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
    <nav className="bg-white shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <HeartPulse size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-teal-500 bg-clip-text text-transparent">
                UniCare
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Role Switcher */}
            <div className="relative ml-4">
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 text-sm font-medium bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100 transition-all shadow-sm"
              >
                <UserCircle size={18} className="text-blue-600" />
                <span>{user.name} ({user.role})</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Switch Role</div>
                  <button onClick={() => handleRoleSwitch('student')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Login as Student</button>
                  <button onClick={() => handleRoleSwitch('counsellor')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Login as Counsellor</button>
                  <button onClick={() => handleRoleSwitch('admin')} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700 font-medium">Login as Admin</button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 px-3">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Switch Role</div>
              <button onClick={() => { handleRoleSwitch('student'); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Login as Student</button>
              <button onClick={() => { handleRoleSwitch('counsellor'); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Login as Counsellor</button>
              <button onClick={() => { handleRoleSwitch('admin'); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-base font-medium text-blue-700 bg-blue-50 rounded-md">Login as Admin</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;