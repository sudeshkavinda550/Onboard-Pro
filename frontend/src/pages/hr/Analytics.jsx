import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsApi } from '../../api';

/* ─── Inline SVG icons ─────────────────────────────────────────── */
const ChartBarIcon    = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
const ArrowPathIcon   = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
const UsersIcon       = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const CheckCircleIcon = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const ClockIcon       = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const ExclamationIcon = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;
const SparklesIcon    = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>;
const TrophyIcon      = (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;

/* ─── Stat definitions — gradient backgrounds, watermark icon ──── */
const STAT_DEFS = [
  { key:'totalEmployees',       label:'Total Employees',        Icon:UsersIcon,       grad:'linear-gradient(135deg,#3b82f6,#1d4ed8)', wColor:'#fff', shadow:'rgba(59,130,246,0.40)' },
  { key:'onboardingCompleted',  label:'Onboarding Completed',   Icon:CheckCircleIcon, grad:'linear-gradient(135deg,#22c55e,#15803d)', wColor:'#fff', shadow:'rgba(34,197,94,0.40)' },
  { key:'onboardingInProgress', label:'In Progress',            Icon:SparklesIcon,    grad:'linear-gradient(135deg,#f97316,#c2410c)', wColor:'#fff', shadow:'rgba(249,115,22,0.40)' },
  { key:'overdueTasks',         label:'Overdue Tasks',          Icon:ExclamationIcon, grad:'linear-gradient(135deg,#ef4444,#b91c1c)', wColor:'#fff', shadow:'rgba(239,68,68,0.40)' },
  { key:'completionRate',       label:'Completion Rate',        Icon:TrophyIcon,      grad:'linear-gradient(135deg,#a855f7,#7e22ce)', wColor:'#fff', shadow:'rgba(168,85,247,0.40)', suffix:'%' },
  { key:'averageCompletionDays',label:'Avg. Days to Complete',  Icon:ClockIcon,       grad:'linear-gradient(135deg,#06b6d4,#0e7490)', wColor:'#fff', shadow:'rgba(6,182,212,0.40)',  suffix:'d'  },
];

const TIME_LABELS = { week:'Last 7 days', month:'Last 30 days', quarter:'Last 90 days', year:'Last year' };

/* ─── Hook: trigger callback when element enters viewport ────────── */
const useInView = (ref, cb, deps = []) => {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { cb(); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

const Analytics = () => {
  const [timeRange,   setTimeRange]   = useState('month');
  const [stats,       setStats]       = useState({ totalEmployees:0, onboardingCompleted:0, onboardingInProgress:0, overdueTasks:0, completionRate:0, averageCompletionDays:0 });
  const [deptData,    setDeptData]    = useState({ labels:[], data:[] });
  const [taskStatus,  setTaskStatus]  = useState({ completed:0, inProgress:0, pending:0, overdue:0 });
  const [trendData,   setTrendData]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [chartReady,  setChartReady]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* chart canvas refs */
  const refBar   = useRef(null);
  const refLine  = useRef(null);
  const refDough = useRef(null);
  const refRadar = useRef(null);

  /* wrapper refs for IntersectionObserver */
  const wrapBar   = useRef(null);
  const wrapLine  = useRef(null);
  const wrapDough = useRef(null);
  const wrapRadar = useRef(null);

  /* flags: has each chart been drawn yet */
  const drawnBar   = useRef(false);
  const drawnLine  = useRef(false);
  const drawnDough = useRef(false);
  const drawnRadar = useRef(false);

  /* ── Load Chart.js once ─────────────────────────────────────────── */
  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.async = true;
    s.onload  = () => setChartReady(true);
    s.onerror = () => setError('Failed to load chart library.');
    document.body.appendChild(s);
    return () => { if (document.body.contains(s)) document.body.removeChild(s); };
  }, []);

  /* ── Fetch data ─────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      drawnBar.current = drawnLine.current = drawnDough.current = drawnRadar.current = false;

      let statsRes = { data:null }, deptRes = { data:null }, taskRes = { data:null }, trendRes = { data:null };
      if (typeof analyticsApi?.getDashboardStats     === 'function') statsRes  = await analyticsApi.getDashboardStats();
      if (typeof analyticsApi?.getDepartmentCompletion=== 'function') deptRes   = await analyticsApi.getDepartmentCompletion();
      if (typeof analyticsApi?.getTaskStatusDistribution==='function')taskRes   = await analyticsApi.getTaskStatusDistribution();
      if (typeof analyticsApi?.getCompletionTrend    === 'function') trendRes  = await analyticsApi.getCompletionTrend(timeRange);
      else if (typeof analyticsApi?.getTimeToCompletion==='function') trendRes = await analyticsApi.getTimeToCompletion();

      if (statsRes.data) setStats({ totalEmployees:statsRes.data.totalEmployees||0, onboardingCompleted:statsRes.data.onboardingCompleted||0, onboardingInProgress:statsRes.data.onboardingInProgress||0, overdueTasks:statsRes.data.overdueTasks||0, completionRate:statsRes.data.completionRate||0, averageCompletionDays:statsRes.data.averageCompletionDays||0 });
      if (deptRes.data) {
        if (Array.isArray(deptRes.data)) setDeptData({ labels:deptRes.data.map(d=>d.department||d.name||d.label||''), data:deptRes.data.map(d=>d.completionRate??d.averageCompletionDays??d.value??0) });
        else setDeptData({ labels:deptRes.data.labels||[], data:deptRes.data.data||[] });
      }
      if (taskRes.data) setTaskStatus({ completed:taskRes.data.completed||0, inProgress:taskRes.data.inProgress||0, pending:taskRes.data.pending||0, overdue:taskRes.data.overdue||0 });
      if (trendRes.data) {
        if (Array.isArray(trendRes.data)) setTrendData(trendRes.data);
        else if (trendRes.data.trend) setTrendData(trendRes.data.trend);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally { setLoading(false); }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Chart factory fns — called on scroll-into-view ────────────── */
  const buildBar = useCallback(() => {
    if (!chartReady || !window.Chart || !refBar.current || drawnBar.current) return;
    drawnBar.current = true;
    try { window.Chart.getChart(refBar.current)?.destroy(); } catch {}
    const labels = deptData.labels.length ? deptData.labels : ['—'];
    const data   = deptData.data.length   ? deptData.data   : [0];
    new window.Chart(refBar.current, {
      type:'bar',
      data:{ labels, datasets:[{ label:'Completion Rate (%)', data, backgroundColor:['rgba(99,102,241,0.78)','rgba(59,130,246,0.78)','rgba(168,85,247,0.78)','rgba(34,211,238,0.78)','rgba(249,115,22,0.78)','rgba(34,197,94,0.78)'], borderColor:['rgb(99,102,241)','rgb(59,130,246)','rgb(168,85,247)','rgb(34,211,238)','rgb(249,115,22)','rgb(34,197,94)'], borderWidth:2, borderRadius:8, borderSkipped:false }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{backgroundColor:'rgba(15,23,42,0.92)',padding:12,cornerRadius:10,callbacks:{label:ctx=>` ${ctx.parsed.y.toFixed(1)}%`}} }, scales:{ y:{beginAtZero:true,min:0,max:100,ticks:{callback:v=>v+'%',font:{size:11,family:"'Plus Jakarta Sans',sans-serif"},color:'#64748b'},grid:{color:'rgba(0,0,0,0.05)'},border:{display:false}}, x:{grid:{display:false},ticks:{font:{size:11,family:"'Plus Jakarta Sans',sans-serif"},color:'#64748b'},border:{display:false}} }, animation:{duration:1400,easing:'easeInOutQuart',delay:ctx=>ctx.type==='data'&&ctx.mode==='default'?ctx.dataIndex*100:0} },
    });
  }, [chartReady, deptData]);

  const buildLine = useCallback(() => {
    if (!chartReady || !window.Chart || !refLine.current || drawnLine.current) return;
    drawnLine.current = true;
    try { window.Chart.getChart(refLine.current)?.destroy(); } catch {}
    const step = timeRange==='week'?'Day':timeRange==='quarter'?'Week':timeRange==='year'?'Month':'Week';
    const count = timeRange==='week'?7:timeRange==='quarter'?12:timeRange==='year'?12:4;
    const lineLabels = trendData.length ? trendData.map(d=>d.label||d.week||d.month||d.period||'') : Array.from({length:count},(_,i)=>`${step} ${i+1}`);
    /* Start from 0, animate up to real value */
    const target = stats.completionRate;
    const lineVals = trendData.length
      ? trendData.map(d=>d.completionRate??d.value??0)
      : Array.from({length:lineLabels.length},(_,i)=>{ const pct=(i+1)/lineLabels.length; return Math.round(target*(0.50+0.50*pct)); });
    /* Inject 0 as first hidden anchor so animation starts from 0 */
    const animLabels = ['', ...lineLabels];
    const animVals   = [0,  ...lineVals];
    new window.Chart(refLine.current, {
      type:'line',
      data:{ labels:animLabels, datasets:[{ label:'Completion Rate %', data:animVals, borderColor:'rgb(99,102,241)', backgroundColor:'rgba(99,102,241,0.08)', borderWidth:2.5, pointBackgroundColor:'rgb(99,102,241)', pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:[0,...lineVals.map(()=>5)], pointHoverRadius:7, fill:true, tension:0.42 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{backgroundColor:'rgba(15,23,42,0.92)',padding:12,cornerRadius:10,callbacks:{label:ctx=>` ${ctx.parsed.y.toFixed(1)}%`}} }, scales:{ y:{beginAtZero:true,min:0,max:100,ticks:{callback:v=>v+'%',stepSize:20,font:{size:11,family:"'Plus Jakarta Sans',sans-serif"},color:'#64748b'},grid:{color:'rgba(0,0,0,0.05)'},border:{display:false}}, x:{grid:{display:false},ticks:{font:{size:11,family:"'Plus Jakarta Sans',sans-serif"},color:'#64748b'},border:{display:false}} }, animation:{duration:1600,easing:'easeInOutQuart'} },
    });
  }, [chartReady, trendData, stats.completionRate, timeRange]);

  const buildDough = useCallback(() => {
    if (!chartReady || !window.Chart || !refDough.current || drawnDough.current) return;
    drawnDough.current = true;
    try { window.Chart.getChart(refDough.current)?.destroy(); } catch {}
    const total = taskStatus.completed+taskStatus.inProgress+taskStatus.pending+taskStatus.overdue;
    const data  = total>0 ? [taskStatus.completed,taskStatus.inProgress,taskStatus.pending,taskStatus.overdue] : [1,1,1,1];
    new window.Chart(refDough.current, {
      type:'doughnut',
      data:{ labels:['Completed','In Progress','Pending','Overdue'], datasets:[{ data, backgroundColor:['rgba(34,197,94,0.82)','rgba(59,130,246,0.82)','rgba(251,191,36,0.82)','rgba(239,68,68,0.82)'], borderColor:['rgb(34,197,94)','rgb(59,130,246)','rgb(251,191,36)','rgb(239,68,68)'], borderWidth:2, hoverOffset:6 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'64%', plugins:{ legend:{position:'bottom',labels:{padding:16,font:{size:12,family:"'Plus Jakarta Sans',sans-serif"},usePointStyle:true,pointStyle:'circle',color:'#475569'}}, tooltip:{backgroundColor:'rgba(15,23,42,0.92)',padding:12,cornerRadius:10,callbacks:{label:ctx=>{ const t=ctx.dataset.data.reduce((a,b)=>a+b,0); const pct=t>0?((ctx.parsed/t)*100).toFixed(1):0; return ` ${ctx.label}: ${total>0?ctx.parsed:0} (${total>0?pct:0}%)`; }}} }, animation:{animateRotate:true,animateScale:true,duration:1500,easing:'easeInOutQuart',delay:ctx=>ctx.type==='data'&&ctx.mode==='default'?ctx.dataIndex*130:0} },
    });
  }, [chartReady, taskStatus]);

  const buildRadar = useCallback(() => {
    if (!chartReady || !window.Chart || !refRadar.current || drawnRadar.current) return;
    drawnRadar.current = true;
    try { window.Chart.getChart(refRadar.current)?.destroy(); } catch {}
    const cr  = Math.min(stats.completionRate,100);
    const spd = Math.max(0,Math.min(100, 100-(stats.averageCompletionDays/30)*100));
    const lov = Math.max(0,Math.min(100, 100-(stats.overdueTasks/Math.max(stats.totalEmployees,1))*100));
    const act = stats.totalEmployees>0 ? Math.round((stats.onboardingInProgress/stats.totalEmployees)*100) : 0;
    const cmp = stats.totalEmployees>0 ? Math.round((stats.onboardingCompleted/stats.totalEmployees)*100)  : 0;
    new window.Chart(refRadar.current, {
      type:'radar',
      data:{ labels:['Completion Rate','Speed','Low Overdue','Active','% Completed'], datasets:[{ label:'Health', data:[cr,spd,lov,act,cmp], backgroundColor:'rgba(168,85,247,0.15)', borderColor:'rgb(168,85,247)', borderWidth:2.5, pointBackgroundColor:'rgb(168,85,247)', pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:5, pointHoverRadius:7 }] },
      options:{ responsive:true, maintainAspectRatio:false, scales:{ r:{beginAtZero:true,min:0,max:100, ticks:{stepSize:25,callback:v=>v+'',font:{size:10},color:'#94a3b8',backdropColor:'transparent'}, grid:{color:'rgba(0,0,0,0.07)'}, angleLines:{color:'rgba(0,0,0,0.08)'}, pointLabels:{font:{size:11,family:"'Plus Jakarta Sans',sans-serif"},color:'#475569'}} }, plugins:{ legend:{display:false}, tooltip:{backgroundColor:'rgba(15,23,42,0.92)',padding:12,cornerRadius:10,callbacks:{label:ctx=>` ${ctx.parsed.r.toFixed(0)}/100`}} }, animation:{duration:1600,easing:'easeInOutQuart'} },
    });
  }, [chartReady, stats]);

  /* ── Scroll-triggered chart rendering via IntersectionObserver ─── */
  useInView(wrapBar,   buildBar,   [buildBar]);
  useInView(wrapLine,  buildLine,  [buildLine]);
  useInView(wrapDough, buildDough, [buildDough]);
  useInView(wrapRadar, buildRadar, [buildRadar]);

  /* ── Loading spinner ──────────────────────────────────────────── */
  if (loading && !lastUpdated) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ position:'relative', width:52, height:52 }}>
        <div style={{ position:'absolute', inset:0, border:'4px solid #e2e8f0', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, border:'4px solid transparent', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      </div>
    </div>
  );

  const fmtUpdated = () => { if (!lastUpdated) return '—'; const s=Math.floor((new Date()-lastUpdated)/1000); if(s<60)return'Just now'; if(s<3600)return`${Math.floor(s/60)}m ago`; return lastUpdated.toLocaleTimeString(); };
  const healthScore = Math.round((stats.completionRate + Math.max(0,100-(stats.averageCompletionDays/30)*100) + Math.max(0,100-(stats.overdueTasks/Math.max(stats.totalEmployees,1))*100)) / 3);

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:'#f1f5f9', minHeight:'100vh', padding:'28px 28px 56px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .an-stat { transition:transform .2s,box-shadow .2s; cursor:default; position:relative; overflow:hidden; border-radius:20px; }
        .an-stat:hover { transform:translateY(-4px) scale(1.02); }
        .an-card { background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:24px; }
        .tr-btn  { padding:6px 15px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer; border:none; transition:all .15s; font-family:inherit; }
      `}</style>

      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>

        {/* ── Error ── */}
        {error && (
          <div style={{ background:'#fef2f2', borderLeft:'4px solid #ef4444', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, animation:'slideUp .4s ease-out both' }}>
            <ExclamationIcon style={{ width:20, height:20, color:'#ef4444', flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13.5, fontWeight:700, color:'#b91c1c', margin:0 }}>Failed to load analytics</p>
              <p style={{ fontSize:12.5, color:'#dc2626', margin:'2px 0 0' }}>{error}</p>
            </div>
            <button onClick={fetchData} style={{ fontSize:13, fontWeight:600, color:'#b91c1c', background:'#fecaca', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit' }}>Retry</button>
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, animation:'slideUp .5s ease-out both' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(99,102,241,0.38)' }}>
                <ChartBarIcon style={{ width:21, height:21, color:'#fff' }} />
              </div>
              <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0 }}>Analytics</h1>
            </div>
            <p style={{ fontSize:13.5, color:'#64748b', margin:0 }}>Onboarding performance insights · Updated {fmtUpdated()}</p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', gap:4, background:'#e2e8f0', borderRadius:10, padding:4 }}>
              {Object.entries(TIME_LABELS).map(([val,label]) => (
                <button key={val} className="tr-btn" onClick={() => setTimeRange(val)}
                  style={{ background:timeRange===val?'#fff':'transparent', color:timeRange===val?'#6366f1':'#64748b', boxShadow:timeRange===val?'0 1px 6px rgba(0,0,0,0.10)':'none' }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={fetchData} disabled={loading}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, fontWeight:700, color:'#475569', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              <ArrowPathIcon style={{ width:15, height:15, color:'#6366f1', ...(loading?{animation:'spin .7s linear infinite'}:{}) }} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat cards — gradient bg, watermark icon, no physical icon box ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
          {STAT_DEFS.map((s, i) => {
            const { Icon } = s;
            const raw = stats[s.key];
            const val = s.suffix ? (s.key==='completionRate' ? Math.round(raw) : raw) + s.suffix : raw;
            return (
              <div key={s.key} className="an-stat"
                style={{ background:s.grad, boxShadow:`0 6px 20px ${s.shadow}`, animation:`slideUp .5s ease-out ${i*60}ms both`, padding:'22px 20px 18px' }}>

                {/* Watermark icon — large, low opacity, bottom-right */}
                <div style={{ position:'absolute', right:-10, bottom:-10, pointerEvents:'none', opacity:0.13 }}>
                  <Icon style={{ width:90, height:90, color:s.wColor, strokeWidth:1.5 }} />
                </div>

                {/* Content */}
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.72)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:10 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize:34, fontWeight:800, color:'#fff', lineHeight:1 }}>{val}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Charts row 1: Bar + Line ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          <div ref={wrapBar} className="an-card" style={{ animation:'slideUp .5s ease-out 360ms both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Completion Rate by Department</h2>
              </div>
            </div>
            <div style={{ position:'relative', height:260 }}><canvas ref={refBar} /></div>
          </div>

          <div ref={wrapLine} className="an-card" style={{ animation:'slideUp .5s ease-out 420ms both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Completion Rate Trend</h2>
              </div>
            </div>
            <div style={{ position:'relative', height:260 }}><canvas ref={refLine} /></div>
          </div>
        </div>

        {/* ── Charts row 2: Doughnut + Radar ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          <div ref={wrapDough} className="an-card" style={{ animation:'slideUp .5s ease-out 480ms both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Task Status Breakdown</h2>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
              {[{label:'Completed',val:taskStatus.completed,color:'#22c55e',bg:'#f0fdf4'},{label:'In Progress',val:taskStatus.inProgress,color:'#3b82f6',bg:'#eff6ff'},{label:'Pending',val:taskStatus.pending,color:'#f59e0b',bg:'#fffbeb'},{label:'Overdue',val:taskStatus.overdue,color:'#ef4444',bg:'#fef2f2'}].map(t => (
                <div key={t.label} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:t.bg, borderRadius:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:t.color, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:17, fontWeight:800, color:'#0f172a', lineHeight:1 }}>{t.val}</div>
                    <div style={{ fontSize:10.5, color:'#64748b', fontWeight:600 }}>{t.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position:'relative', height:220 }}><canvas ref={refDough} /></div>
          </div>

          <div ref={wrapRadar} className="an-card" style={{ animation:'slideUp .5s ease-out 540ms both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Onboarding Health Score</h2>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background:'linear-gradient(135deg,#faf5ff,#eef2ff)', borderRadius:12, border:'1px solid #e9d5ff', marginBottom:16 }}>
              {/* Watermark-style trophy — no icon box */}
              <div style={{ position:'relative', width:50, height:50, flexShrink:0 }}>
                <TrophyIcon style={{ width:50, height:50, color:'#a855f7', opacity:0.18, position:'absolute', inset:0 }} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:18, fontWeight:800, color:'#7c3aed' }}>{healthScore}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#7c3aed', letterSpacing:'.05em', textTransform:'uppercase' }}>Overall Health</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#4c1d95', lineHeight:1 }}>{healthScore}<span style={{ fontSize:14, fontWeight:600, color:'#7c3aed' }}> / 100</span></div>
              </div>
              <div style={{ marginLeft:'auto', fontSize:11, fontWeight:600, color:'#7c3aed', textAlign:'right', lineHeight:1.6 }}>Based on<br/>3 core metrics</div>
            </div>
            <div style={{ position:'relative', height:240 }}><canvas ref={refRadar} /></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;