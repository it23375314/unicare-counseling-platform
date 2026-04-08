import React from 'react';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <StudentNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        {children}
      </div>
    </div>
  );
}
