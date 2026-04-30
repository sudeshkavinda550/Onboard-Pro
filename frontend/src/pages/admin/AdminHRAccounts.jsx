import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon, MagnifyingGlassIcon, TrashIcon, NoSymbolIcon,
  CheckCircleIcon, EyeIcon, XMarkIcon, ExclamationTriangleIcon,
  UserGroupIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  .hr-row:hover{background:#f8fafc !important;}
  .hr-stat:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(0,0,0,0.16)!important;}
`;

const DEPARTMENTS = ['Engineering','Sales','Marketing','Operations','HR','Finance','Product','Design'];
const INPUT_STYLE = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
  background: '#fff', fontSize: 13.5, color: '#0f172a', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s',
};
const focusIn  = e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; };

const StatCard = ({ label, value, color, Icon, delay=0 }) => (
  <div className="hr-stat" style={{ background: color, borderRadius: 20, padding: '20px 22px', color: '#fff', boxShadow: `0 4px 18px ${color}55`, position: 'relative', overflow: 'hidden', cursor: 'default', animation: `slideUp 0.5s ease-out ${delay}ms both`, transition: 'transform 0.2s, box-shadow 0.2s' }}>
    {Icon && <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.12 }}><Icon style={{ width: 74, height: 74 }} /></div>}
    <p style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.88, letterSpacing: '0.07em', margin: '0 0 10px', position: 'relative' }}>{label}</p>
    <p style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, margin: 0, position: 'relative' }}>{value}</p>
  </div>
);

const initials = (name) => (name||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

const StatusBadge = ({ status }) => status === 'active'
  ? <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:'#dcfce7', color:'#15803d' }}><CheckCircleIcon style={{width:11,height:11}} />Active</span>
  : <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:'#fee2e2', color:'#dc2626' }}><NoSymbolIcon style={{width:11,height:11}} />Suspended</span>;

const AdminHRAccounts = () => {
  const [accounts, setAccounts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showCreate, setCreate]   = useState(false);
  const [viewRecord, setView]     = useState(null);
  const [form, setForm]           = useState({name:'',email:'',password:'',department:''});
  const [submitting, setSub]      = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try { const res = await adminApi.getHRAccounts(); const data=res.data||res; setAccounts(Array.isArray(data)?data:[]); }
    catch { }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password||!form.department) { setFormError('All fields are required'); return; }
    if (form.password.length < 8) { setFormError('Password must be at least 8 characters'); return; }
    setSub(true); setFormError('');
    try { await adminApi.createHRAccount(form); setCreate(false); setForm({name:'',email:'',password:'',department:''}); fetchAccounts(); }
    catch (err) { setFormError(err.response?.data?.message||'Failed to create HR account'); }
    finally { setSub(false); }
  };

  const handleToggle = async (id, status) => {
    if (!window.confirm(status==='active'?'Suspend this HR account?':'Restore this HR account?')) return;
    try { await adminApi.updateHRStatus(id, status==='active'?'suspend':'restore'); fetchAccounts(); }
    catch (err) { alert(err.response?.data?.message||'Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this HR account?')) return;
    try { await adminApi.deleteHRAccount(id); fetchAccounts(); }
    catch (err) { alert(err.response?.data?.message||'Failed to delete'); }
  };

  const filtered = accounts.filter(a =>
    (a.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (a.email||'').toLowerCase().includes(search.toLowerCase()) ||
    (a.department||'').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = accounts.filter(a => a.status === 'active').length;
  const suspendedCount = accounts.filter(a => a.status === 'suspended').length;
  const uniqueDepts   = [...new Set(accounts.map(a=>a.department).filter(Boolean))].length;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{SHARED}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, animation: 'slideUp 0.5s ease-out both' }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>HR Account Management</h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>Create and manage HR managers across all departments</p>
          </div>
          <button onClick={() => { setCreate(true); setFormError(''); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
            onMouseEnter={e=>e.currentTarget.style.background='#4f46e5'}
            onMouseLeave={e=>e.currentTarget.style.background='#6366f1'}>
            <UserPlusIcon style={{ width: 16, height: 16 }} /> New HR Account
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="TOTAL HR MANAGERS" value={accounts.length}  color="#6366f1" Icon={UserGroupIcon}    delay={0}   />
          <StatCard label="ACTIVE"             value={activeCount}      color="#22c55e" Icon={CheckCircleIcon} delay={60}  />
          <StatCard label="SUSPENDED"          value={suspendedCount}   color="#ef4444" Icon={NoSymbolIcon}    delay={120} />
          <StatCard label="DEPARTMENTS"        value={uniqueDepts}      color="#f97316" Icon={ShieldCheckIcon} delay={180} />
        </div>

        {/* Search bar */}
        <div style={{ background: 'linear-gradient(135deg,#1e293b 0%,#334155 100%)', borderRadius: 20, padding: '20px 24px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 200ms both' }}>
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.06, pointerEvents: 'none' }}>
            <UserGroupIcon style={{ width: 100, height: 100, color: '#fff' }} />
          </div>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search HR accounts…"
              style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, background: 'rgba(255,255,255,0.08)', fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e=>e.target.style.borderColor='#6366f1'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 260ms both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1fr 1.4fr', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['HR Manager','Department','Employees','Last Login','Status','Actions'].map(h => (
              <span key={h} style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <p style={{ fontSize: 13.5, color: '#94a3b8', textAlign: 'center', padding: '48px 24px' }}>Loading accounts…</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontSize: 13.5, color: '#94a3b8', textAlign: 'center', padding: '48px 24px' }}>
              {search ? 'No accounts match your search.' : 'No HR accounts yet. Create the first one!'}
            </p>
          ) : filtered.map((hr, i) => (
            <div key={hr.id||hr._id} className="hr-row"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1fr 1.4fr', padding: '14px 20px', borderBottom: i<filtered.length-1?'1px solid #f1f5f9':'none', alignItems: 'center', background: '#fff', transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#6366f1', flexShrink: 0 }}>
                  {initials(hr.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hr.name||'Unnamed'}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hr.email||'—'}</p>
                </div>
              </div>
              <span style={{ fontSize: 13, color: '#475569' }}>{hr.department||'—'}</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#6366f1' }}>{hr.employeeCount||0}</span>
              <span style={{ fontSize: 12.5, color: '#94a3b8' }}>{hr.lastLogin ? new Date(hr.lastLogin).toLocaleDateString() : 'Never'}</span>
              <StatusBadge status={hr.status} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {[
                  { title: 'View',   fn: ()=>setView(hr),                                    bg: '#eef2ff', color: '#6366f1', hBg: '#e0e7ff', Icon: EyeIcon },
                  { title: hr.status==='active'?'Suspend':'Restore', fn: ()=>handleToggle(hr.id||hr._id, hr.status), bg: hr.status==='active'?'#fef9c3':'#dcfce7', color: hr.status==='active'?'#a16207':'#15803d', hBg: hr.status==='active'?'#fde68a':'#bbf7d0', Icon: NoSymbolIcon },
                  { title: 'Delete', fn: ()=>handleDelete(hr.id||hr._id),                   bg: '#fee2e2', color: '#ef4444', hBg: '#fecaca', Icon: TrashIcon },
                ].map(btn => (
                  <button key={btn.title} onClick={btn.fn} title={btn.title}
                    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: btn.bg, border: 'none', borderRadius: 8, color: btn.color, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=btn.hBg}
                    onMouseLeave={e=>e.currentTarget.style.background=btn.bg}>
                    <btn.Icon style={{ width: 14, height: 14 }} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, animation: 'fadeIn 0.2s ease-out', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 480, overflow: 'hidden' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg,#6366f1,#a855f7,#ec4899)' }} />
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg,#1e293b 0%,#334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>Create HR Account</h2>
              <button onClick={()=>setCreate(false)} style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.10)',border:'none',borderRadius:8,color:'rgba(255,255,255,0.75)',cursor:'pointer' }}>
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExclamationTriangleIcon style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#dc2626' }}>{formError}</span>
                </div>
              )}
              {[
                {label:'Full Name',           key:'name',     type:'text',     ph:'Jane Smith'},
                {label:'Email Address',       key:'email',    type:'email',    ph:'jane@company.com'},
                {label:'Temporary Password',  key:'password', type:'password', ph:'Min. 8 characters'},
              ].map(({label,key,type,ph}) => (
                <div key={key}>
                  <label style={{ display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6,letterSpacing:'0.04em' }}>{label.toUpperCase()} *</label>
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                    style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} required />
                </div>
              ))}
              <div>
                <label style={{ display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6,letterSpacing:'0.04em' }}>DEPARTMENT *</label>
                <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} required>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display:'flex',gap:10,paddingTop:4 }}>
                <button type="button" onClick={()=>setCreate(false)}
                  style={{ flex:1,padding:'10px',fontSize:13.5,fontWeight:700,background:'#fff',border:'1.5px solid #e2e8f0',color:'#475569',borderRadius:10,cursor:'pointer',fontFamily:'inherit' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex:1,padding:'10px',fontSize:13.5,fontWeight:700,background:'#6366f1',border:'none',color:'#fff',borderRadius:10,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.7:1,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                  {submitting ? <><div style={{width:13,height:13,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />Creating…</> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 440, overflow: 'hidden' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg,#6366f1,#a855f7,#ec4899)' }} />
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg,#1e293b 0%,#334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>HR Account Details</h2>
              <button onClick={()=>setView(null)} style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.10)',border:'none',borderRadius:8,color:'rgba(255,255,255,0.75)',cursor:'pointer' }}>
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:20,padding:16,background:'#f8fafc',borderRadius:14 }}>
                <div style={{ width:52,height:52,borderRadius:16,background:'#eef2ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#6366f1' }}>
                  {initials(viewRecord.name)}
                </div>
                <div>
                  <p style={{ fontSize:15,fontWeight:800,color:'#0f172a',margin:'0 0 3px' }}>{viewRecord.name||'Unnamed'}</p>
                  <p style={{ fontSize:13,color:'#64748b',margin:'0 0 6px' }}>{viewRecord.email||'—'}</p>
                  <StatusBadge status={viewRecord.status} />
                </div>
              </div>
              {[
                ['Department',       viewRecord.department||'—'],
                ['Employees Managed',viewRecord.employeeCount||0],
                ['Last Login',       viewRecord.lastLogin?new Date(viewRecord.lastLogin).toLocaleString():'Never'],
                ['Account Created',  viewRecord.createdAt?new Date(viewRecord.createdAt).toLocaleDateString():'—'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid #f1f5f9' }}>
                  <span style={{ fontSize:13,color:'#64748b' }}>{k}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:'#0f172a' }}>{v}</span>
                </div>
              ))}
              <button onClick={()=>setView(null)}
                style={{ width:'100%',marginTop:18,padding:'10px',fontSize:13.5,fontWeight:700,background:'#f1f5f9',border:'none',color:'#475569',borderRadius:10,cursor:'pointer',fontFamily:'inherit' }}
                onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'}
                onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHRAccounts;