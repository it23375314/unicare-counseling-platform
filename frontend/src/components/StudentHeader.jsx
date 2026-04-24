import { useNavigate } from 'react-router-dom';

export default function StudentHeader() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Student Portal</h1>
        <p className="text-sm text-gray-500">Welcome back, {userName}!</p>
      </div>
      
      <button 
        onClick={handleLogout}
        className="text-sm font-medium text-red-500 hover:text-red-700 transition"
      >
        Sign Out
      </button>
    </header>
  );
}
