import { useNavigate } from "react-router-dom";

export default function SystemAnalytics() {
  const navigate = useNavigate();

  // Mock data representing platform overview stats
  const topics = [
    { label: "Academic Stress", value: 45, color: "#ef4444" },
    { label: "Career Anxiety", value: 30, color: "#f59e0b" },
    { label: "Personal/Relationships", value: 15, color: "#06b6d4" },
    { label: "Other", value: 10, color: "#6b7280" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
            ← Back to Admin Dashboard
          </button>
          <div className="border-l-4 border-blue-500 pl-4">
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-1">System Analytics 📊</h1>
            <p className="text-gray-500">Overview of platform usage and student wellbeing trends.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-t-4 border-blue-500 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider">Total Sessions</p>
            <h2 className="text-4xl font-black text-gray-900 mb-2">842</h2>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">↑ +12% this month</span>
          </div>
          <div className="bg-white border-t-4 border-emerald-500 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider">Avg. Satisfaction</p>
            <h2 className="text-4xl font-black text-gray-900 mb-2">4.8<span className="text-xl text-gray-400 font-normal">/5</span></h2>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">↑ +0.2 this month</span>
          </div>
          <div className="bg-white border-t-4 border-purple-500 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider">Active Counsellors</p>
            <h2 className="text-4xl font-black text-gray-900 mb-2">24</h2>
            <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded">Across 5 departments</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">Monthly Appointments</h3>
            <div className="flex items-end justify-between h-52 pt-4">
              {[45, 60, 85, 50, 110, 90].map((height, i) => (
                <div key={i} className="text-center w-12 flex flex-col justify-end h-full">
                  <div className="w-full bg-blue-50 rounded-t-lg relative" style={{ height: `${(height/110)*100}%` }}>
                    <div className="absolute -top-6 w-full text-xs font-bold text-blue-600">{height}</div>
                    <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500" style={{ height: 'max(4px, 20%)' }}></div>
                  </div>
                  <span className="text-sm text-gray-400 font-medium mt-3 block">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">Primary Topics</h3>
            <div className="space-y-5">
              {topics.map((topic, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{topic.label}</span>
                    <span className="text-sm font-bold" style={{ color: topic.color }}>{topic.value}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${topic.value}%`, backgroundColor: topic.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
