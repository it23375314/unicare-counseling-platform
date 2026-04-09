import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function PlatformLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/logs`);
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch (err) {
      toast.error('Failed to fetch platform logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLogStyles = (type) => {
    const t = type?.toLowerCase() || '';
    switch(t) {
      case 'security': return { border: 'border-cyan-500', bg: 'bg-cyan-50', icon: '🔒' };
      case 'action': return { border: 'border-emerald-500', bg: 'bg-emerald-50', icon: '👤' };
      case 'warning': return { border: 'border-rose-500', bg: 'bg-rose-50', icon: '⚠️' };
      case 'system': return { border: 'border-gray-500', bg: 'bg-gray-50', icon: '⚙️' };
      default: return { border: 'border-blue-300', bg: 'bg-white', icon: '📄' };
    }
  };

  const filteredLogs = logs.filter(log => 
    filter === 'All' || (log.type && log.type.toLowerCase() === filter.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
            ← Back to Admin Dashboard
          </button>
          <div className="border-l-4 border-indigo-500 pl-4">
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-1">Platform Logs 📝</h1>
            <p className="text-gray-500">Real-time activity tracking from the cloud database.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {['All', 'Action', 'Security', 'Warning', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                filter === tab ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4" />
               <p className="text-gray-500">Connecting to Cloud Database...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map(log => {
                const styles = getLogStyles(log.type);
                return (
                  <div key={log._id} className={`flex items-center p-4 border-l-4 rounded-r-xl ${styles.bg} ${styles.border}`}>
                    <div className="text-2xl mr-4">{log.icon || styles.icon}</div>
                    <div className="flex-1">
                      <strong className="block text-gray-900">{log.title || log.message}</strong>
                      <span className="text-sm text-gray-600">User: <span className="font-semibold">{log.user}</span></span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                       {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              No real logs recorded yet for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
