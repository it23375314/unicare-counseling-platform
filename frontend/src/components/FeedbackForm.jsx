import React, { useState } from 'react';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Figure out who is sending this
    const role = localStorage.getItem('userRole') || 'User';
    
    // If anonymous, hide the identity. Otherwise, tag it with their role (in a real app, this would be their actual name)
    const senderIdentity = isAnonymous ? `Anonymous ${role}` : `Registered ${role} (Visible)`;

    // 2. Create the feedback object
    const newFeedback = {
      id: Date.now(),
      sender: senderIdentity,
      text: feedback,
      date: new Date().toLocaleDateString()
    };

    // 3. Save to our "fake database" (localStorage)
    const existingFeedback = JSON.parse(localStorage.getItem('systemFeedback')) || [];
    localStorage.setItem('systemFeedback', JSON.stringify([...existingFeedback, newFeedback]));

    // 4. Show success message
    setSubmitted(true);
    setFeedback('');
    
    // Reset the success message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>Submit System Feedback</h3>
      
      {submitted ? (
        <div style={{ padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '5px', textAlign: 'center' }}>
          Thank you! Your feedback has been sent to the Admin.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what is working well, or what we can improve..."
            required
            rows="4"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical', fontFamily: 'inherit' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="anonymous" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="anonymous" style={{ cursor: 'pointer', color: '#555', fontSize: '14px' }}>
              Submit Anonymously (Hide my details)
            </label>
          </div>

          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' }}
          >
            Send Feedback
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;