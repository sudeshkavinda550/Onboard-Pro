import React from 'react';
import { XMarkIcon, DocumentTextIcon, ClockIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const TASK_TYPES = {
  read: { icon: '📖', label: 'Read Document', bg: '#dbeafe', color: '#1d4ed8' },
  upload: { icon: '📤', label: 'Upload File', bg: '#dcfce7', color: '#15803d' },
  watch: { icon: '🎬', label: 'Watch Video', bg: '#f3e8ff', color: '#7e22ce' },
  meeting: { icon: '👥', label: 'Schedule Meeting', bg: '#fef3c7', color: '#92400e' },
  form: { icon: '📝', label: 'Complete Form', bg: '#fee2e2', color: '#b91c1c' },
};

const TemplatePreview = ({ template, onClose, onAssign }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 820, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />

        <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DocumentTextIcon style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{template.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
          >
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { icon: <ClockIcon style={{ width: 18, height: 18, color: '#6366f1' }} />, bg: '#eef2ff', label: 'Duration', value: `${template.estimated_completion_days || template.estimatedCompletionDays} days` },
              { icon: <UserGroupIcon style={{ width: 18, height: 18, color: '#10b981' }} />, bg: '#ecfdf5', label: 'Department', value: template.department_name || template.department || '—' },
              { icon: <CheckCircleIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />, bg: '#fffbeb', label: 'Tasks', value: `${template.tasks_count || template.tasks?.length || 0} items` },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, background: item.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '0 0 2px', fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {template.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#374151', margin: '0 0 10px', letterSpacing: '0.04em' }}>DESCRIPTION</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0', margin: 0, lineHeight: 1.6 }}>
                {template.description}
              </p>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#374151', margin: '0 0 14px', letterSpacing: '0.04em' }}>
              TASKS ({template.tasks?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {template.tasks?.map((task, index) => {
                const type = TASK_TYPES[task.task_type || task.type] || { icon: '📋', label: task.task_type || task.type, bg: '#f1f5f9', color: '#475569' };
                return (
                  <div
                    key={task.id || index}
                    style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 14 }}
                  >
                    <div style={{ width: 36, height: 36, background: type.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {type.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{task.title}</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 7, background: type.bg, color: type.color }}>
                          {type.label}
                        </span>
                        {task.is_required && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 7, background: '#fee2e2', color: '#b91c1c' }}>Required</span>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 7, background: '#f1f5f9', color: '#64748b' }}>
                          {task.estimated_time || 30} min
                        </span>
                      </div>
                      {task.description && (
                        <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '8px 0 0', lineHeight: 1.5 }}>{task.description}</p>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', flexShrink: 0 }}>#{index + 1}</div>
                  </div>
                );
              }) || (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, margin: 0 }}>No tasks added to this template</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: 12, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 22px', fontSize: 13.5, fontWeight: 700, color: '#475569', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Close
          </button>
          <button
            onClick={onAssign}
            style={{ padding: '10px 22px', fontSize: 13.5, fontWeight: 700, color: '#fff', background: '#6366f1', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
          >
            Assign to Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;