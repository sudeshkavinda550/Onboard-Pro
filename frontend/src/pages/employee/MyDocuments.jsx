import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { documentApi, taskApi } from '../../api';
import {
  DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  ArrowDownTrayIcon, TrashIcon, EyeIcon, FolderIcon, ArrowLeftIcon,
  XMarkIcon, ExclamationCircleIcon, DocumentTextIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const INPUT_STYLE = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 13.5, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' };
const focusIn  = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

const CARD_COLORS = ['#3b82f6', '#f97316', '#22d3ee', '#22c55e', '#a855f7', '#ef4444'];
const getDocColor = (id) => CARD_COLORS[(id || 0) % CARD_COLORS.length];

const StatusBadge = ({ status }) => {
  const MAP = { approved: { bg: '#dcfce7', color: '#15803d', label: 'Approved' }, rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' }, pending: { bg: '#fef9c3', color: '#a16207', label: 'Pending' } };
  const s = MAP[status] || MAP.pending;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.color }}>{s.label}</span>;
};

const MyDocuments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const taskId    = location.state?.taskId;
  const taskTitle = location.state?.taskTitle;
  const returnTo  = location.state?.returnTo || '/employee/tasks';

  const [documents, setDocuments]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile]     = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [filePreview, setFilePreview]       = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument]   = useState(null);
  const [loadingPreview, setLoadingPreview]     = useState(false);
  const [tasks, setTasks]                   = useState([]);

  useEffect(() => { fetchDocuments(); fetchTasks(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentApi.getMyDocuments();
      const data = res.data?.data || res.data;
      setDocuments(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to fetch documents'); setDocuments([]); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getMyTasks();
      const data = res.data?.data || res.data;
      setTasks((Array.isArray(data) ? data : []).filter(t => (t.task_type === 'document_upload' || t.category === 'document_upload') && t.status !== 'completed'));
    } catch {}
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File size must be less than 10MB'); e.target.value = ''; return; }
    const valid = ['application/pdf','image/jpeg','image/jpg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(file.type)) { toast.error('Invalid file type. PDF, JPG, PNG, DOC, DOCX only'); e.target.value = ''; return; }
    setSelectedFile(file);
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview({ type: file.type.startsWith('image/') ? 'image' : 'pdf', url: reader.result });
      reader.readAsDataURL(file);
    } else { setFilePreview({ type: 'document', name: file.name }); }
  };

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select a file'); return; }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('document', selectedFile);
      if (taskId) fd.append('task_id', String(taskId));
      await documentApi.uploadDocument(fd);
      toast.success('Document uploaded successfully! Waiting for HR approval.');
      setShowUploadModal(false); setSelectedFile(null); setFilePreview(null);
      await fetchDocuments(); await fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to upload document'); }
    finally { setUploading(false); }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      toast.info('Downloading...');
      const res = await documentApi.downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', filename);
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully');
    } catch { toast.error('Failed to download document'); }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try { await documentApi.deleteDocument(documentId); toast.success('Document deleted'); fetchDocuments(); }
    catch { toast.error('Failed to delete document'); }
  };

  const handleViewDocument = async (doc) => {
    try {
      setLoadingPreview(true); setShowPreviewModal(true); setPreviewDocument(doc);
      const res = await documentApi.downloadDocument(doc.id);
      const blob = new Blob([res.data], { type: doc.file_type });
      const url = window.URL.createObjectURL(blob);
      setPreviewDocument(prev => ({ ...prev, previewUrl: url, blob }));
    } catch { toast.error('Failed to load preview'); setShowPreviewModal(false); }
    finally { setLoadingPreview(false); }
  };

  const closePreviewModal = () => {
    if (previewDocument?.previewUrl) window.URL.revokeObjectURL(previewDocument.previewUrl);
    setShowPreviewModal(false); setPreviewDocument(null); setLoadingPreview(false);
  };

  const handleMarkTaskComplete = async () => {
    if (!taskId) return;
    try { await taskApi.updateTaskStatus(taskId, { status: 'completed' }); navigate(returnTo, { state: { successMessage: 'Task marked as complete!' } }); }
    catch { toast.error('Failed to mark task as complete'); }
  };

  const stats = {
    total:    documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending:  documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  const filteredDocs = documents.filter(d => filter === 'all' || d.status === filter);

  const STAT_CARDS = [
    { label: 'TOTAL FILES',  value: stats.total,    color: '#3b82f6', WatermarkIcon: FolderIcon         },  
    { label: 'APPROVED',     value: stats.approved, color: '#22c55e', WatermarkIcon: ShieldCheckIcon    },  
    { label: 'PENDING',      value: stats.pending,  color: '#f97316', WatermarkIcon: ClockIcon          },  
    { label: 'REJECTED',     value: stats.rejected, color: '#ef4444', WatermarkIcon: XCircleIcon        },  
  ];

  const FILTER_TABS = [
    { key: 'all',      label: `All (${stats.total})`,          active: '#6366f1', text: '#fff' },
    { key: 'pending',  label: `Pending (${stats.pending})`,    active: '#fef9c3', text: '#a16207', border: '#fde68a' },
    { key: 'approved', label: `Approved (${stats.approved})`,  active: '#dcfce7', text: '#15803d', border: '#86efac' },
    { key: 'rejected', label: `Rejected (${stats.rejected})`,  active: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .doc-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .doc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.10) !important; }
        .icon-btn { transition: background 0.15s, color 0.15s; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {taskId && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideUp 0.5s ease-out both' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', margin: '0 0 3px', letterSpacing: '0.04em' }}>ACTIVE TASK</p>
              <p style={{ fontSize: 14.5, fontWeight: 800, color: '#1e3a8a', margin: 0 }}>{taskTitle}</p>
            </div>
            <button onClick={() => navigate(returnTo)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1.5px solid #bfdbfe', color: '#1d4ed8', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Back to Tasks
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, animation: 'slideUp 0.5s ease-out both' }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>My Documents</h1>
            <p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>Upload and manage your onboarding documents</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {taskId && (
              <button onClick={handleMarkTaskComplete}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#22c55e', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <CheckCircleIcon style={{ width: 16, height: 16 }} /> Mark Complete
              </button>
            )}
            <button onClick={() => setShowUploadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
              <DocumentArrowUpIcon style={{ width: 16, height: 16 }} /> Upload Document
            </button>
          </div>
        </div>

        {stats.rejected > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: 14, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'slideUp 0.5s ease-out both' }}>
            <ExclamationCircleIcon style={{ width: 18, height: 18, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#991b1b', margin: '0 0 3px' }}>Documents Require Re-upload</p>
              <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>
                {stats.rejected} document{stats.rejected > 1 ? 's' : ''} {stats.rejected > 1 ? 'have' : 'has'} been rejected. Please review feedback and upload corrected versions.
              </p>
            </div>
          </div>
        )}

        {/* ── Stat cards with watermark icons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {STAT_CARDS.map((card, i) => (
            <div key={card.label} className="stat-card"
              style={{
                background: card.color,
                borderRadius: 20,
                padding: '22px 20px 18px',
                color: '#fff',
                boxShadow: `0 4px 18px ${card.color}55`,
                animation: `slideUp 0.5s ease-out ${i * 60}ms both`,
                position: 'relative',
                overflow: 'hidden',
              }}>
              {/* Watermark icon */}
              <div style={{ position: 'absolute', right: -14, bottom: -14, opacity: 0.13, pointerEvents: 'none' }}>
                <card.WatermarkIcon style={{ width: 96, height: 96, color: '#fff' }} />
              </div>
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', opacity: 0.88, marginBottom: 10, textAlign: 'center' }}>{card.label}</div>
                <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, textAlign: 'center' }}>{card.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 20, padding: '22px 28px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 240ms both' }}>
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.07 }}>
            <FolderIcon style={{ width: 100, height: 100, color: '#fff' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Document Library</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Filter your uploaded documents by status</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: filter === tab.key && tab.border ? `1.5px solid ${tab.border}` : 'none', background: filter === tab.key ? tab.active : 'rgba(255,255,255,0.10)', color: filter === tab.key ? tab.text : 'rgba(255,255,255,0.75)', transition: 'all 0.15s' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <DocumentArrowUpIcon style={{ width: 24, height: 24, color: '#6366f1' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>No documents found</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px' }}>{filter === 'all' ? "You haven't uploaded any documents yet." : `No documents with status "${filter}"`}</p>
            <button onClick={() => setShowUploadModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <DocumentArrowUpIcon style={{ width: 16, height: 16 }} /> Upload Your First Document
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredDocs.map((doc, i) => {
              const c = getDocColor(i);
              return (
                <div key={doc.id} className="doc-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: `slideUp 0.4s ease-out ${i * 40}ms both` }}>
                  <div style={{ height: 5, background: c }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DocumentArrowUpIcon style={{ width: 18, height: 18, color: c }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.task_title || doc.original_filename || 'Document'}
                        </h3>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                          {doc.uploaded_date ? new Date(doc.uploaded_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                        </p>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: '1px solid #f1f5f9' }}>
                      <div style={{ marginBottom: 6 }}>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 2px', letterSpacing: '0.04em' }}>FILE NAME</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.original_filename || doc.filename || 'No filename'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 2px', letterSpacing: '0.04em' }}>SIZE</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
                      </div>
                    </div>

                    {doc.status === 'rejected' && doc.rejection_reason && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', margin: '0 0 4px', letterSpacing: '0.04em' }}>REJECTION REASON</p>
                        <p style={{ fontSize: 12.5, color: '#b91c1c', margin: 0 }}>{doc.rejection_reason}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 7, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                      <button className="icon-btn" onClick={() => handleDownload(doc.id, doc.original_filename || doc.filename)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', fontSize: 12.5, fontWeight: 700, background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                        <ArrowDownTrayIcon style={{ width: 14, height: 14 }} /> Download
                      </button>
                      <button className="icon-btn" onClick={() => handleViewDocument(doc)} title="Preview"
                        style={{ width: 36, height: 36, borderRadius: 9, background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                        <EyeIcon style={{ width: 15, height: 15 }} />
                      </button>
                      {doc.status === 'rejected' && (
                        <button className="icon-btn" onClick={() => { setSelectedFile(null); setFilePreview(null); setShowUploadModal(true); }} title="Re-upload"
                          style={{ width: 36, height: 36, borderRadius: 9, background: '#6366f1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'} onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
                          <DocumentArrowUpIcon style={{ width: 15, height: 15, color: '#fff' }} />
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => handleDelete(doc.id)} title="Delete"
                        style={{ width: 36, height: 36, borderRadius: 9, background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                        <TrashIcon style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>Upload Document</h2>
                {taskTitle && <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '2px 0 0' }}>For: {taskTitle}</p>}
              </div>
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setFilePreview(null); }}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!taskId && tasks.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>LINK TO TASK (Optional)</label>
                  <select onChange={e => { if (e.target.value) navigate('/employee/documents', { state: { taskId: parseInt(e.target.value), taskTitle: e.target.options[e.target.selectedIndex].text, returnTo: '/employee/tasks' } }); }}
                    style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">-- Select a task --</option>
                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>SELECT FILE *</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, border: '2px dashed #c7d2fe', borderRadius: 14, cursor: 'pointer', background: '#f5f3ff', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'} onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}>
                  <DocumentArrowUpIcon style={{ width: 36, height: 36, color: '#6366f1', marginBottom: 8 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
                  <input type="file" style={{ display: 'none' }} onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </label>
              </div>
              {selectedFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eef2ff', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: '#6366f1', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DocumentArrowUpIcon style={{ width: 16, height: 16, color: '#fff' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{selectedFile.name}</p>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: 0 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <XMarkIcon style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              )}
              {filePreview && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, border: '1px solid #e2e8f0' }}>
                  {filePreview.type === 'image' && <img src={filePreview.url} alt="Preview" style={{ maxHeight: 220, margin: '0 auto', display: 'block', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />}
                  {filePreview.type === 'pdf' && <iframe src={filePreview.url} style={{ width: '100%', height: 220, borderRadius: 10, border: '1px solid #e2e8f0' }} title="PDF Preview" />}
                  {filePreview.type === 'document' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <DocumentArrowUpIcon style={{ width: 40, height: 40, color: '#94a3b8', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Preview not available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setFilePreview(null); }} disabled={uploading}
                style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleUpload} disabled={uploading || !selectedFile}
                style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer', opacity: !selectedFile ? 0.6 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {uploading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Uploading...</> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewDocument && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />
            <div style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Document Preview</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{previewDocument.original_filename || previewDocument.filename}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDownload(previewDocument.id, previewDocument.original_filename || previewDocument.filename)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <ArrowDownTrayIcon style={{ width: 14, height: 14 }} /> Download
                </button>
                <button onClick={closePreviewModal} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: 24 }}>
              {loadingPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                  <div style={{ position: 'relative', width: 48, height: 48 }}>
                    <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                </div>
              ) : previewDocument.file_type?.startsWith('image/') ? (
                <img src={previewDocument.previewUrl} alt={previewDocument.original_filename} style={{ maxWidth: '100%', margin: '0 auto', display: 'block', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }} />
              ) : previewDocument.file_type === 'application/pdf' ? (
                <iframe src={previewDocument.previewUrl} style={{ width: '100%', height: '65vh', borderRadius: 12, border: '1px solid #e2e8f0' }} title="PDF Preview" />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ width: 64, height: 64, background: '#eef2ff', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <DocumentArrowUpIcon style={{ width: 28, height: 28, color: '#6366f1' }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Preview not available</p>
                  <button onClick={() => handleDownload(previewDocument.id, previewDocument.original_filename || previewDocument.filename)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <ArrowDownTrayIcon style={{ width: 16, height: 16 }} /> Download File
                  </button>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
              <button onClick={closePreviewModal} style={{ width: '100%', padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;