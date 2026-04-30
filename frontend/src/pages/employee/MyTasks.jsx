import React from 'react';
import TaskChecklist from '../../components/onboarding/TaskChecklist';

const MyTasks = () => {
  return (
    <div style={{ 
      fontFamily: "'Plus Jakarta Sans', sans-serif", 
      minHeight: '100vh', 
      background: '#f1f5f9', 
      padding: '28px 28px 40px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); 
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(18px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
      
      <div style={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 24,
        padding: '0 20px' 
      }}>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 4,
          animation: 'slideUp 0.5s ease-out both' 
        }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>My Tasks</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Complete all tasks to finish your onboarding process</p>
        </div>

        <TaskChecklist />
      </div>
    </div>
  );
};

export default MyTasks;