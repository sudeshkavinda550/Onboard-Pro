import React, { useState, useEffect, useRef } from 'react';
import {
  UserGroupIcon, CheckCircleIcon, CogIcon, ShieldCheckIcon,
  ChartBarIcon, DocumentTextIcon, ExclamationTriangleIcon,
  ClockIcon, ArrowTrendingUpIcon, BellIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

// ─── Shared helpers (same logic as HR dashboard) ──────────────────────────────

/**
 * completionRate = (completedOnboardings / activeEmployees) * 100
 * Always computed from raw counts so both dashboards agree.
 */
const deriveCompletionRate = (completed, totalEmployees) =>
  totalEmployees > 0 ? Math.round((completed / totalEmployees) * 100) : 0;

/**
 * Health score uses the SAME completionRate shown on stat cards,
 * and the SAME averageCompletionDays key used by HR dashboard.
 */
const calculateHealthScore = (completionRate, avgDays, overdueTasks, totalEmployees) => {
  const clamp        = (v) => Math.max(0, Math.min(100, v));
  const inv          = (v) => clamp(100 - v);
  const daysScore    = Math.round(clamp(inv((avgDays / 30) * 100)));
  const overdueScore = Math.round(inv((overdueTasks / Math.max(totalEmployees, 1)) * 100));
  const overallHealth = Math.round((completionRate + daysScore + overdueScore) / 3);
  return { daysScore, overdueScore, overallHealth };
};

/** Same rounding as HR dashboard stat card display */
const formatAvgDays = (days) => `${Math.round(days * 10) / 10 || 0}`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  .adm-stat:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(0,0,0,0.18) !important; }
  .adm-row:hover { background:#f8fafc !important; }
`;

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color, Icon, delay = 0 }) => (
  <div className="adm-stat" style={{
    background: color, borderRadius: 18, padding: '14px 18px',
    color: '#fff', boxShadow: `0 4px 18px ${color}55`,
    animation: `slideUp 0.5s ease-out ${delay}ms both`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative', overflow: 'hidden', cursor: 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  }}>
    {Icon && (
      <div style={{ position:'absolute', right:-8, bottom:-8, opacity:0.12, pointerEvents:'none' }}>
        <Icon style={{ width:64, height:64 }} />
      </div>
    )}
    <div style={{ position:'relative', minWidth:0 }}>
      <p style={{ fontSize:10, fontWeight:700, opacity:0.85, letterSpacing:'0.07em', margin:'0 0 3px', textTransform:'uppercase', whiteSpace:'nowrap' }}>{label}</p>
      <p style={{ fontSize:11, opacity:0.70, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</p>
    </div>
    <p style={{ fontSize:38, fontWeight:800, lineHeight:1, margin:0, position:'relative', flexShrink:0 }}>{value}</p>
  </div>
);

// ─── DeptBar ──────────────────────────────────────────────────────────────────

const DeptBar = ({ dept, pct, index, animate }) => {
  const color = pct >= 90 ? '#22c55e' : pct >= 70 ? '#f97316' : pct > 0 ? '#3b82f6' : '#e2e8f0';
  const [w, setW]         = useState(0);
  const [count, setCount] = useState(0);
  const started           = useRef(false);

  useEffect(() => {
    if (!animate || started.current) return;
    started.current = true;
    const delay = index * 120, duration = 900;
    let start = null;
    const timer = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setW(Math.round(pct * e));
        setCount(Math.round(pct * e));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [animate, pct, index]);

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{dept}</span>
        <span style={{ fontSize:13, fontWeight:800, color }}>{count}%</span>
      </div>
      <div style={{ height:8, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${w}%`, background:color, borderRadius:99 }} />
      </div>
    </div>
  );
};

// ─── AnimatedDonut ────────────────────────────────────────────────────────────

const AnimatedDonut = ({ completedPct, activePct, total }) => {
  const [cp, setCp] = useState(0);
  const [ap, setAp] = useState(0);
  const R = 48, C = 2 * Math.PI * R;
  const started = useRef(false);

  useEffect(() => {
    if (started.current || (!completedPct && !activePct)) return;
    started.current = true;
    const duration = 1200;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCp(completedPct * e);
      setAp(activePct * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [completedPct, activePct]);

  const completedArc = (cp / 100) * C;
  const activeArc    = (ap / 100) * C;

  return (
    <div style={{ position:'relative', width:176, height:176 }}>
      <svg viewBox="0 0 120 120" style={{ width:176, height:176, transform:'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="60" cy="60" r={R} fill="none" stroke="#22c55e" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${completedArc} ${C}`} strokeDashoffset={0} />
        <circle cx="60" cy="60" r={R} fill="none" stroke="#3b82f6" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${activeArc} ${C}`} strokeDashoffset={-completedArc} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:28, fontWeight:800, color:'#0f172a' }}>{total}</span>
        <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>Employees</span>
      </div>
    </div>
  );
};

// ─── HealthScoreCard ──────────────────────────────────────────────────────────
// Receives already-derived values — never re-calculates independently.

const HealthScoreCard = ({ completionRate, averageCompletionDays, overdueTasks, activeEmployees }) => {
  const { daysScore, overdueScore, overallHealth } = calculateHealthScore(
    completionRate,
    averageCompletionDays,
    overdueTasks,
    activeEmployees,
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      borderRadius: 20, padding: '20px 24px', color: '#fff',
      animation: 'slideUp 0.5s ease-out 520ms both',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <SparklesIcon style={{ width:17, height:17, color:'#fff' }} />
          </div>
          <h2 style={{ fontSize:14.5, fontWeight:800, color:'#fff', margin:0 }}>Onboarding Health Score</h2>
        </div>
        <span style={{ fontSize:28, fontWeight:800 }}>
          {overallHealth}<span style={{ fontSize:16, opacity:0.8 }}>/100</span>
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        {/* completionRate here is the SAME derived value as the stat card */}
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px' }}>
          <div style={{ fontSize:11, opacity:0.8, marginBottom:4 }}>Completion Rate</div>
          <div style={{ fontSize:20, fontWeight:700 }}>{completionRate}%</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px' }}>
          <div style={{ fontSize:11, opacity:0.8, marginBottom:4 }}>Speed Score</div>
          <div style={{ fontSize:20, fontWeight:700 }}>{daysScore}<span style={{ fontSize:12, opacity:0.8 }}>/100</span></div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px' }}>
          <div style={{ fontSize:11, opacity:0.8, marginBottom:4 }}>Overdue Health <span style={{ fontSize:9, opacity:0.7 }}>(100 = no overdue)</span></div>
          <div style={{ fontSize:20, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
            {overdueScore}<span style={{ fontSize:12, opacity:0.8 }}>/100</span>
            {overdueScore === 100 && <span style={{ fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.25)', padding:'2px 8px', borderRadius:6 }}>✓ Perfect</span>}
          </div>
        </div>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:12,
        marginTop:16, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.2)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <ClockIcon style={{ width:14, height:14, opacity:0.8 }} />
          <span style={{ fontSize:12, opacity:0.9 }}>
            Avg. Time: <strong>{formatAvgDays(averageCompletionDays)} days</strong>
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <ExclamationTriangleIcon style={{ width:14, height:14, opacity:0.8 }} />
          <span style={{ fontSize:12, opacity:0.9 }}>
            Overdue: <strong>{overdueTasks} tasks</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [raw, setRaw] = useState({
    totalUsers:            0,
    activeEmployees:       0,
    totalTemplates:        0,
    hrManagers:            0,
    completedOnboardings:  0,
    activeOnboardings:     0,
    overdueTasks:          0,
    averageCompletionDays: 0,   // unified key — same as HR dashboard
    apiCompletionRate:     null, // raw API value, only used as last resort
  });
  const [deptStats, setDeptStats]     = useState([]);
  const [recentActivity, setActivity] = useState([]);
  const [systemHealth, setHealth]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [chartReady, setChartReady]   = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sR, dR, aR, hR] = await Promise.allSettled([
        adminApi.getAdminStats(),
        adminApi.getDeptStats(),
        adminApi.getRecentActivity(),
        adminApi.getSystemHealth(),
      ]);

      if (sR.status === 'fulfilled') {
        const d = sR.value.data ?? sR.value;

        // DEBUG — remove after confirming correct field name from your backend
        console.log('[AdminDashboard] raw API response:', {
          averageCompletionDays: d.averageCompletionDays,
          avgCompletionDays:     d.avgCompletionDays,
          completionRate:        d.completionRate,
          overdueTasks:          d.overdueTasks,
          completedOnboardings:  d.completedOnboardings,
          activeEmployees:       d.activeEmployees,
          _fullResponse:         d,
        });

        setRaw({
          totalUsers:            d.totalUsers            ?? 0,
          activeEmployees:       d.activeEmployees       ?? 0,
          totalTemplates:        d.totalTemplates        ?? 0,
          hrManagers:            d.hrManagers            ?? 0,
          completedOnboardings:  d.completedOnboardings  ?? 0,
          activeOnboardings:     d.activeOnboardings     ?? 0,
          overdueTasks:          d.overdueTasks          ?? 0,
          // Admin API returns avgCompletionDays (not averageCompletionDays)
          // We store under unified key averageCompletionDays for consistent display
          averageCompletionDays: d.averageCompletionDays ?? d.avgCompletionDays ?? 0,
          // Admin API does NOT return completionRate — always derive from counts
          apiCompletionRate:     null,
        });
      }

      if (dR.status === 'fulfilled') {
        const d = dR.value.data ?? dR.value;
        setDeptStats(Array.isArray(d) ? d : []);
      }
      if (aR.status === 'fulfilled') {
        const a = aR.value.data ?? aR.value;
        setActivity(Array.isArray(a) ? a : []);
      }
      if (hR.status === 'fulfilled') {
        setHealth(hR.value.data ?? hR.value);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setChartReady(true), 200);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        <div style={{ position:'relative', width:48, height:48 }}>
          <div style={{ position:'absolute', inset:0, border:'4px solid #e2e8f0', borderRadius:'50%' }} />
          <div style={{ position:'absolute', inset:0, border:'4px solid transparent', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  // ── Single source of truth for all derived display values ──────────────────
  const totalEmployees        = raw.activeEmployees       ?? 0;
  const completed             = raw.completedOnboardings  ?? 0;
  const inProgress            = raw.activeOnboardings     ?? 0;
  const notStarted            = Math.max(0, totalEmployees - completed - inProgress);
  const overdueTasks          = raw.overdueTasks          ?? 0;
  const averageCompletionDays = raw.averageCompletionDays ?? 0;

  // Always derive from actual counts (same formula as HR dashboard).
  // Only fall back to raw API value when we have zero employees (edge case).
  const completionRate = totalEmployees > 0
    ? deriveCompletionRate(completed, totalEmployees)
    : (raw.apiCompletionRate ?? 0);

  const completedPct = totalEmployees > 0 ? Math.round((completed  / totalEmployees) * 100) : 0;
  const activePct    = totalEmployees > 0 ? Math.round((inProgress / totalEmployees) * 100) : 0;

  // ── Card data (completionRate and averageCompletionDays from derived vars) ─
  const PRIMARY = [
    { label:'Total Employees',      value: totalEmployees,          sub:'Active employees',          color:'#6366f1', Icon: UserGroupIcon          },
    { label:'Onboarding Completed', value: completed,               sub:`${completionRate}% rate`,   color:'#22c55e', Icon: CheckCircleIcon         },
    { label:'In Progress',          value: inProgress,              sub:'Currently onboarding',      color:'#3b82f6', Icon: ClockIcon               },
    { label:'Overdue Tasks',        value: overdueTasks,            sub:'Needs attention',            color:'#ef4444', Icon: ExclamationTriangleIcon },
  ];

  const SECONDARY = [
    { label:'HR Managers',     value: raw.hrManagers      ?? 0,                            sub:'Active accounts', color:'#22d3ee', Icon: ShieldCheckIcon    },
    { label:'Avg. Completion', value: `${formatAvgDays(averageCompletionDays)}d`,          sub:'Average time',    color:'#a855f7', Icon: ArrowTrendingUpIcon },
    { label:'Templates',       value: raw.totalTemplates  ?? 0,                            sub:'All departments', color:'#f97316', Icon: DocumentTextIcon    },
  ];

  const AC = {
    admin:   { bg:'#eef2ff', color:'#6366f1', icon:'★' },
    system:  { bg:'#fef9c3', color:'#a16207', icon:'⚡' },
    default: { bg:'#dcfce7', color:'#15803d', icon:'👤' },
  };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:'#f1f5f9', padding:'28px 28px 40px' }}>
      <style>{SHARED_STYLES}</style>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div style={{ animation:'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize:30, fontWeight:800, color:'#0f172a', margin:0 }}>Admin Dashboard</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>System-wide overview of onboarding activities and employee progress</p>
        </div>

        {/* Primary stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {PRIMARY.map((c,i) => <StatCard key={c.label} {...c} delay={i*55} />)}
        </div>

        {/* Secondary stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {SECONDARY.map((c,i) => <StatCard key={c.label} {...c} delay={220+i*55} />)}
        </div>

        {/* Health score — explicit props from the same derived vars used above */}
        <HealthScoreCard
          completionRate={completionRate}
          averageCompletionDays={averageCompletionDays}
          overdueTasks={overdueTasks}
          activeEmployees={totalEmployees}
        />

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, animation:'slideUp 0.5s ease-out 400ms both' }}>

          {/* Dept completion bars */}
          <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', padding:'22px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChartBarIcon style={{ width:17, height:17, color:'#6366f1' }} />
                </div>
                <h2 style={{ fontSize:14.5, fontWeight:800, color:'#0f172a', margin:0 }}>Completion by Department</h2>
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:'#f1f5f9', color:'#475569' }}>{deptStats.length} Depts</span>
            </div>
            {deptStats.length > 0 ? (
              <div>
                {deptStats.map((d,i) => (
                  <DeptBar key={d.department || i} dept={d.department}
                    pct={Math.round(d.completionRate ?? 0)} index={i} animate={chartReady} />
                ))}
                <div style={{ display:'flex', gap:14, marginTop:8, flexWrap:'wrap' }}>
                  {[['#22c55e','≥ 90%'],['#f97316','70–89%'],['#3b82f6','1–69%']].map(([c,l]) => (
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} />
                      <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize:13, color:'#94a3b8', textAlign:'center', padding:'32px 0' }}>No department data available</p>
            )}
          </div>

          {/* Donut chart */}
          <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', padding:'22px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChartBarIcon style={{ width:17, height:17, color:'#6366f1' }} />
                </div>
                <h2 style={{ fontSize:14.5, fontWeight:800, color:'#0f172a', margin:0 }}>Task Status Distribution</h2>
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:'#dcfce7', color:'#15803d' }}>● Live</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
              <AnimatedDonut
                completedPct={chartReady ? completedPct : 0}
                activePct={chartReady ? activePct : 0}
                total={totalEmployees}
              />
              <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'10px 22px' }}>
                {[
                  { color:'#22c55e', label:'Completed',   value: completed  },
                  { color:'#3b82f6', label:'In Progress', value: inProgress },
                  { color:'#e2e8f0', label:'Not Started', value: notStarted },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:item.color, display:'inline-block', flexShrink:0 }} />
                    <span style={{ fontSize:12.5, color:'#475569' }}>{item.label}</span>
                    <span style={{ fontSize:12.5, fontWeight:800, color:'#0f172a' }}>({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', animation:'slideUp 0.5s ease-out 460ms both' }}>
          <div style={{ padding:'16px 24px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BellIcon style={{ width:17, height:17, color:'#6366f1' }} />
              </div>
              <h2 style={{ fontSize:14.5, fontWeight:800, color:'#0f172a', margin:0 }}>Recent Activity</h2>
            </div>
            <a href="/admin/analytics" style={{ fontSize:12.5, fontWeight:700, color:'#6366f1', textDecoration:'none' }}>View all →</a>
          </div>
          <div>
            {recentActivity.length > 0
              ? recentActivity.slice(0,6).map((log,i) => {
                  const ac = AC[log.actorRole] || AC.default;
                  return (
                    <div key={log.id || i} className="adm-row" style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 24px', borderBottom:i<5?'1px solid #f1f5f9':'none', transition:'background 0.15s' }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:ac.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, color:ac.color }}>{ac.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13.5, fontWeight:700, color:'#0f172a', margin:'0 0 2px' }}>{log.action?.replace(/_/g,' ') || 'Activity'}</p>
                        <p style={{ fontSize:12, color:'#64748b', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.detail || 'No details'}</p>
                        <p style={{ fontSize:11.5, color:'#94a3b8', margin:0 }}>{log.actorName || 'System'} · {log.timeAgo || 'Recently'}</p>
                      </div>
                    </div>
                  );
                })
              : <p style={{ fontSize:13, color:'#94a3b8', textAlign:'center', padding:'48px 24px' }}>No recent activity</p>
            }
          </div>
        </div>

        {/* System health */}
        {systemHealth && (
          <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', padding:'22px 24px', animation:'slideUp 0.5s ease-out 520ms both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CogIcon style={{ width:17, height:17, color:'#6366f1' }} />
              </div>
              <h2 style={{ fontSize:14.5, fontWeight:800, color:'#0f172a', margin:0 }}>System Health</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
              {[
                { label:'API Status',      value: systemHealth.apiStatus      || 'Unknown',             dot:'#22c55e', color:'#15803d' },
                { label:'Storage Used',    value: systemHealth.storageUsed    || 'N/A',                  dot:'#6366f1', color:'#4338ca' },
                { label:'Email Service',   value: systemHealth.emailService   || 'Unknown',              dot:'#22c55e', color:'#15803d' },
                { label:'Last Backup',     value: systemHealth.lastBackup     || 'N/A',                  dot:'#f97316', color:'#c2410c' },
                { label:'Uptime',          value: systemHealth.uptime         || 'N/A',                  dot:'#22c55e', color:'#15803d' },
                { label:'Active Sessions', value: `${systemHealth.activeSessions ?? 0} users`,           dot:'#a855f7', color:'#7e22ce' },
              ].map(item => (
                <div key={item.label} style={{ background:'#f8fafc', borderRadius:14, padding:'12px 14px', border:'1px solid #f1f5f9' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:item.dot, display:'inline-block' }} />
                    <span style={{ fontSize:10.5, color:'#94a3b8', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize:13, fontWeight:800, color:item.color, margin:0 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;