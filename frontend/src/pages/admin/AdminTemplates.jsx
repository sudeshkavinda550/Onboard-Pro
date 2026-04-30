import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon, DocumentTextIcon, XMarkIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  .tmpl-card:hover{transform:translateY(-5px);box-shadow:0 14px 40px rgba(0,0,0,0.10) !important;}
`;

const CARD_COLORS = ['#3b82f6','#f97316','#22d3ee','#22c55e','#a855f7','#ef4444'];

const TASK_ICON = { upload:'📎', read:'📖', watch:'🎬', meet:'🤝', meeting:'🤝', form:'📝', sign:'✍️', training:'🎓' };
const taskIcon = (type) => TASK_ICON[type] || '✅';

const AdminTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminApi.getAllTemplates();
      const data = res.data || res;
      setTemplates(Array.isArray(data) ? data : []);
    } catch { setTemplates([]); setError(null); }
    finally { setLoading(false); }
  };

  const filtered = templates.filter(t =>
    (t.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (t.createdByName||'').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#f1f5f9',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ position:'relative',width:48,height:48 }}>
        <div style={{ position:'absolute',inset:0,border:'4px solid #e2e8f0',borderRadius:'50%' }} />
        <div style={{ position:'absolute',inset:0,border:'4px solid transparent',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#f1f5f9',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:'#fff',borderRadius:20,padding:40,textAlign:'center',maxWidth:400 }}>
        <ExclamationTriangleIcon style={{ width:44,height:44,color:'#ef4444',margin:'0 auto 14px' }} />
        <p style={{ fontSize:15,fontWeight:800,color:'#0f172a',margin:'0 0 8px' }}>{error}</p>
        <button onClick={fetchTemplates} style={{ padding:'10px 24px',background:'#6366f1',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:'100vh',background:'#f1f5f9',padding:'28px 28px 40px' }}>
      <style>{SHARED}</style>
      <div style={{ maxWidth:1400,margin:'0 auto',display:'flex',flexDirection:'column',gap:22 }}>

        {/* Header */}
        <div style={{ animation:'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize:30,fontWeight:800,color:'#0f172a',margin:0 }}>Onboarding Templates</h1>
          <p style={{ fontSize:14,color:'#64748b',margin:'4px 0 0' }}>{templates.length} templates created by HR managers across all departments</p>
        </div>

        {/* Single stat card */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,animation:'slideUp 0.5s ease-out 60ms both' }}>
          {[
            { label:'TOTAL TEMPLATES', value:templates.length,                                                              color:'#6366f1' },
            { label:'TOTAL TASKS',     value:templates.reduce((s,t)=>s+(t.tasks||[]).length,0),                             color:'#3b82f6' },
            { label:'EMPLOYEES USING', value:templates.reduce((s,t)=>s+(t.usageCount||0),0),                               color:'#22c55e' },
          ].map((card,i) => (
            <div key={card.label} style={{ background:card.color,borderRadius:20,padding:'20px 22px',color:'#fff',boxShadow:`0 4px 18px ${card.color}55`,position:'relative',overflow:'hidden',animation:`slideUp 0.5s ease-out ${i*60}ms both` }}>
              <div style={{ position:'absolute',right:-8,bottom:-8,opacity:0.12 }}>
                <DocumentTextIcon style={{ width:74,height:74 }} />
              </div>
              <p style={{ fontSize:10.5,fontWeight:700,opacity:0.88,letterSpacing:'0.07em',margin:'0 0 10px',position:'relative' }}>{card.label}</p>
              <p style={{ fontSize:42,fontWeight:800,lineHeight:1,margin:0,position:'relative' }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Search + count */}
        <div style={{ background:'linear-gradient(135deg,#1e293b 0%,#334155 100%)',borderRadius:20,padding:'20px 24px',display:'flex',alignItems:'center',gap:12,position:'relative',overflow:'hidden',animation:'slideUp 0.5s ease-out 180ms both' }}>
          <div style={{ position:'absolute',right:24,top:'50%',transform:'translateY(-50%)',opacity:0.06,pointerEvents:'none' }}>
            <DocumentTextIcon style={{ width:100,height:100,color:'#fff' }} />
          </div>
          <div style={{ position:'relative',flex:1,maxWidth:360 }}>
            <MagnifyingGlassIcon style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:14,height:14,color:'#94a3b8' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search templates…"
              style={{ width:'100%',padding:'9px 14px 9px 36px',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,background:'rgba(255,255,255,0.08)',fontSize:13,color:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#6366f1'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
          </div>
          <span style={{ fontSize:12.5,fontWeight:700,padding:'6px 14px',borderRadius:99,background:'rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.65)' }}>{filtered.length} templates</span>
        </div>

        {/* Template grid */}
        {filtered.length === 0 ? (
          <div style={{ background:'#fff',borderRadius:20,border:'1px solid #e2e8f0',padding:'64px 24px',textAlign:'center' }}>
            <div style={{ width:64,height:64,background:'#f1f5f9',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
              <DocumentTextIcon style={{ width:28,height:28,color:'#94a3b8' }} />
            </div>
            <p style={{ fontSize:15,fontWeight:700,color:'#0f172a',margin:'0 0 6px' }}>{search?'No templates match your search':'No templates found'}</p>
            <p style={{ fontSize:13,color:'#94a3b8',margin:0 }}>{search?'Try adjusting your search terms':'HR managers will create templates for their departments'}</p>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16 }}>
            {filtered.map((tmpl,idx) => {
              const taskCount = (tmpl.tasks||[]).length;
              const accent    = CARD_COLORS[idx % CARD_COLORS.length];
              return (
                <div key={tmpl.id||tmpl._id} className="tmpl-card" onClick={() => setSelected(tmpl)}
                  style={{ background:'#fff',borderRadius:20,border:'1px solid #e2e8f0',overflow:'hidden',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',transition:'transform 0.2s,box-shadow 0.2s',animation:`slideUp 0.4s ease-out ${idx*40}ms both` }}>
                  {/* Colored top strip */}
                  <div style={{ height:4,background:accent }} />
                  <div style={{ padding:'18px 18px 16px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
                      <div style={{ width:44,height:44,borderRadius:14,background:`${accent}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>📋</div>
                      <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:8,background:'#f1f5f9',color:'#475569' }}>{taskCount} tasks</span>
                    </div>
                    <p style={{ fontSize:14.5,fontWeight:800,color:'#0f172a',margin:'0 0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tmpl.name||'Untitled Template'}</p>
                    <p style={{ fontSize:12,color:'#94a3b8',margin:'0 0 14px' }}>Created by {tmpl.createdByName||'Unknown'}</p>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:14,minHeight:28 }}>
                      {(tmpl.tasks||[]).slice(0,3).map((task,i) => (
                        <span key={i} style={{ background:'#f8fafc',color:'#475569',fontSize:11.5,padding:'3px 9px',borderRadius:8,border:'1px solid #f1f5f9',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                          {taskIcon(task.type)} {task.title}
                        </span>
                      ))}
                      {taskCount > 3 && <span style={{ background:`${accent}18`,color:accent,fontSize:11.5,padding:'3px 9px',borderRadius:8,fontWeight:700 }}>+{taskCount-3} more</span>}
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid #f1f5f9',fontSize:11.5,color:'#94a3b8' }}>
                      <span>📅 {tmpl.createdAt ? new Date(tmpl.createdAt).toLocaleDateString() : 'Unknown'}</span>
                      <span>👥 {tmpl.usageCount||0} employees</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,zIndex:50,animation:'fadeIn 0.2s ease-out',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          <div style={{ background:'#fff',borderRadius:24,boxShadow:'0 24px 80px rgba(0,0,0,0.2)',width:'100%',maxWidth:560,maxHeight:'88vh',overflow:'hidden',display:'flex',flexDirection:'column' }}>
            <div style={{ height:5,background:'linear-gradient(90deg,#6366f1,#a855f7,#ec4899)',flexShrink:0 }} />
            <div style={{ padding:'18px 24px',background:'linear-gradient(135deg,#1e293b 0%,#334155 100%)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
              <h2 style={{ fontSize:16,fontWeight:800,color:'#fff',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,paddingRight:12 }}>{selected.name||'Untitled Template'}</h2>
              <button onClick={()=>setSelected(null)} style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.10)',border:'none',borderRadius:8,color:'rgba(255,255,255,0.75)',cursor:'pointer',flexShrink:0 }}>
                <XMarkIcon style={{ width:16,height:16 }} />
              </button>
            </div>

            <div style={{ overflowY:'auto',flex:1,padding:24,display:'flex',flexDirection:'column',gap:18 }}>
              {selected.description && <p style={{ fontSize:13.5,color:'#475569',margin:0,paddingBottom:16,borderBottom:'1px solid #f1f5f9' }}>{selected.description}</p>}

              {/* Stats */}
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
                {[
                  { label:'Total Tasks',        value:(selected.tasks||[]).length,   color:'#6366f1' },
                  { label:'Employees Assigned', value:selected.usageCount||0,        color:'#22c55e' },
                  { label:'Avg Days',           value:selected.avgCompletionDays||'—', color:'#f97316' },
                ].map(({label,value,color}) => (
                  <div key={label} style={{ background:'#f8fafc',borderRadius:14,padding:'14px',textAlign:'center',border:'1px solid #f1f5f9' }}>
                    <p style={{ fontSize:24,fontWeight:800,color,margin:'0 0 4px' }}>{value}</p>
                    <p style={{ fontSize:11.5,color:'#94a3b8',margin:0 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Task list */}
              <div>
                <p style={{ fontSize:11,fontWeight:700,color:'#94a3b8',margin:'0 0 12px',letterSpacing:'0.06em',textTransform:'uppercase' }}>Task Checklist</p>
                <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
                  {(selected.tasks||[]).length === 0
                    ? <p style={{ fontSize:13,color:'#94a3b8',textAlign:'center',padding:'32px 0' }}>No tasks in this template</p>
                    : (selected.tasks||[]).map((task,i) => (
                        <div key={i} style={{ display:'flex',gap:12,alignItems:'flex-start',padding:'12px 0',borderBottom:i<(selected.tasks.length-1)?'1px solid #f1f5f9':'none' }}>
                          <span style={{ fontSize:18,flexShrink:0,lineHeight:'22px' }}>{taskIcon(task.type)}</span>
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ fontSize:13.5,fontWeight:700,color:'#0f172a',margin:'0 0 2px' }}>{task.title||'Untitled Task'}</p>
                            {task.description && <p style={{ fontSize:12,color:'#94a3b8',margin:'0 0 5px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{task.description}</p>}
                            <span style={{ fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:6,background:'#f1f5f9',color:'#475569',letterSpacing:'0.04em',textTransform:'uppercase' }}>{task.type||'task'}</span>
                          </div>
                        </div>
                      ))
                  }
                </div>
              </div>

              <p style={{ fontSize:12,color:'#94a3b8',margin:0,paddingTop:12,borderTop:'1px solid #f1f5f9' }}>
                Created by {selected.createdByName||'Unknown'} · {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;