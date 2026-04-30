import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsApi, employeeApi } from '../../api';
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

const STAT_CARDS = [
  { key: 'totalEmployees',       label: 'TOTAL EMPLOYEES', color: '#3b82f6', WatermarkIcon: UserGroupIcon         },
  { key: 'onboardingCompleted',  label: 'COMPLETED',        color: '#f97316', WatermarkIcon: CheckCircleIcon       },
  { key: 'onboardingInProgress', label: 'IN PROGRESS',      color: '#22d3ee', WatermarkIcon: ClockIcon             },
  { key: 'overdueTasks',         label: 'OVERDUE TASKS',    color: '#dc2626', WatermarkIcon: ExclamationCircleIcon },
  { key: 'averageCompletionDays',label: 'AVG. DAYS',        color: '#2563eb', WatermarkIcon: ArrowTrendingUpIcon   },
  { key: 'completionRate',       label: 'COMPLETION RATE',  color: '#4ade80', WatermarkIcon: ChartBarIcon          },
];

const HRDashboard = () => {
  const [stats, setStats] = useState({ totalEmployees: 0, onboardingInProgress: 0, onboardingCompleted: 0, overdueTasks: 0, averageCompletionDays: 0, completionRate: 0 });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [departmentData, setDepartmentData] = useState({ labels: [], data: [] });
  const [taskStatusData, setTaskStatusData] = useState({ completed: 0, inProgress: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [chartReady, setChartReady] = useState(false);

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.async = true;
    script.onload = () => setChartReady(true);
    script.onerror = () => setError('Failed to load chart library');
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      if (!analyticsApi) throw new Error('analyticsApi is not defined.');
      if (!employeeApi) throw new Error('employeeApi is not defined.');
      let statsResponse = { data: null };
      if (typeof analyticsApi.getDashboardStats === 'function') statsResponse = await analyticsApi.getDashboardStats();
      let employeesResponse = { data: [] };
      if (typeof employeeApi.getAllEmployees === 'function') employeesResponse = await employeeApi.getAllEmployees();
      let departmentResponse = { data: null };
      if (typeof analyticsApi.getDepartmentCompletion === 'function') departmentResponse = await analyticsApi.getDepartmentCompletion();
      let taskStatusResponse = { data: null };
      if (typeof analyticsApi.getTaskStatusDistribution === 'function') taskStatusResponse = await analyticsApi.getTaskStatusDistribution();
      if (statsResponse.data) setStats({ totalEmployees: statsResponse.data.totalEmployees || 0, onboardingInProgress: statsResponse.data.onboardingInProgress || 0, onboardingCompleted: statsResponse.data.onboardingCompleted || 0, overdueTasks: statsResponse.data.overdueTasks || 0, averageCompletionDays: statsResponse.data.averageCompletionDays || 0, completionRate: statsResponse.data.completionRate || 0 });
      if (employeesResponse.data && Array.isArray(employeesResponse.data)) setRecentEmployees([...employeesResponse.data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5));
      if (departmentResponse?.data) setDepartmentData({ labels: departmentResponse.data.labels || [], data: departmentResponse.data.data || [] });
      if (taskStatusResponse?.data) setTaskStatusData({ completed: taskStatusResponse.data.completed || 0, inProgress: taskStatusResponse.data.inProgress || 0, pending: taskStatusResponse.data.pending || 0, overdue: taskStatusResponse.data.overdue || 0 });
      setLastUpdated(new Date());
    } catch (err) { console.error(err); setError(err.message || 'Failed to load dashboard data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!chartReady || !window.Chart) return; renderCharts(); }, [chartReady, departmentData, taskStatusData]);

  const renderCharts = () => {
    if (!window.Chart) return;
    const Chart = window.Chart;
    Chart.getChart(barChartRef.current)?.destroy();
    Chart.getChart(pieChartRef.current)?.destroy();
    if (barChartRef.current && departmentData.labels.length > 0) {
      new Chart(barChartRef.current, { type: 'bar', data: { labels: departmentData.labels, datasets: [{ label: 'Completion Rate (%)', data: departmentData.data, backgroundColor: ['rgba(99,102,241,0.7)','rgba(59,130,246,0.7)','rgba(16,185,129,0.7)','rgba(168,85,247,0.7)','rgba(251,191,36,0.7)'], borderColor: ['rgb(99,102,241)','rgb(59,130,246)','rgb(16,185,129)','rgb(168,85,247)','rgb(251,191,36)'], borderWidth: 2, borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, borderRadius: 8, callbacks: { label: (ctx) => `${ctx.parsed.y.toFixed(1)}%` } } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false } }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } }, animation: { duration: 2000, easing: 'easeInOutQuart', delay: (ctx) => ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 150 : 0 } } });
    }
    const totalTasks = taskStatusData.completed + taskStatusData.inProgress + taskStatusData.pending + taskStatusData.overdue;
    if (pieChartRef.current && totalTasks > 0) {
      new Chart(pieChartRef.current, { type: 'pie', data: { labels: ['Completed','In Progress','Pending','Overdue'], datasets: [{ data: [taskStatusData.completed, taskStatusData.inProgress, taskStatusData.pending, taskStatusData.overdue], backgroundColor: ['rgba(34,197,94,0.7)','rgba(59,130,246,0.7)','rgba(251,191,36,0.7)','rgba(239,68,68,0.7)'], borderColor: ['rgb(34,197,94)','rgb(59,130,246)','rgb(251,191,36)','rgb(239,68,68)'], borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 }, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, borderRadius: 8, callbacks: { label: (ctx) => { const total = ctx.dataset.data.reduce((a, b) => a + b, 0); const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0; return `${ctx.label}: ${ctx.parsed} (${pct}%)`; } } } }, animation: { animateRotate: true, animateScale: true, duration: 2000, easing: 'easeInOutQuart', delay: (ctx) => ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 200 : 0 } } });
    }
  };

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading && !lastUpdated) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .emp-row { transition: background 0.15s ease; }
        .emp-row:hover { background: #f8fafc; }
        .chart-container { position: relative; height: 280px; width: 100%; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {error && (
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <ExclamationCircleIcon style={{ width: 20, height: 20, color: '#ef4444', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#b91c1c', margin: 0 }}>Error Loading Dashboard</p>
              <p style={{ fontSize: 12.5, color: '#dc2626', margin: '2px 0 0' }}>{error}</p>
            </div>
            <button onClick={fetchDashboardData} style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c', background: '#fecaca', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        <div style={{ animation: 'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>HR Dashboard</h1>
          <p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>Overview of onboarding activities and employee progress</p>
        </div>

        {/* ── 6 stat cards with watermark icons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {STAT_CARDS.map((card, i) => {
            const WatermarkIcon = card.WatermarkIcon;
            const value = card.key === 'completionRate' ? `${Math.round(stats[card.key])}%` : card.key === 'averageCompletionDays' ? `${stats[card.key]}d` : stats[card.key];
            return (
              <div key={card.key} className="stat-card"
                style={{ background: card.color, borderRadius: 20, padding: '22px 16px 18px', color: '#fff', boxShadow: `0 4px 18px ${card.color}55`, animation: `slideUp 0.5s ease-out ${i * 60}ms both`, cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                {/* Watermark icon only */}
                <div style={{ position: 'absolute', right: -14, bottom: -14, opacity: 0.13, pointerEvents: 'none' }}>
                  <WatermarkIcon style={{ width: 90, height: 90, color: '#fff' }} />
                </div>
                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', opacity: 0.88, marginBottom: 10, lineHeight: 1.3 }}>{card.label}</div>
                  <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 20, padding: '36px 36px 32px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 360ms both' }}>
            <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', opacity: 0.12 }}>
              <BuildingOffice2Icon style={{ width: 120, height: 120, color: '#fff' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Onboarding Oversight</h2>
              <p style={{ fontSize: 13.5, color: '#94a3b8', margin: '0 0 24px', maxWidth: 420, lineHeight: 1.6 }}>Oversee onboarding tasks, assess employee progress, and finalize completion records for the current HR cycle.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.15s' }} onMouseEnter={e => e.target.style.background = '#1d4ed8'} onMouseLeave={e => e.target.style.background = '#2563eb'}>PROCESS RESULTS</button>
                <button style={{ background: 'rgba(255,255,255,0.10)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.15s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.10)'}>REVIEW TASKS</button>
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', animation: 'slideUp 0.5s ease-out 420ms both' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Recent Activities</h3>
            {stats.overdueTasks > 0 && <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}><div style={{ fontSize: 10.5, color: '#ef4444', fontWeight: 700, marginBottom: 3 }}>ALERT</div><div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{stats.overdueTasks} Overdue Task{stats.overdueTasks > 1 ? 's' : ''}</div><div style={{ fontSize: 12, color: '#64748b' }}>Require immediate attention</div></div>}
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}><div style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 700, marginBottom: 3 }}>COMPLETED</div><div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{stats.onboardingCompleted} Employees Onboarded</div><div style={{ fontSize: 12, color: '#64748b' }}>{Math.round(stats.completionRate)}% completion rate</div></div>
            <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}><div style={{ fontSize: 10.5, color: '#2563eb', fontWeight: 700, marginBottom: 3 }}>IN PROGRESS</div><div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{stats.onboardingInProgress} Active Onboardings</div><div style={{ fontSize: 12, color: '#64748b' }}>Avg. {stats.averageCompletionDays} days to complete</div></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'slideUp 0.5s ease-out 480ms both' }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #eff6ff, #eef2ff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><ChartBarIcon style={{ width: 18, height: 18, color: '#6366f1' }} />Completion by Department</h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: 20 }}>{departmentData.labels.length} Depts</span>
            </div>
            <div style={{ padding: 22 }}>
              {departmentData.labels.length > 0 ? <div className="chart-container"><canvas ref={barChartRef} /></div> : <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}><ChartBarIcon style={{ width: 40, height: 40, margin: '0 auto 10px', opacity: 0.4 }} /><p style={{ fontSize: 13.5, fontWeight: 600, margin: 0 }}>No department data</p></div>}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><ChartBarIcon style={{ width: 18, height: 18, color: '#10b981' }} />Task Status Distribution</h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '3px 10px', borderRadius: 20 }}>Live</span>
            </div>
            <div style={{ padding: 22 }}>
              {(taskStatusData.completed + taskStatusData.inProgress + taskStatusData.pending + taskStatusData.overdue) > 0 ? <div className="chart-container"><canvas ref={pieChartRef} /></div> : <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}><ChartBarIcon style={{ width: 40, height: 40, margin: '0 auto 10px', opacity: 0.4 }} /><p style={{ fontSize: 13.5, fontWeight: 600, margin: 0 }}>No task data</p></div>}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 560ms both' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #faf5ff, #fdf4ff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><UserGroupIcon style={{ width: 18, height: 18, color: '#9333ea' }} />Recent Onboarding Activities</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9333ea', background: '#f3e8ff', padding: '3px 10px', borderRadius: 20 }}>{recentEmployees.length} Employees</span>
          </div>
          <div>
            {recentEmployees.map((emp, i) => (
              <div key={emp.id || i} className="emp-row" style={{ padding: '14px 22px', borderBottom: i < recentEmployees.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(99,102,241,0.25)' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{emp.name?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name || 'Unknown Employee'}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.position || emp.department || 'No position'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 5px' }}>{Math.round(emp.progressPercentage || 0)}%</p>
                    <div style={{ width: 140, height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #6366f1, #a855f7)', width: `${emp.progressPercentage || 0}%`, transition: 'width 1s ease-out' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8, letterSpacing: '0.03em', ...(emp.onboardingStatus === 'completed' ? { color: '#059669', background: '#d1fae5', border: '1px solid #a7f3d0' } : emp.onboardingStatus === 'in_progress' ? { color: '#2563eb', background: '#dbeafe', border: '1px solid #bfdbfe' } : { color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a' }) }}>
                    {emp.onboardingStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
            {recentEmployees.length === 0 && (
              <div style={{ padding: '48px 22px', textAlign: 'center' }}>
                <UserGroupIcon style={{ width: 44, height: 44, color: '#d8b4fe', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No employee data available</p>
                <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>Employees will appear here once data is loaded</p>
              </div>
            )}
          </div>
        </div>

        {stats.overdueTasks > 0 && (
          <div style={{ background: 'linear-gradient(to right, #fef2f2, #fff1f2)', borderLeft: '4px solid #ef4444', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16, animation: 'slideUp 0.5s ease-out 640ms both' }}>
            <div style={{ width: 38, height: 38, background: '#fee2e2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ExclamationCircleIcon style={{ width: 20, height: 20, color: '#ef4444' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#7f1d1d', margin: '0 0 4px' }}>{stats.overdueTasks} Overdue Task{stats.overdueTasks > 1 ? 's' : ''} Require Attention</h3>
              <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Review and reassign overdue onboarding tasks to keep progress on track.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;