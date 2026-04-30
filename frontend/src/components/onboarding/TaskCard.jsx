import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon, ClockIcon, DocumentTextIcon, UserCircleIcon,
  AcademicCapIcon, VideoCameraIcon, WrenchScrewdriverIcon, CalendarIcon,
  ExclamationTriangleIcon, ArrowRightIcon, PlayIcon, BookOpenIcon,
} from '@heroicons/react/24/outline';

const ICON_MAP = {
  documentation: DocumentTextIcon, training: AcademicCapIcon, setup: WrenchScrewdriverIcon,
  meeting: CalendarIcon, profile: UserCircleIcon, video: VideoCameraIcon,
  general: DocumentTextIcon, handbook: BookOpenIcon, read_handbook: BookOpenIcon,
};

const ROUTE_MAP = {
  documentation: '/employee/documents',  profile:       '/employee/profile',
  training:      '/employee/training',   video:         '/employee/training/video',
  setup:         '/employee/setup',      meeting:       '/employee/meetings',
  handbook:      '/employee/handbook',   read_handbook: '/employee/handbook',
};

const PRIORITY_STYLE = {
  critical: { bg: '#fee2e2', color: '#dc2626' }, high: { bg: '#ffedd5', color: '#c2410c' },
  medium:   { bg: '#fef9c3', color: '#a16207' }, low:  { bg: '#f1f5f9', color: '#475569' },
};

const STATUS_STYLE = {
  pending:     { bg: '#fef9c3', color: '#a16207' },
  in_progress: { bg: '#dbeafe', color: '#1d4ed8' },
  completed:   { bg: '#dcfce7', color: '#15803d' },
};

const TaskCard = ({ task, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const getTaskRoute = (t) => {
    // Handbook detection — by taskType OR title keywords
    if (
      t.taskType === 'handbook' || t.taskType === 'read_handbook' ||
      t.title?.toLowerCase().includes('handbook') ||
      t.title?.toLowerCase().includes('company policy') ||
      t.title?.toLowerCase().includes('read policy')
    ) return '/employee/handbook';
    if (t.title?.toLowerCase().includes('upload') || t.title?.toLowerCase().includes('document')) return '/employee/documents';
    if (t.title?.toLowerCase().includes('profile') || t.title?.toLowerCase().includes('information form')) return '/employee/profile';
    return ROUTE_MAP[t.taskType] || null;
  };

  const handleStartTask = async () => {
    const route = getTaskRoute(task);
    setIsUpdating(true);
    try {
      await onStatusUpdate(task.id, 'in_progress');
      if (route) navigate(route, { state: { taskId: task.id, taskTitle: task.title, returnTo: '/employee/tasks' } });
    } catch { } finally { if (!getTaskRoute(task)) setIsUpdating(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try { await onStatusUpdate(task.id, newStatus); }
    catch { } finally { setIsUpdating(false); }
  };

  const TaskIcon = ICON_MAP[task.taskType] || DocumentTextIcon;
  const ss = STATUS_STYLE[task.status] || STATUS_STYLE.pending;
  const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.low;

  const iconBg = task.status === 'completed' ? '#dcfce7' : task.status === 'in_progress' ? '#dbeafe' : '#f1f5f9';
  const iconColor = task.status === 'completed' ? '#15803d' : task.status === 'in_progress' ? '#1d4ed8' : '#64748b';

  const Spinner = () => (
    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  );

  return (
    <div style={{ padding: '18px 22px', background: task.isOverdue ? '#fff7f7' : '#fff', transition: 'background 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onMouseEnter={e => e.currentTarget.style.background = task.isOverdue ? '#fff0f0' : '#fafafa'}
      onMouseLeave={e => e.currentTarget.style.background = task.isOverdue ? '#fff7f7' : '#fff'}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <TaskIcon style={{ width: 18, height: 18, color: iconColor }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{task.title}</h3>
              {task.isOverdue && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>
                  <ExclamationTriangleIcon style={{ width: 10, height: 10 }} /> Overdue
                </span>
              )}
            </div>

            {task.description && (
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: ss.bg, color: ss.color }}>
                {task.status === 'completed' ? '✓ Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
              {task.priority && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: ps.bg, color: ps.color }}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
              {task.estimatedTime && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#94a3b8' }}>
                  <ClockIcon style={{ width: 12, height: 12 }} /> ~{task.estimatedTime} min
                </span>
              )}
              {task.dueDate && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: task.isOverdue ? '#dc2626' : '#94a3b8', fontWeight: task.isOverdue ? 700 : 400 }}>
                  <CalendarIcon style={{ width: 12, height: 12 }} />
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {task.resourceUrl && (
              <a href={task.resourceUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>
                <DocumentTextIcon style={{ width: 12, height: 12 }} /> View Resource
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {task.status === 'pending' && (
            <button onClick={handleStartTask} disabled={isUpdating}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#6366f1', border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700, borderRadius: 10, cursor: isUpdating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', opacity: isUpdating ? 0.8 : 1, transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!isUpdating) e.currentTarget.style.background = '#4f46e5'; }}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
              {isUpdating ? <><Spinner /> Starting...</> : <><PlayIcon style={{ width: 14, height: 14 }} /> Start Task</>}
            </button>
          )}

          {task.status === 'in_progress' && (
            <>
              <button onClick={() => { const route = getTaskRoute(task); if (route) navigate(route, { state: { taskId: task.id, taskTitle: task.title, returnTo: '/employee/tasks' } }); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#3b82f6', border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700, borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}>
                <ArrowRightIcon style={{ width: 14, height: 14 }} /> Continue
              </button>
              <button onClick={() => handleStatusChange('completed')} disabled={isUpdating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#22c55e', border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 700, borderRadius: 10, cursor: isUpdating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', opacity: isUpdating ? 0.8 : 1, transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!isUpdating) e.currentTarget.style.background = '#16a34a'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}>
                {isUpdating ? <><Spinner /> Saving...</> : <><CheckCircleIcon style={{ width: 14, height: 14 }} /> Complete</>}
              </button>
            </>
          )}

          {task.status === 'completed' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#dcfce7', border: '1.5px solid #86efac', color: '#15803d', fontSize: 12.5, fontWeight: 700, borderRadius: 10, whiteSpace: 'nowrap' }}>
              <CheckCircleIcon style={{ width: 14, height: 14 }} /> Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;