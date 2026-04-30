import React from 'react';

const ProgressBar = ({ progress, showLabel = true, size = 'md' }) => {
  const heights = { sm: 6, md: 8, lg: 10 };
  const fontSizes = { sm: 11, md: 13, lg: 14 };
  const percentage = progress?.percentage || 0;
  const h = heights[size] || 8;
  const fs = fontSizes[size] || 13;
  const barColor = percentage >= 100 ? '#22c55e' : percentage >= 60 ? '#6366f1' : '#f97316';

  return (
    <div style={{ width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: fs, fontWeight: 700, color: '#475569' }}>Progress</span>
          <span style={{ fontSize: fs, fontWeight: 800, color: percentage >= 100 ? '#15803d' : '#0f172a' }}>{percentage}%</span>
        </div>
      )}
      <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 99, height: h, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: barColor, borderRadius: 99, transition: 'width 0.8s ease-out' }} />
      </div>
      {progress && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11.5, color: '#94a3b8' }}>
          <span>{progress.completed} completed</span>
          <span>{progress.total - progress.completed} remaining</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;