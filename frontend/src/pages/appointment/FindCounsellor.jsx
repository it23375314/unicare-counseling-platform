import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin } from "lucide-react";
import { useCounsellorContext } from "../../context/CounsellorContext";

const FindCounsellor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { counsellors } = useCounsellorContext();

  const filteredCounsellors = counsellors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 font-serif">
            Find Your Counsellor
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Browse our directory of licensed professionals specializing in student mental health challenges. Find the perfect match for your needs and schedule.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, specialty, or condition..."
                className="pl-11 w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-4 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 shadow-sm transition">
              <Filter className="h-5 w-5" /> Filters
            </button>
          </div>
        </div>

        {/* List of Counsellors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCounsellors.map(counsellor => (
            <div key={counsellor.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row gap-6">
              <img 
                src={"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"} 
                alt={counsellor.name} 
                className="w-32 h-32 rounded-2xl object-cover shrink-0"
              />
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{counsellor.name}</h3>
                  <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">
                    <Star className="w-3 h-3 mr-1 fill-blue-700" /> {counsellor.rating || "4.8"}
                  </div>
                </div>
                
                <p className="text-sm font-medium text-teal-600 mb-3">{counsellor.specialization}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" /> {counsellor.location || "Online"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" /> {counsellor.availability?.length > 0 ? "Has Availability" : "Currently Unavailable"}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">{counsellor.price || "$30/session"}</span>
                  <Link 
                    to={`/appointment/book/${counsellor.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredCounsellors.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500 text-lg">No counsellors found matching your search criteria.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FindCounsellor;
