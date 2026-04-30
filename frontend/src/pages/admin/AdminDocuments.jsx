import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon, ArrowDownTrayIcon,
  DocumentIcon, PhotoIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes slideUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  .doc-card{transition:transform 0.2s,box-shadow 0.2s;}
  .doc-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.10) !important;}
`;

const CARD_COLORS = ['#3b82f6','#f97316','#22d3ee','#22c55e','#a855f7','#ef4444'];
const STATUS_STYLES = {
  approved:{ bg:'#dcfce7', color:'#15803d', label:'Approved' },
  pending: { bg:'#fef9c3', color:'#a16207', label:'Pending'  },
  rejected:{ bg:'#fee2e2', color:'#dc2626', label:'Rejected' },
};

const FileIcon = ({ filename='' }) => {
  const ext=(filename.split('.').pop()||'').toLowerCase();
  return ['png','jpg','jpeg','gif','webp'].includes(ext)
    ? <PhotoIcon    style={{ width:26, height:26, color:'#3b82f6' }} />
    : <DocumentIcon style={{ width:26, height:26, color:'#a855f7' }} />;
};

const StatCard = ({ label, value, color, Icon }) => (
  <div style={{ background:color, borderRadius:20, padding:'20px 22px', color:'#fff', boxShadow:`0 4px 18px ${color}55`, position:'relative', overflow:'hidden' }}>
    {Icon && <div style={{ position:'absolute', right:-8, bottom:-8, opacity:0.12 }}><Icon style={{ width:74, height:74 }} /></div>}
    <p style={{ fontSize:10.5, fontWeight:700, opacity:0.88, letterSpacing:'0.07em', margin:'0 0 10px', position:'relative', textTransform:'uppercase' }}>{label}</p>
    <p style={{ fontSize:42, fontWeight:800, lineHeight:1, margin:0, position:'relative' }}>{value}</p>
  </div>
);

const AdminDocuments = () => {
  const [documents, setDocuments]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [dlLoading, setDlLoading]       = useState({});
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage]                 = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    adminApi.getAllDocuments()
      .then(res => setDocuments(res.data||[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter(d => {
    const s=search.toLowerCase();
    const matchSearch=!s||(d.employeeName||'').toLowerCase().includes(s)||(d.filename||'').toLowerCase().includes(s)||(d.taskTitle||'').toLowerCase().includes(s);
    return matchSearch&&(filterStatus==='all'||d.status===filterStatus);
  });

  const totalPages = Math.ceil(filtered.length/PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);

  /* ── Robust download: tries adminApi first, then direct fetch ── */
  const handleDownload = async (doc) => {
    const id = doc._id || doc.id;
    setDlLoading(p=>({...p,[id]:true}));
    try {
      // Attempt 1: use adminApi if it exposes downloadDocument
      if (adminApi.downloadDocument) {
        const res = await adminApi.downloadDocument(id);
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
        triggerDownload(blob, doc.filename||'document');
        return;
      }

      // Attempt 2: authenticated fetch to known endpoint patterns
      const token = localStorage.getItem('token');
      const baseURL = (process.env.REACT_APP_API_URL||'http://localhost:5000/api/v1').replace(/\/$/, '');
      // Try both /admin/documents/:id/download and /documents/:id/download
      const candidates = [
        `${baseURL}/admin/documents/${id}/download`,
        `${baseURL}/documents/${id}/download`,
        `${baseURL}/hr/documents/${id}/download`,
      ];

      let blob = null;
      let lastErr = '';
      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            headers: token ? { Authorization:`Bearer ${token}` } : {},
          });
          if (res.ok) {
            blob = await res.blob();
            break;
          }
          lastErr = `HTTP ${res.status} at ${url}`;
        } catch (e) {
          lastErr = e.message;
        }
      }

      if (blob) {
        triggerDownload(blob, doc.filename||'document');
      } else {
        // Attempt 3: If the doc has a direct file URL, just open it
        if (doc.fileUrl || doc.url || doc.filePath) {
          window.open(doc.fileUrl||doc.url||doc.filePath, '_blank');
        } else {
          alert(`Download failed: ${lastErr}\n\nThe file may have been removed or your session may have expired.`);
        }
      }
    } catch (err) {
      alert(`Download error: ${err.message}`);
    } finally {
      setDlLoading(p=>({...p,[id]:false}));
    }
  };

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:'#f1f5f9', padding:'28px 28px 40px' }}>
      <style>{SHARED}</style>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexDirection:'column', gap:22 }}>

        {/* Header */}
        <div style={{ animation:'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize:30, fontWeight:800, color:'#0f172a', margin:0 }}>All Documents</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:'4px 0 0' }}>View every uploaded document across all employees and departments</p>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, animation:'slideUp 0.5s ease-out 60ms both' }}>
          <StatCard label="Total Documents" value={documents.length}                                       color="#6366f1" Icon={DocumentTextIcon} />
          <StatCard label="Approved"         value={documents.filter(d=>d.status==='approved').length}     color="#22c55e" Icon={DocumentIcon} />
          <StatCard label="Pending Review"   value={documents.filter(d=>d.status==='pending').length}      color="#f97316" Icon={DocumentTextIcon} />
          <StatCard label="Rejected"         value={documents.filter(d=>d.status==='rejected').length}     color="#ef4444" Icon={DocumentIcon} />
        </div>

        {/* Filters */}
        <div style={{ background:'linear-gradient(135deg,#1e293b 0%,#334155 100%)', borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', animation:'slideUp 0.5s ease-out 120ms both', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', opacity:0.06, pointerEvents:'none' }}>
            <DocumentTextIcon style={{ width:90, height:90, color:'#fff' }} />
          </div>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <MagnifyingGlassIcon style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8' }} />
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search documents or employee…"
              style={{ width:'100%', padding:'9px 14px 9px 36px', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:10, background:'rgba(255,255,255,0.08)', fontSize:13, color:'#fff', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#6366f1'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.15)'} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {['all','pending','approved','rejected'].map(s=>(
              <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}}
                style={{ padding:'8px 16px', borderRadius:10, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:'none', transition:'all 0.15s',
                  background:filterStatus===s?'#6366f1':'rgba(255,255,255,0.10)',
                  color:filterStatus===s?'#fff':'rgba(255,255,255,0.65)' }}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Document grid */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:14 }}>
            <div style={{ position:'relative', width:40, height:40 }}>
              <div style={{ position:'absolute', inset:0, border:'4px solid #e2e8f0', borderRadius:'50%' }} />
              <div style={{ position:'absolute', inset:0, border:'4px solid transparent', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
            <p style={{ fontSize:13.5, color:'#64748b', fontWeight:600 }}>Loading documents…</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {paginated.length===0 ? (
                <p style={{ gridColumn:'1/-1', textAlign:'center', fontSize:14, color:'#94a3b8', padding:'64px 0' }}>No documents found.</p>
              ) : paginated.map((doc,idx) => {
                const st    = STATUS_STYLES[doc.status]||STATUS_STYLES.pending;
                const accent = CARD_COLORS[idx%CARD_COLORS.length];
                const id    = doc._id||doc.id;
                const busy  = dlLoading[id];
                return (
                  <div key={id||idx} className="doc-card"
                    style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ height:4, background:accent }} />
                    <div style={{ padding:'18px 18px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'#f8fafc', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <FileIcon filename={doc.filename} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:st.bg, color:st.color }}>{st.label}</span>
                      </div>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'#0f172a', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.filename||'Unknown file'}</p>
                      <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 14px' }}>{doc.taskTitle||'Document upload'}</p>
                      <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                        <div>
                          <p style={{ fontSize:12.5, fontWeight:700, color:'#0f172a', margin:'0 0 1px' }}>{doc.employeeName||'—'}</p>
                          <p style={{ fontSize:11.5, color:'#94a3b8', margin:0 }}>{doc.department||'—'}</p>
                        </div>
                        <p style={{ fontSize:11.5, color:'#94a3b8', margin:0 }}>{doc.uploadedAt?new Date(doc.uploadedAt).toLocaleDateString():'—'}</p>
                      </div>
                      <button onClick={()=>handleDownload(doc)} disabled={busy}
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, width:'100%', padding:'9px', background:busy?'#94a3b8':'#6366f1', border:'none', color:'#fff', borderRadius:11, fontSize:12.5, fontWeight:700, cursor:busy?'not-allowed':'pointer', fontFamily:'inherit', transition:'background 0.15s' }}
                        onMouseEnter={e=>{ if(!busy) e.currentTarget.style.background='#4f46e5'; }}
                        onMouseLeave={e=>{ if(!busy) e.currentTarget.style.background='#6366f1'; }}>
                        {busy
                          ? <><div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Downloading…</>
                          : <><ArrowDownTrayIcon style={{ width:14, height:14 }} />Download</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages>1&&(
              <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:'8px 18px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, fontWeight:700, background:'#fff', color:'#475569', cursor:page===1?'not-allowed':'pointer', opacity:page===1?0.4:1, fontFamily:'inherit' }}>← Prev</button>
                <span style={{ padding:'8px 16px', fontSize:13, color:'#64748b', fontWeight:600 }}>Page {page} of {totalPages}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:'8px 18px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, fontWeight:700, background:'#fff', color:'#475569', cursor:page===totalPages?'not-allowed':'pointer', opacity:page===totalPages?0.4:1, fontFamily:'inherit' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDocuments;