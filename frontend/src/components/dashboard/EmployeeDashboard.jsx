import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskApi, documentApi } from '../../api';
import {
  ChartBarIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon,
  ExclamationCircleIcon, ArrowTrendingUpIcon, SparklesIcon,
  CalendarIcon, BellIcon, ArrowRightIcon, ChartPieIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const getPriorityStyle = (p) => ({ high: { bg: '#fee2e2', color: '#dc2626' }, medium: { bg: '#fef9c3', color: '#a16207' }, low: { bg: '#dcfce7', color: '#15803d' } }[p?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569' });
const getStatusStyle   = (s) => ({ approved: { bg: '#dcfce7', color: '#15803d' }, rejected: { bg: '#fee2e2', color: '#dc2626' }, pending: { bg: '#fef9c3', color: '#a16207' } }[s?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569' });

const formatDate   = (d) => { if (!d) return 'N/A'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return 'N/A'; } };
const getDaysUntil = (d) => { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); };

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    progress: { completed: 0, total: 0, percentage: 0, pending: 0, in_progress: 0 },
    pendingTasks: [], recentDocuments: [], overdueTasks: [], upcomingTasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (showToast = false) => {
    try {
      setLoading(true);
      const [tasksRes, docsRes] = await Promise.all([
        taskApi.getMyTasks().catch(() => ({ data: [] })),
        documentApi.getMyDocuments().catch(() => ({ data: [] }))
      ]);
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data?.tasks || tasksRes.data?.data || []);
      const docs  = Array.isArray(docsRes.data)  ? docsRes.data  : (docsRes.data?.documents || docsRes.data?.data || []);

      const completed  = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const pending    = tasks.filter(t => t.status === 'pending').length;
      const total      = tasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      const overdueTasks   = tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date());
      const today = new Date(), nextWeek = new Date(today.getTime() + 7 * 86400000);
      const upcomingTasks  = tasks.filter(t => { if (!t.due_date || t.status === 'completed') return false; const d = new Date(t.due_date); return d >= today && d <= nextWeek; }).slice(0, 6);

      setData({
        progress: { completed, total, percentage, pending, in_progress: inProgress },
        pendingTasks:    tasks.filter(t => t.status !== 'completed').slice(0, 5),
        recentDocuments: docs.slice(0, 3),
        overdueTasks:    overdueTasks.slice(0, 3),
        upcomingTasks,
      });
      if (showToast) toast.success('Dashboard refreshed');
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  );

  const { progress, pendingTasks, recentDocuments, overdueTasks, upcomingTasks } = data;
  const barColor = progress.percentage >= 80 ? '#22c55e' : progress.percentage >= 50 ? '#3b82f6' : '#a855f7';

  const STAT_CARDS = [
    {
      label: 'COMPLETION RATE',
      value: `${progress.percentage}%`,
      sub: `${progress.completed} of ${progress.total} done`,
      color: '#22c55e',
      WatermarkIcon: ChartPieIcon,         
      onClick: undefined,
    },
    {
      label: 'PENDING TASKS',
      value: progress.pending,
      sub: 'Awaiting completion',
      color: '#f97316',
      WatermarkIcon: ClockIcon,             
      onClick: () => navigate('/employee/tasks'),
    },
    {
      label: 'IN PROGRESS',
      value: progress.in_progress,
      sub: 'Currently working on',
      color: '#3b82f6',
      WatermarkIcon: ArrowTrendingUpIcon,   
      onClick: undefined,
    },
    {
      label: 'DOCUMENTS',
      value: recentDocuments.length,
      sub: 'Files uploaded',
      color: '#a855f7',
      WatermarkIcon: DocumentTextIcon,      
      onClick: () => navigate('/employee/documents'),
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .db-stat:hover     { transform: translateY(-4px); box-shadow: 0 14px 34px rgba(0,0,0,0.16) !important; }
        .db-task-row:hover { background: #f8fafc; }
        .db-upcoming:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── Hero banner ── */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 22, padding: '28px 32px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out both' }}>
          <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', opacity: 0.05, pointerEvents: 'none' }}>
            <ChartBarIcon style={{ width: 160, height: 160, color: '#fff' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Welcome Back!</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Here's your onboarding progress overview</p>
            </div>
            <div style={{ width: 1, height: 70, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg style={{ transform: 'rotate(-90deg)', width: 80, height: 80 }}>
                  <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.14)" strokeWidth="7" fill="transparent" />
                  <circle cx="40" cy="40" r="32"
                    stroke="url(#dbGrad)" strokeWidth="7" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress.percentage / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                  <defs>
                    <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{progress.percentage}%</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', margin: '0 0 5px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Overall Progress</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>
                  {progress.completed}<span style={{ fontSize: 13, opacity: 0.55 }}>/{progress.total}</span>
                </p>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', margin: 0 }}>tasks completed</p>
              </div>
            </div>
            <div style={{ width: 1, height: 70, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Completion</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: barColor }}>
                  <ArrowTrendingUpIcon style={{ width: 12, height: 12 }} />
                  {progress.percentage >= 80 ? 'Excellent!' : progress.percentage >= 50 ? 'Good progress!' : 'Keep going!'}
                </span>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.12)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${progress.percentage}%`, background: barColor, borderRadius: 99, transition: 'width 1s ease-out', boxShadow: `0 0 10px ${barColor}88` }} />
              </div>
             
            </div>
          </div>
        </div>

        {/* ── 4 stat cards with watermark icons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {STAT_CARDS.map((card, i) => (
            <div key={card.label} className="db-stat" onClick={card.onClick}
              style={{
                background: card.color,
                borderRadius: 20,
                padding: '20px 18px',
                color: '#fff',
                boxShadow: `0 4px 18px ${card.color}55`,
                cursor: card.onClick ? 'pointer' : 'default',
                animation: `slideUp 0.5s ease-out ${i * 60}ms both`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}>
              {/* Watermark icon — bottom-right ghost */}
              <div style={{ position: 'absolute', right: -14, bottom: -14, opacity: 0.13, pointerEvents: 'none' }}>
                <card.WatermarkIcon style={{ width: 96, height: 96, color: '#fff' }} />
              </div>
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.88, letterSpacing: '0.07em', margin: '0 0 8px', textAlign: 'center' }}>{card.label}</p>
                <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, textAlign: 'center', margin: '0 0 5px' }}>{card.value}</p>
                <p style={{ fontSize: 11, opacity: 0.75, textAlign: 'center', margin: 0 }}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Overdue alert ── */}
        {overdueTasks.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #fecaca', borderLeft: '5px solid #ef4444', padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'flex-start', animation: 'slideUp 0.5s ease-out 240ms both' }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ExclamationCircleIcon style={{ width: 18, height: 18, color: '#ef4444' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', margin: '0 0 8px' }}>
                {overdueTasks.length} Overdue {overdueTasks.length === 1 ? 'Task' : 'Tasks'} Require Attention
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {overdueTasks.map(task => {
                  const ps = getPriorityStyle(task.priority);
                  return (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>{task.title}</span>
                      <span style={{ fontSize: 12, color: '#dc2626' }}>· Due {formatDate(task.due_date)}</span>
                      {task.priority && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 6, background: ps.bg, color: ps.color }}>{task.priority}</span>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => navigate('/employee/tasks')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '7px 16px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                View All Tasks <ArrowRightIcon style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        )}

        {/* ── Pending Tasks + Recent Documents ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'slideUp 0.5s ease-out 300ms both' }}>

          {/* Pending Tasks */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg, #fefce8, #fff7ed)', borderBottom: '1px solid #fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockIcon style={{ width: 17, height: 17, color: '#f97316' }} /> Pending Tasks
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#fef9c3', color: '#a16207' }}>{pendingTasks.length} Active</span>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {pendingTasks.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <SparklesIcon style={{ width: 36, height: 36, color: '#fbbf24', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>All caught up!</p>
                  <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>No pending tasks</p>
                </div>
              ) : pendingTasks.map((task, i) => {
                const days = getDaysUntil(task.due_date);
                const ps   = getPriorityStyle(task.priority);
                return (
                  <div key={task.id} className="db-task-row" onClick={() => navigate('/employee/tasks')}
                    style={{ padding: '13px 22px', borderBottom: i < pendingTasks.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                          {task.priority && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 6, background: ps.bg, color: ps.color, flexShrink: 0 }}>{task.priority}</span>}
                        </div>
                        {task.due_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#94a3b8' }}>
                            <CalendarIcon style={{ width: 11, height: 11 }} /> Due: {formatDate(task.due_date)}
                            {days !== null && <span style={{ color: days < 0 ? '#ef4444' : days <= 3 ? '#f97316' : '#22c55e', fontWeight: 700 }}>
                              ({days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d left`})
                            </span>}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 7, flexShrink: 0, background: task.status === 'in_progress' ? '#dbeafe' : '#fef9c3', color: task.status === 'in_progress' ? '#1d4ed8' : '#a16207' }}>
                        {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {pendingTasks.length > 0 && (
              <div style={{ padding: '11px 22px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                <button onClick={() => navigate('/employee/tasks')}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto', fontSize: 12.5, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  View All Tasks <ArrowRightIcon style={{ width: 13, height: 13 }} />
                </button>
              </div>
            )}
          </div>

          {/* Recent Documents */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DocumentTextIcon style={{ width: 17, height: 17, color: '#a855f7' }} /> Recent Documents
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#f3e8ff', color: '#7e22ce' }}>{recentDocuments.length} Files</span>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {recentDocuments.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <DocumentTextIcon style={{ width: 36, height: 36, color: '#d8b4fe', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>No documents yet</p>
                  <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 14px' }}>Upload your first document</p>
                  <button onClick={() => navigate('/employee/documents')}
                    style={{ padding: '8px 18px', background: '#a855f7', border: 'none', color: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Upload Document
                  </button>
                </div>
              ) : recentDocuments.map((doc, i) => {
                const ss = getStatusStyle(doc.status);
                return (
                  <div key={doc.id} className="db-task-row" onClick={() => navigate('/employee/documents')}
                    style={{ padding: '13px 22px', borderBottom: i < recentDocuments.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DocumentTextIcon style={{ width: 14, height: 14, color: '#a855f7' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</p>
                        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>Uploaded {formatDate(doc.uploadedDate || doc.created_at)}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 7, background: ss.bg, color: ss.color, flexShrink: 0 }}>
                      {doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
            {recentDocuments.length > 0 && (
              <div style={{ padding: '11px 22px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                <button onClick={() => navigate('/employee/documents')}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto', fontSize: 12.5, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  View All Documents <ArrowRightIcon style={{ width: 13, height: 13 }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming tasks grid ── */}
        {upcomingTasks.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 360ms both' }}>
            <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BellIcon style={{ width: 17, height: 17, color: '#3b82f6' }} /> Upcoming Tasks
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>(Next 7 Days)</span>
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#dbeafe', color: '#1d4ed8' }}>{upcomingTasks.length}</span>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {upcomingTasks.map(task => {
                const days = getDaysUntil(task.due_date);
                const ps   = getPriorityStyle(task.priority);
                return (
                  <div key={task.id} className="db-upcoming" onClick={() => navigate('/employee/tasks')}
                    style={{ padding: 14, background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', borderRadius: 14, border: '1px solid #bfdbfe', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, flex: 1 }}>{task.title}</h3>
                      {task.priority && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 6, background: ps.bg, color: ps.color, flexShrink: 0 }}>{task.priority}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                      <CalendarIcon style={{ width: 11, height: 11 }} /> {formatDate(task.due_date)}
                      {days !== null && days >= 0 && (
                        <span style={{ fontWeight: 700, color: days <= 1 ? '#ef4444' : days <= 3 ? '#f97316' : '#3b82f6' }}>
                          ({days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days}d`})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;