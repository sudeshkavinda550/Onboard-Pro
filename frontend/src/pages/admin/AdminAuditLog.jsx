import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon, ArrowDownTrayIcon,
  ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  .al-row:hover{background:#f8fafc !important;}
`;

const ROLE_MAP = {
  admin:    { bg:'#eef2ff', color:'#6366f1', label:'ADMIN', dot:'#6366f1', icon:'★' },
  hr:       { bg:'#dbeafe', color:'#1d4ed8', label:'HR',    dot:'#3b82f6', icon:'👔' },
  employee: { bg:'#dcfce7', color:'#15803d', label:'EMP',   dot:'#22c55e', icon:'👤' },
  system:   { bg:'#fef9c3', color:'#a16207', label:'SYS',   dot:'#f97316', icon:'⚡' },
};

const ACTION_TYPES = [
  'all','login','logout','create_account','suspend_account','delete_account',
  'create_template','assign_template','complete_task','upload_document',
  'approve_document','reject_document','send_reminder','onboarding_complete','update_settings',
];

const INPUT_DARK = {
  padding:'9px 14px', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:10,
  background:'rgba(255,255,255,0.08)', fontSize:13, color:'#fff', outline:'none',
  fontFamily:'inherit', boxSizing:'border-box',
};

const PER_PAGE = 15;

const AdminAuditLog = () => {
  const [logs, setLogs]                 = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [filterRole, setFilterRole]     = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch]             = useState('');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');

  useEffect(() => { fetchLogs(); }, [page, filterRole, filterAction, search, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLog({
        page, limit: PER_PAGE,
        role:   filterRole   !== 'all' ? filterRole   : undefined,
        action: filterAction !== 'all' ? filterAction : undefined,
        search: search||undefined, dateFrom:dateFrom||undefined, dateTo:dateTo||undefined,
      });
      setLogs(res.data.logs||[]);
      setTotal(res.data.total||0);
    } catch {} finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.exportAuditLog({ responseType:'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href=url; a.download='audit-log.csv'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed.'); }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:'#f1f5f9', padding:'28px 28px 40px' }}>
      <style>{SHARED}</style>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexDirection:'column', gap:22 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, animation:'slideUp 0.5s ease-out both' }}>
          <div>
            <h1 style={{ fontSize:30, fontWeight:800, color:'#0f172a', margin:0 }}>Audit Log</h1>
            <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>Complete record of all system actions for compliance and debugging</p>
          </div>
          <button onClick={handleExport}
            style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'#6366f1', border:'none', color:'#fff', borderRadius:12, fontSize:13.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}
            onMouseEnter={e=>e.currentTarget.style.background='#4f46e5'}
            onMouseLeave={e=>e.currentTarget.style.background='#6366f1'}>
            <ArrowDownTrayIcon style={{ width:15, height:15 }} /> Export CSV
          </button>
        </div>

        {/* Dark filter banner */}
        <div style={{ background:'linear-gradient(135deg,#1e293b 0%,#334155 100%)', borderRadius:20, padding:'24px 28px', position:'relative', overflow:'hidden', animation:'slideUp 0.5s ease-out 80ms both' }}>
          <div style={{ position:'absolute', right:24, top:'50%', transform:'translateY(-50%)', opacity:0.06, pointerEvents:'none' }}>
            <ClipboardDocumentListIcon style={{ width:110, height:110, color:'#fff' }} />
          </div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 200px 140px 140px auto', gap:10, marginBottom:14 }}>
              <div style={{ position:'relative' }}>
                <MagnifyingGlassIcon style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8' }} />
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search actor, action, detail…"
                  style={{ ...INPUT_DARK, width:'100%', paddingLeft:36 }}
                  onFocus={e=>e.target.style.borderColor='#6366f1'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
              </div>
              <select value={filterRole} onChange={e=>{setFilterRole(e.target.value);setPage(1);}}
                style={{ ...INPUT_DARK, width:'100%' }}
                onFocus={e=>e.target.style.borderColor='#6366f1'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'}>
                <option value="all" style={{color:'#0f172a'}}>All Roles</option>
                {['admin','hr','employee','system'].map(r=><option key={r} value={r} style={{color:'#0f172a'}}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select>
              <select value={filterAction} onChange={e=>{setFilterAction(e.target.value);setPage(1);}}
                style={{ ...INPUT_DARK, width:'100%' }}
                onFocus={e=>e.target.style.borderColor='#6366f1'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'}>
                {ACTION_TYPES.map(a=><option key={a} value={a} style={{color:'#0f172a'}}>{a==='all'?'All Actions':a.replace(/_/g,' ')}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}}
                style={{ ...INPUT_DARK, width:'100%', colorScheme:'dark' }}
                onFocus={e=>e.target.style.borderColor='#6366f1'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
              <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}}
                style={{ ...INPUT_DARK, width:'100%', colorScheme:'dark' }}
                onFocus={e=>e.target.style.borderColor='#6366f1'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
              <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.45)', fontWeight:700, display:'flex', alignItems:'center', whiteSpace:'nowrap' }}>{total} entries</span>
            </div>
            {/* Role pills */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['all','admin','hr','employee','system'].map(r => (
                <button key={r} onClick={()=>{setFilterRole(r);setPage(1);}}
                  style={{ padding:'6px 16px', borderRadius:99, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:'none', transition:'all 0.15s',
                    background: filterRole===r ? '#6366f1' : 'rgba(255,255,255,0.10)',
                    color: filterRole===r ? '#fff' : 'rgba(255,255,255,0.60)' }}>
                  {r==='all'?'All':r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', animation:'slideUp 0.5s ease-out 160ms both' }}>
          {/* Header row */}
          <div style={{ display:'grid', gridTemplateColumns:'8px 80px 150px 1fr 130px', padding:'11px 20px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', gap:16, alignItems:'center' }}>
            {['','Role','Actor','Action & Detail','Timestamp'].map(h => (
              <span key={h} style={{ fontSize:10.5, fontWeight:700, color:'#94a3b8', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:'64px 24px', textAlign:'center' }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
              <div style={{ position:'relative', width:36, height:36, margin:'0 auto 12px' }}>
                <div style={{ position:'absolute', inset:0, border:'3px solid #e2e8f0', borderRadius:'50%' }} />
                <div style={{ position:'absolute', inset:0, border:'3px solid transparent', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              </div>
              <p style={{ fontSize:13, color:'#94a3b8' }}>Loading log entries…</p>
            </div>
          ) : logs.length===0 ? (
            <p style={{ fontSize:13, color:'#94a3b8', textAlign:'center', padding:'64px 24px' }}>No log entries match your filters.</p>
          ) : logs.map((log,i) => {
            const rs = ROLE_MAP[log.actorRole]||ROLE_MAP.system;
            return (
              <div key={log._id||i} className="al-row"
                style={{ display:'grid', gridTemplateColumns:'8px 80px 150px 1fr 130px', padding:'12px 20px', borderBottom:i<logs.length-1?'1px solid #f1f5f9':'none', alignItems:'start', background:'#fff', transition:'background 0.15s', gap:16 }}>

                {/* dot */}
                <div style={{ paddingTop:4 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:rs.dot, display:'block' }} />
                </div>

                {/* role badge */}
                <div>
                  <span style={{ fontSize:10.5, fontWeight:800, padding:'2px 8px', borderRadius:7, background:rs.bg, color:rs.color, letterSpacing:'0.05em', display:'inline-block', whiteSpace:'nowrap' }}>{rs.label}</span>
                </div>

                {/* actor */}
                <div style={{ display:'flex', alignItems:'center', gap:7, minWidth:0 }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>{rs.icon}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.actorName||'—'}</span>
                </div>

                {/* ── Action on line 1, detail on line 2 (clamped) ── */}
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#0f172a', margin:'0 0 3px', textTransform:'capitalize', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {log.action?.replace(/_/g,' ')||'—'}
                  </p>
                  {log.detail && (
                    <p style={{ fontSize:12, color:'#64748b', margin:0,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                      overflow:'hidden', lineHeight:'1.45', wordBreak:'break-word' }}>
                      {log.detail}
                    </p>
                  )}
                </div>

                {/* timestamp */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'#6366f1', margin:'0 0 2px' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}
                  </p>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:0, fontFamily:'monospace' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {[{label:'«',fn:()=>setPage(1),d:page===1},{label:<ChevronLeftIcon style={{width:14,height:14}}/>,fn:()=>setPage(p=>Math.max(1,p-1)),d:page===1}].map((b,i)=>(
              <button key={i} onClick={b.fn} disabled={b.d} style={{ padding:'8px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:12.5, fontWeight:700, background:'#fff', color:'#475569', cursor:b.d?'not-allowed':'pointer', opacity:b.d?0.4:1, fontFamily:'inherit' }}>{b.label}</button>
            ))}
            <span style={{ padding:'8px 16px', fontSize:13.5, fontWeight:700, color:'#0f172a' }}>Page {page} of {totalPages}</span>
            {[{label:<ChevronRightIcon style={{width:14,height:14}}/>,fn:()=>setPage(p=>Math.min(totalPages,p+1)),d:page===totalPages},{label:'»',fn:()=>setPage(totalPages),d:page===totalPages}].map((b,i)=>(
              <button key={i} onClick={b.fn} disabled={b.d} style={{ padding:'8px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:12.5, fontWeight:700, background:'#fff', color:'#475569', cursor:b.d?'not-allowed':'pointer', opacity:b.d?0.4:1, fontFamily:'inherit' }}>{b.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;