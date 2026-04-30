import React, { useState, useEffect } from 'react';
import { taskApi, taskUtils } from '../../api/taskApi';
import TaskCard from './TaskCard';
import {
  ChartBarIcon, CheckCircleIcon, ClockIcon, ArrowTrendingUpIcon,
  SparklesIcon, ExclamationTriangleIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';

/* ─── Main Component ──────────────────────────────────────────── */
const TaskChecklist = () => {
  const [tasks, setTasks]       = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0, inProgress: 0, pending: 0, overdue: 0 });
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [error, setError]       = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true); setError(null);
      const [tasksRes, progressRes] = await Promise.all([taskApi.getMyTasks(), taskApi.getTaskProgress()]);

      let raw = [];
      if (Array.isArray(tasksRes?.data))             raw = tasksRes.data;
      else if (Array.isArray(tasksRes?.data?.data))  raw = tasksRes.data.data;
      else if (Array.isArray(tasksRes?.data?.tasks)) raw = tasksRes.data.tasks;

      const formatted = raw.map(t => ({
        id: t.id, title: t.title, description: t.description,
        status: t.status || 'pending',
        taskType: t.task_type || t.taskType || 'general',
        estimatedTime: t.estimated_time || t.estimatedTime || 30,
        dueDate: t.due_date || t.dueDate,
        assignedDate: t.assigned_date || t.assignedDate,
        completedDate: t.completed_date || t.completedDate,
        resourceUrl: t.resource_url || t.resourceUrl,
        templateName: t.template_name || t.templateName,
        isRequired: t.is_required !== false && t.isRequired !== false,
        order: t.order_index || t.order || 0,
        notes: t.notes,
        priority: t.priority || 'medium',
        isOverdue: (t.due_date || t.dueDate) && new Date(t.due_date || t.dueDate) < new Date() && t.status !== 'completed',
      }));

      setTasks(taskUtils.sortTasks(formatted));

      let pd = {};
      if (progressRes?.data?.total !== undefined)            pd = progressRes.data;
      else if (progressRes?.data?.data?.total !== undefined) pd = progressRes.data.data;
      if (!pd.total && formatted.length > 0)                 pd = taskUtils.calculateProgress(formatted);

      setProgress({
        completed:  pd.completed  || 0,
        total:      pd.total      || 0,
        percentage: pd.percentage || 0,
        inProgress: pd.in_progress || pd.inProgress || 0,
        pending:    pd.pending    || 0,
        overdue:    pd.overdue    || 0,
      });
    } catch (err) {
      setError(`Failed to load tasks: ${err.message}`);
    } finally { setLoading(false); }
  };

  const updateTaskStatus = async (taskId, status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, completedDate: status === 'completed' ? new Date() : t.completedDate } : t));
    try { await taskApi.updateTaskStatus(taskId, { status }); setTimeout(() => fetchTasks(), 500); }
    catch { fetchTasks(); }
  };

  const filteredTasks = taskUtils.sortTasks(taskUtils.filterTasks(tasks, filter));
  const stats         = taskUtils.calculateProgress(tasks);

  const barColor = progress.percentage >= 80 ? '#22c55e' : progress.percentage >= 50 ? '#3b82f6' : '#6366f1';
  const barLabel = progress.percentage >= 80 ? 'Excellent!' : progress.percentage >= 50 ? 'Good progress!' : 'Keep going!';

  const STAT_CARDS = [
    { label: 'COMPLETED',   value: stats.completed,  color: '#22c55e', sub: 'Great progress!',   icon: CheckCircleIcon },
    { label: 'IN PROGRESS', value: stats.inProgress, color: '#3b82f6', sub: 'Keep going!',       icon: ChartBarIcon },
    progress.overdue > 0
      ? { label: 'OVERDUE', value: progress.overdue, color: '#ef4444', sub: 'Attention needed!', icon: ExclamationTriangleIcon }
      : { label: 'PENDING', value: stats.pending,    color: '#f97316', sub: 'Ready to start!',   icon: ClockIcon },
  ];

  const FILTER_TABS = [
    { key: 'all',         label: `All Tasks (${tasks.length})`,      activeColor: '#6366f1', activeText: '#fff' },
    { key: 'pending',     label: `Pending (${stats.pending})`,        activeColor: '#fef9c3', activeText: '#a16207', activeBorder: '#fde68a' },
    { key: 'in_progress', label: `In Progress (${stats.inProgress})`, activeColor: '#dbeafe', activeText: '#1d4ed8', activeBorder: '#93c5fd' },
    { key: 'completed',   label: `Completed (${stats.completed})`,    activeColor: '#dcfce7', activeText: '#15803d', activeBorder: '#86efac' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <p style={{ fontSize: 13.5, color: '#64748b', fontWeight: 600 }}>Loading your onboarding tasks...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .tc-refresh:hover  { background: #eef2ff !important; color: #6366f1 !important; border-color: #c7d2fe !important; }
      `}</style>

      {/* ── Dark banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: 20, padding: '26px 28px', overflow: 'hidden',
        position: 'relative', animation: 'slideUp 0.5s ease-out both',
      }}>
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.04, pointerEvents: 'none' }}>
          <ChartBarIcon style={{ width: 130, height: 130, color: '#fff' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'stretch', gap: 20, flexWrap: 'wrap' }}>

          {/* Circular ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 22px', border: '1px solid rgba(255,255,255,0.10)', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 84, height: 84 }}>
              <svg style={{ transform: 'rotate(-90deg)', width: 84, height: 84 }}>
                <circle cx="42" cy="42" r="34" stroke="rgba(255,255,255,0.13)" strokeWidth="8" fill="transparent" />
                <circle cx="42" cy="42" r="34"
                  stroke="url(#tcg)" strokeWidth="8" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress.percentage / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                <defs>
                  <linearGradient id="tcg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{progress.percentage}%</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', margin: '0 0 6px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Overall Progress</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>
                {progress.completed}<span style={{ fontSize: 15, opacity: 0.55 }}>/{progress.total}</span>
              </p>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', margin: 0 }}>tasks completed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Onboarding Progress</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: barColor }}>
                <ArrowTrendingUpIcon style={{ width: 13, height: 13 }} /> {barLabel}
              </span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.12)', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${progress.percentage}%`, background: barColor, borderRadius: 99, transition: 'width 1s ease-out', boxShadow: `0 0 12px ${barColor}99` }} />
            </div>
            
            
          </div>

        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {STAT_CARDS.map((card, i) => (
          <div key={card.label}
            style={{ background: card.color, borderRadius: 20, padding: '20px 22px', color: '#fff', boxShadow: `0 4px 18px ${card.color}55`, animation: `slideUp 0.5s ease-out ${i * 70}ms both`, cursor: 'default', position: 'relative', overflow: 'hidden' }}>
            {/* Watermark icon */}
            <div style={{ position: 'absolute', right: -14, bottom: -14, opacity: 0.13, pointerEvents: 'none' }}>
              <card.icon style={{ width: 96, height: 96, color: '#fff' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.88, letterSpacing: '0.07em', margin: '0 0 12px' }}>{card.label}</p>
              <p style={{ fontSize: 42, fontWeight: 800, margin: '0 0 5px', lineHeight: 1 }}>{card.value}</p>
              <p style={{ fontSize: 11, opacity: 0.78, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <SparklesIcon style={{ width: 11, height: 11 }} /> {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', animation: 'slideUp 0.5s ease-out 240ms both' }}>
        {FILTER_TABS.map(tab => {
          const active = filter === tab.key;
          return (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                background: active ? tab.activeColor : '#f8fafc',
                color:      active ? tab.activeText  : '#64748b',
                border:     active && tab.activeBorder ? `1.5px solid ${tab.activeBorder}` : active ? 'none' : '1.5px solid transparent',
              }}>
              {tab.label}
            </button>
          );
        })}
        <button className="tc-refresh" onClick={fetchTasks}
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          <ArrowPathIcon style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      {/* ── Task list ── */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 300ms both' }}>
        <div style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
            {filteredTasks.length} {filter === 'all' ? 'Total' : filter.replace('_', ' ')} Task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
          {filteredTasks.some(t => t.status === 'pending') && (
            <button
              onClick={() => alert(`Starting ${filteredTasks.filter(t => t.status === 'pending').length} pending tasks...`)}
              style={{ padding: '6px 14px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
              Start All Pending
            </button>
          )}
        </div>

        <div>
          {filteredTasks.map((task, i) => (
            <div key={task?.id || i} style={{ borderBottom: i < filteredTasks.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <TaskCard task={task} onStatusUpdate={updateTaskStatus} />
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <SparklesIcon style={{ width: 22, height: 22, color: '#6366f1' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 5px' }}>No tasks found</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px' }}>
                {filter === 'all' ? 'No tasks assigned yet' : `No ${filter.replace('_', ' ')} tasks`}
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')}
                  style={{ padding: '8px 18px', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  View All Tasks
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskChecklist;