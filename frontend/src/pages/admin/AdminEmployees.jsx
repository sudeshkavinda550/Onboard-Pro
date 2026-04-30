import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon,
  XMarkIcon, ExclamationTriangleIcon, UserGroupIcon, CheckCircleIcon,
  ClockIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { adminApi } from '../../services/api';

/* ── Same axios instance as EmployeeList — used for per-employee enrichment ── */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
}, err => Promise.reject(err));

/* ─────────── Shared styles ─────────── */
const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin     { to   { transform:rotate(360deg); } }
  @keyframes slideIn  { from { transform:translateX(100%); } to { transform:translateX(0); } }
  .ae-row:hover  { background:#f8fafc !important; }
  .ae-stat:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(0,0,0,0.18)!important; }
`;

const CARD_COLORS = ['#3b82f6','#f97316','#22d3ee','#22c55e','#a855f7','#ef4444'];
const STATUS_MAP  = {
  completed:   { label:'Onboarded',   bg:'#dcfce7', color:'#15803d' },
  in_progress: { label:'In Progress', bg:'#dbeafe', color:'#1d4ed8' },
  not_started: { label:'Not Started', bg:'#f1f5f9', color:'#475569' },
};
const INPUT_DARK = {
  padding:'9px 14px', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:10,
  background:'rgba(255,255,255,0.08)', fontSize:13, color:'#fff', outline:'none',
  fontFamily:'inherit', boxSizing:'border-box',
};

/* ─────────── Helpers ─────────── */
const getStatusInfo = (s) => STATUS_MAP[s] || STATUS_MAP.not_started;
const PER_PAGE = 10;

/* ── Profile picture URL — exact copy from EmployeeList ── */
const getProfilePicUrl = (employee) => {
  const raw = employee?.profile_picture || employee?.avatar || employee?.profilePicture || employee?.photo;
  if (!raw || raw === 'null' || raw === 'undefined') return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const baseURL = (process.env.REACT_APP_API_URL?.replace('/api/v1','').replace('/api','')) || 'http://localhost:5000';
  return `${baseURL}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

/* ── AvatarCircle — exact copy from EmployeeList ── */
const AvatarCircle = ({ employee, size=38, fontSize=15, radius=12 }) => {
  const color = CARD_COLORS[(employee?.name?.charCodeAt(0)||0) % CARD_COLORS.length];
  const [imgError, setImgError] = React.useState(false);
  const picUrl = getProfilePicUrl(employee);
  if (picUrl && !imgError) {
    return (
      <img src={picUrl} alt={employee?.name||'Employee'}
        style={{ width:size, height:size, borderRadius:radius, objectFit:'cover', flexShrink:0, border:`2px solid ${color}55` }}
        onError={() => setImgError(true)} />
    );
  }
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize, fontWeight:800, color:'#fff', boxShadow:`0 2px 8px ${color}44` }}>
      {employee?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

/* ─────────── UI pieces ─────────── */
const StatCard = ({ label, value, color, Icon, delay=0 }) => (
  <div className="ae-stat" style={{ background:color, borderRadius:18, padding:'16px 20px', color:'#fff', boxShadow:`0 4px 18px ${color}55`, position:'relative', overflow:'hidden', cursor:'default', animation:`slideUp 0.5s ease-out ${delay}ms both`, transition:'transform 0.2s,box-shadow 0.2s' }}>
    {Icon && <div style={{ position:'absolute', right:-8, bottom:-8, opacity:0.12 }}><Icon style={{ width:70, height:70 }} /></div>}
    <p style={{ fontSize:10.5, fontWeight:700, opacity:0.88, letterSpacing:'0.07em', margin:'0 0 8px', position:'relative', textTransform:'uppercase' }}>{label}</p>
    <p style={{ fontSize:40, fontWeight:800, lineHeight:1, margin:0, position:'relative' }}>{value}</p>
  </div>
);

const MiniProgressBar = ({ value }) => {
  const n = Math.round(Number(value)||0);
  const color = n===100 ? '#22c55e' : n>50 ? '#6366f1' : '#f97316';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:6, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${Math.min(n,100)}%`, background:color, borderRadius:99, transition:'width 0.8s ease-out' }} />
      </div>
      <span style={{ fontSize:12.5, fontWeight:800, color, minWidth:32, textAlign:'right' }}>{n}%</span>
    </div>
  );
};

/* ─────────── Main ─────────── */
const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [filterStatus, setStatus] = useState('all');
  const [filterDept, setDept]     = useState('all');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);

  useEffect(() => { fetchEmployees(); }, []);

  /* ── Fetch + enrich — identical pattern to EmployeeList.jsx ── */
  const fetchEmployees = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await adminApi.getAllEmployees();
      const data = res.data || res;
      let rawList = Array.isArray(data) ? data
                  : Array.isArray(data?.data) ? data.data
                  : [];

      const enriched = await Promise.all(rawList.map(async (emp) => {
        try {
          if (!emp?.id) return { ...emp, progress:0, onboardingStatus:'not_started', total_tasks:0, completed_tasks:0 };

          /* ── 1. Progress ── */
          let progressData = {};
          try {
            const pr = await api.get(`/employees/${emp.id}/progress`);
            progressData = pr.data?.data || pr.data || {};
          } catch {
            progressData = {
              total:      emp.total_tasks        || 0,
              completed:  emp.completed_tasks    || 0,
              percentage: emp.progress_percentage ?? emp.progressPercentage ?? 0,
            };
          }
          const totalTasks     = progressData.total     || progressData.total_tasks     || 0;
          const completedTasks = progressData.completed || progressData.completed_tasks || 0;
          const percentage     = progressData.percentage ?? progressData.progress_percentage
            ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
          const onboardingStatus =
            (percentage >= 100 && totalTasks > 0) ? 'completed'
            : percentage > 0 ? 'in_progress'
            : (emp.onboarding_status || emp.onboardingStatus || 'not_started');

          /* ── 2. Profile picture — fetch /employees/:id if not already present ── */
          let profile_picture = emp.profile_picture || emp.profilePicture || emp.avatar || null;
          if (!profile_picture) {
            try {
              const detail = await api.get(`/employees/${emp.id}`);
              const d = detail.data?.data || detail.data || {};
              profile_picture = d.profile_picture || d.profilePicture || d.avatar || null;
            } catch { /* silently fall back to initials */ }
          }

          return {
            ...emp,
            profile_picture,
            progress: percentage,
            onboardingStatus,
            totalTasks,
            completedTasks,
          };
        } catch {
          return {
            ...emp,
            progress: emp.progress_percentage ?? emp.progressPercentage ?? 0,
            onboardingStatus: emp.onboarding_status || emp.onboardingStatus || 'not_started',
            totalTasks: 0, completedTasks: 0,
          };
        }
      }));

      /* Deduplicate by id */
      const seen   = new Set();
      const unique = enriched.filter(emp => {
        const key = String(emp.id || '');
        if (!key || seen.has(key)) return false;
        seen.add(key); return true;
      });

      setEmployees(unique);
    } catch {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── Derived state ─────────── */
  const departments = ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];
  const filtered    = employees.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !s
      || (e.name||'').toLowerCase().includes(s)
      || (e.email||'').toLowerCase().includes(s)
      || (e.position||'').toLowerCase().includes(s);
    return matchSearch
      && (filterStatus==='all' || e.onboardingStatus===filterStatus)
      && (filterDept==='all'   || e.department===filterDept);
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const hasFilters = search || filterStatus!=='all' || filterDept!=='all';
  const completed  = employees.filter(e => e.onboardingStatus==='completed').length;
  const inProgress = employees.filter(e => e.onboardingStatus==='in_progress').length;

  /* ─────────── Loading / error ─────────── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f1f5f9' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ position:'relative', width:48, height:48 }}>
        <div style={{ position:'absolute', inset:0, border:'4px solid #e2e8f0', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, border:'4px solid transparent', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:20, padding:40, textAlign:'center', maxWidth:400 }}>
        <ExclamationTriangleIcon style={{ width:44, height:44, color:'#ef4444', margin:'0 auto 14px' }} />
        <p style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:'0 0 8px' }}>{error}</p>
        <button onClick={fetchEmployees} style={{ padding:'10px 24px', background:'#6366f1', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Retry</button>
      </div>
    </div>
  );

  /* ─────────── Render ─────────── */
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:'#f1f5f9', padding:'28px 28px 40px' }}>
      <style>{SHARED}</style>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexDirection:'column', gap:22 }}>

        {/* Header */}
        <div style={{ animation:'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize:30, fontWeight:800, color:'#0f172a', margin:0 }}>All Employees</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>Monitor onboarding progress for {employees.length} employees across all departments</p>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <StatCard label="Total Employees" value={employees.length}                          color="#6366f1" Icon={UserGroupIcon}        delay={0}   />
          <StatCard label="Onboarded"        value={completed}                                 color="#22c55e" Icon={CheckCircleIcon}     delay={60}  />
          <StatCard label="In Progress"      value={inProgress}                                color="#3b82f6" Icon={ClockIcon}           delay={120} />
          <StatCard label="Not Started"      value={employees.length - completed - inProgress} color="#f97316" Icon={ArrowTrendingUpIcon} delay={180} />
        </div>

        {/* Dark filter banner */}
        <div style={{ background:'linear-gradient(135deg,#1e293b 0%,#334155 100%)', borderRadius:20, padding:'22px 28px', position:'relative', overflow:'hidden', animation:'slideUp 0.5s ease-out 180ms both' }}>
          <div style={{ position:'absolute', right:24, top:'50%', transform:'translateY(-50%)', opacity:0.06, pointerEvents:'none' }}>
            <UserGroupIcon style={{ width:110, height:110, color:'#fff' }} />
          </div>
          <div style={{ position:'relative', zIndex:1, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <MagnifyingGlassIcon style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8' }} />
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search employees…"
                style={{ ...INPUT_DARK, width:'100%', paddingLeft:36 }}
                onFocus={e=>e.target.style.borderColor='#6366f1'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
            </div>
            <select value={filterStatus} onChange={e=>{setStatus(e.target.value);setPage(1);}}
              style={{ ...INPUT_DARK, minWidth:140 }}
              onFocus={e=>e.target.style.borderColor='#6366f1'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'}>
              <option value="all"         style={{color:'#0f172a'}}>All Status</option>
              <option value="not_started" style={{color:'#0f172a'}}>Not Started</option>
              <option value="in_progress" style={{color:'#0f172a'}}>In Progress</option>
              <option value="completed"   style={{color:'#0f172a'}}>Onboarded</option>
            </select>
            <select value={filterDept} onChange={e=>{setDept(e.target.value);setPage(1);}}
              style={{ ...INPUT_DARK, minWidth:160 }}
              onFocus={e=>e.target.style.borderColor='#6366f1'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'}>
              {departments.map(d=><option key={d} value={d} style={{color:'#0f172a'}}>{d==='all'?'All Departments':d}</option>)}
            </select>
            {hasFilters && (
              <button onClick={()=>{setSearch('');setStatus('all');setDept('all');setPage(1);}}
                style={{ padding:'9px 16px', background:'rgba(255,255,255,0.10)', border:'1.5px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.70)', borderRadius:10, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Clear</button>
            )}
            <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.45)', fontWeight:700, marginLeft:'auto' }}>{filtered.length} results</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', animation:'slideUp 0.5s ease-out 240ms both' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.2fr 1.5fr 1.3fr 80px', padding:'12px 20px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
            {['Employee','Department','HR Manager','Progress','Status','Action'].map(h=>(
              <span key={h} style={{ fontSize:10.5, fontWeight:700, color:'#94a3b8', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</span>
            ))}
          </div>
          {paginated.length===0 ? (
            <p style={{ fontSize:13.5, color:'#94a3b8', textAlign:'center', padding:'64px 24px' }}>
              {hasFilters ? 'No employees match your filters.' : 'No employees found.'}
            </p>
          ) : paginated.map((emp, i) => {
            const st = getStatusInfo(emp.onboardingStatus);
            return (
              <div key={emp.id||i} className="ae-row"
                style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.2fr 1.5fr 1.3fr 80px', padding:'13px 20px', borderBottom:i<paginated.length-1?'1px solid #f1f5f9':'none', alignItems:'center', background:'#fff', animation:`slideUp 0.4s ease-out ${i*30}ms both`, transition:'background 0.15s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <AvatarCircle employee={emp} size={38} fontSize={15} radius={12} />
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:13.5, fontWeight:700, color:'#0f172a', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.name||'Unnamed'}</p>
                    <p style={{ fontSize:12, color:'#64748b', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.position||emp.email||'—'}</p>
                  </div>
                </div>
                <span style={{ fontSize:13, color:'#475569' }}>{emp.department||'—'}</span>
                <span style={{ fontSize:13, color:'#475569' }}>{emp.hrName||emp.hr_name||'—'}</span>
                <MiniProgressBar value={emp.progress} />
                <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 10px', borderRadius:8, background:st.bg, color:st.color, display:'inline-block' }}>{st.label}</span>
                <button onClick={()=>setSelected(emp)}
                  style={{ fontSize:12.5, fontWeight:700, color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}
                  onMouseEnter={e=>e.currentTarget.style.textDecoration='underline'}
                  onMouseLeave={e=>e.currentTarget.style.textDecoration='none'}>Details</button>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ padding:'8px', border:'1.5px solid #e2e8f0', borderRadius:10, background:'#fff', cursor:page===1?'not-allowed':'pointer', opacity:page===1?0.4:1 }}>
              <ChevronLeftIcon style={{ width:14, height:14, color:'#475569' }} />
            </button>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>{
              const pn = totalPages<=7?i+1:page<=4?i+1:page>=totalPages-3?totalPages-6+i:page-3+i;
              return (
                <button key={pn} onClick={()=>setPage(pn)}
                  style={{ width:36, height:36, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:'1.5px solid #e2e8f0', transition:'all 0.15s', background:pn===page?'#6366f1':'#fff', color:pn===page?'#fff':'#475569', borderColor:pn===page?'#6366f1':'#e2e8f0' }}>
                  {pn}
                </button>
              );
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ padding:'8px', border:'1.5px solid #e2e8f0', borderRadius:10, background:'#fff', cursor:page===totalPages?'not-allowed':'pointer', opacity:page===totalPages?0.4:1 }}>
              <ChevronRightIcon style={{ width:14, height:14, color:'#475569' }} />
            </button>
          </div>
        )}
      </div>

      {/* Detail slide panel */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:50, display:'flex', justifyContent:'flex-end' }}
          onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <div style={{ background:'#fff', width:400, height:'100%', overflowY:'auto', padding:'28px 24px', display:'flex', flexDirection:'column', gap:18, animation:'slideIn 0.3s ease-out' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:0 }}>Employee Details</h2>
              <button onClick={()=>setSelected(null)} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', border:'none', borderRadius:9, cursor:'pointer' }}>
                <XMarkIcon style={{ width:16, height:16, color:'#475569' }} />
              </button>
            </div>
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <AvatarCircle employee={selected} size={64} fontSize={22} radius={20} />
              </div>
              <p style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:'0 0 4px' }}>{selected.name||'Unnamed'}</p>
              <p style={{ fontSize:13, color:'#64748b', margin:'0 0 10px' }}>{selected.email||'No email'}</p>
              <span style={{ fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:8, background:getStatusInfo(selected.onboardingStatus).bg, color:getStatusInfo(selected.onboardingStatus).color }}>
                {getStatusInfo(selected.onboardingStatus).label}
              </span>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:14, padding:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', margin:'0 0 10px', letterSpacing:'0.05em', textTransform:'uppercase' }}>Overall Progress</p>
              <MiniProgressBar value={selected.progress} />
              <p style={{ fontSize:12, color:'#94a3b8', margin:'8px 0 0', textAlign:'right' }}>
                {selected.completedTasks||0} / {selected.totalTasks||0} tasks
              </p>
            </div>
            <div>
              {[
                ['Position',   selected.position],
                ['Department', selected.department],
                ['HR Manager', selected.hrName||selected.hr_name],
                ['Template',   selected.templateName],
                ['Start Date', (selected.startDate||selected.start_date) ? new Date(selected.startDate||selected.start_date).toLocaleDateString() : null],
                ['Completed',  selected.completedDate ? new Date(selected.completedDate).toLocaleDateString() : null],
              ].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <span style={{ fontSize:13, color:'#64748b' }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;