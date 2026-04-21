import { useState } from 'react';
import toast from 'react-hot-toast';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    // 1. Determine sender identity
    let role = 'User';
    try {
      const authData = JSON.parse(localStorage.getItem('authUser'));
      if (authData && authData.role) role = authData.role;
    } catch {
      role = localStorage.getItem('userRole') || 'User';
    }
    
    // Default to a capitalized role name
    role = role.charAt(0).toUpperCase() + role.slice(1);
    const senderIdentity = isAnonymous ? `Anonymous ${role}` : `Registered ${role} (Visible)`;

    // 2. Create the feedback object
    const newFeedback = {
      id: Date.now(),
      sender: senderIdentity,
      text: feedback,
      date: new Date().toLocaleDateString()
    };

    // 3. Save to localStorage (acting as our mock DB for feedback)
    const existingFeedback = JSON.parse(localStorage.getItem('systemFeedback')) || [];
    localStorage.setItem('systemFeedback', JSON.stringify([newFeedback, ...existingFeedback]));

    // 4. Notify & Reset
    toast.success('Thank you! Your feedback has been securely sent to the Admin.');
    setFeedback('');
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 my-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Submit Platform Feedback</h3>
      <p className="text-sm text-gray-500 mb-6">Tell us what is working well, or what we can improve to help you better.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="I noticed that..."
          required
          rows="4"
          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y font-sans text-gray-700 bg-gray-50 hover:bg-white focus:bg-white"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition flex items-center justify-center group-hover:border-indigo-400">
                {isAnonymous && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition">Submit Anonymously (Hide my details)</span>
          </label>

          <button 
            type="submit" 
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-sm text-sm transition-all hover:-translate-y-0.5"
          >
            Send Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
