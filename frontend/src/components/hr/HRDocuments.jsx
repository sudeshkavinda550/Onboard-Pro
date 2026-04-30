import React, { useState, useEffect } from 'react';
import { documentApi, taskApi } from '../../api';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  XMarkIcon,
  FolderIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const INPUT_STYLE = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
  background: '#fff', fontSize: 13.5, color: '#0f172a', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
};
const focusIn  = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

const StatusBadge = ({ status, reason }) => {
  const MAP = {
    approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', icon: '✓' },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#dc2626', icon: '✕' },
    pending:  { label: 'Pending',  bg: '#fef9c3', color: '#a16207', icon: '⏳' },
  };
  const s = MAP[status] || MAP.pending;
  return (
    <div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span>{s.icon}</span>{s.label}
      </span>
      {status === 'rejected' && reason && (
        <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reason}>{reason}</p>
      )}
    </div>
  );
};

const HRDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => { fetchDocuments(); }, [filter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = filter === 'pending'
        ? await documentApi.getPendingDocuments()
        : await documentApi.getAllDocuments({ status: filter });
      const data = response.data?.data || response.data;
      setDocuments(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load documents'); setDocuments([]); }
    finally { setLoading(false); }
  };

  const handleApprove = async (documentId, taskId) => {
    try {
      await documentApi.approveDocument(documentId);
      await taskApi.updateTaskStatus(taskId, { status: 'completed' });
      toast.success('Document approved. Task completed.');
      fetchDocuments(); setShowModal(false); setRejectionReason('');
    } catch { toast.error('Failed to approve document'); }
  };

  const handleReject = async (documentId, taskId) => {
    if (!rejectionReason.trim()) { toast.error('Please provide a reason for rejection'); return; }
    if (rejectionReason.trim().length < 10) { toast.error('Rejection reason must be at least 10 characters'); return; }
    if (rejectionReason.trim().length > 500) { toast.error('Rejection reason must be less than 500 characters'); return; }
    try {
      await documentApi.rejectDocument(documentId, rejectionReason);
      await taskApi.updateTaskStatus(taskId, { status: 'pending' });
      toast.success('Document rejected. Task returned to pending.');
      fetchDocuments(); setShowModal(false); setRejectionReason('');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject document'); }
  };

  const handleViewDocument = async (doc) => {
    try {
      setLoadingPreview(true); setShowPreviewModal(true); setPreviewDocument(doc);
      const response = await documentApi.downloadDocument(doc.id);
      const blob = new Blob([response.data], { type: doc.file_type });
      const url = window.URL.createObjectURL(blob);
      setPreviewDocument(prev => ({ ...prev, previewUrl: url, blob }));
    } catch { toast.error('Failed to load document preview'); setShowPreviewModal(false); }
    finally { setLoadingPreview(false); }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      toast.info('Downloading...');
      const response = await documentApi.downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url); toast.success('Downloaded successfully');
    } catch { toast.error('Failed to download document'); }
  };

  const closePreviewModal = () => {
    if (previewDocument?.previewUrl) window.URL.revokeObjectURL(previewDocument.previewUrl);
    setShowPreviewModal(false); setPreviewDocument(null); setLoadingPreview(false);
  };

  const stats = {
    total:    documents.length,
    pending:  documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.task_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const STAT_CARDS = [
    { label: 'TOTAL DOCUMENTS', value: stats.total,    color: '#3b82f6', WatermarkIcon: FolderIcon        },
    { label: 'PENDING REVIEW',  value: stats.pending,  color: '#f97316', WatermarkIcon: ClockIcon          },
    { label: 'APPROVED',        value: stats.approved, color: '#22c55e', WatermarkIcon: ShieldCheckIcon    },
    { label: 'REJECTED',        value: stats.rejected, color: '#ef4444', WatermarkIcon: XCircleIcon        },
  ];

  const FILTER_TABS = [
    { key: 'pending',  label: 'Pending',  count: stats.pending,  active: '#fef9c3', activeText: '#a16207', activeBorder: '#fde68a' },
    { key: 'approved', label: 'Approved', count: stats.approved, active: '#dcfce7', activeText: '#15803d', activeBorder: '#86efac' },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, active: '#fee2e2', activeText: '#dc2626', activeBorder: '#fca5a5' },
    { key: 'all',      label: 'All',      count: stats.total,    active: '#eef2ff', activeText: '#4338ca', activeBorder: '#a5b4fc' },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .doc-row { transition: background 0.15s; }
        .doc-row:hover { background: #f8fafc; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .icon-btn { transition: background 0.15s, color 0.15s; cursor: pointer; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ animation: 'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>Document Review</h1>
          <p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>Review and approve employee submitted documents</p>
        </div>

        {/* ── 4 stat cards with watermark icons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {STAT_CARDS.map((card, i) => (
            <div key={card.label} className="stat-card"
              style={{ background: card.color, borderRadius: 20, padding: '22px 20px 18px', color: '#fff', boxShadow: `0 4px 18px ${card.color}55`, animation: `slideUp 0.5s ease-out ${i * 60}ms both`, position: 'relative', overflow: 'hidden' }}>
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

        {/* Dark banner with filter tabs */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 240ms both' }}>
          <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', opacity: 0.08 }}>
            <svg width="110" height="110" fill="#fff" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Document Management</h2>
              <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>Review uploaded documents from employees, approve or reject with feedback, and track completion status.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {FILTER_TABS.map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: filter === tab.key ? tab.active : 'rgba(255,255,255,0.10)', color: filter === tab.key ? tab.activeText : 'rgba(255,255,255,0.80)', outline: filter === tab.key ? `1.5px solid ${tab.activeBorder}` : 'none', fontFamily: 'inherit' }}>
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Table */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 300ms both' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input type="text" placeholder="Search by employee, filename or task..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...INPUT_STYLE, paddingLeft: 40 }} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <span style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 600 }}>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <DocumentTextIcon style={{ width: 24, height: 24, color: '#6366f1' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>No documents found</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No documents match the current filter or search</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Document', 'Employee', 'Task', 'Uploaded', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, i) => (
                    <tr key={doc.id} className="doc-row" style={{ borderTop: '1px solid #f1f5f9', animation: `slideUp 0.4s ease-out ${i * 30}ms both` }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DocumentTextIcon style={{ width: 16, height: 16, color: '#6366f1' }} />
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{doc.original_filename || doc.filename}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}><span style={{ fontSize: 13.5, fontWeight: 600, color: '#334155' }}>{doc.employee_name || 'N/A'}</span></td>
                      <td style={{ padding: '14px 20px' }}><span style={{ fontSize: 13, color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{doc.task_title || 'N/A'}</span></td>
                      <td style={{ padding: '14px 20px' }}><span style={{ fontSize: 12.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{doc.uploaded_date ? new Date(doc.uploaded_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span></td>
                      <td style={{ padding: '14px 20px' }}><StatusBadge status={doc.status} reason={doc.rejection_reason} /></td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button className="icon-btn" onClick={() => handleViewDocument(doc)} title="Preview" style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                            <EyeIcon style={{ width: 15, height: 15 }} />
                          </button>
                          <button className="icon-btn" onClick={() => handleDownload(doc.id, doc.original_filename || doc.filename)} title="Download" style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                            <ArrowDownTrayIcon style={{ width: 15, height: 15 }} />
                          </button>
                          {doc.status === 'pending' && (
                            <button onClick={() => { setSelectedDocument(doc); setRejectionReason(''); setShowModal(true); }} style={{ padding: '6px 14px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'} onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>Review</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedDocument && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 580, overflow: 'hidden' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)' }} />
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>Review Document</h2><p style={{ fontSize: 12.5, color: '#94a3b8', margin: '2px 0 0' }}>Approve or reject with feedback</p></div>
              <button onClick={() => { setShowModal(false); setRejectionReason(''); }} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}><XMarkIcon style={{ width: 16, height: 16 }} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ label: 'DOCUMENT', value: selectedDocument.original_filename || selectedDocument.filename }, { label: 'EMPLOYEE', value: selectedDocument.employee_name }, { label: 'TASK', value: selectedDocument.task_title || 'N/A' }, { label: 'UPLOADED', value: selectedDocument.uploaded_date ? new Date(selectedDocument.uploaded_date).toLocaleString() : 'N/A' }].map(item => (
                    <div key={item.label}><p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 3px', letterSpacing: '0.05em' }}>{item.label}</p><p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p></div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>REJECTION REASON <span style={{ fontWeight: 500, color: '#94a3b8' }}>(required if rejecting)</span></label>
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} placeholder="Provide detailed reason for rejection (min. 10 characters)..." style={{ ...INPUT_STYLE, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '4px 0 0' }}>{rejectionReason.length}/500 characters</p>
              </div>
              <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <button onClick={() => { setShowModal(false); setRejectionReason(''); }} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={() => handleReject(selectedDocument.id, selectedDocument.task_id)} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#ef4444', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>Reject</button>
                <button onClick={() => handleApprove(selectedDocument.id, selectedDocument.task_id)} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#22c55e', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#16a34a'} onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />
            <div style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div><h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Document Preview</h2><p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{previewDocument.original_filename || previewDocument.filename}</p></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDownload(previewDocument.id, previewDocument.original_filename || previewDocument.filename)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}><ArrowDownTrayIcon style={{ width: 14, height: 14 }} /> Download</button>
                <button onClick={closePreviewModal} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}><XMarkIcon style={{ width: 16, height: 16 }} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: 24 }}>
              {loadingPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                  <div style={{ position: 'relative', width: 48, height: 48 }}><div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} /><div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
                </div>
              ) : previewDocument.file_type?.startsWith('image/') ? (
                <img src={previewDocument.previewUrl} alt={previewDocument.original_filename} style={{ maxWidth: '100%', maxHeight: '100%', margin: '0 auto', display: 'block', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }} />
              ) : previewDocument.file_type === 'application/pdf' ? (
                <iframe src={previewDocument.previewUrl} style={{ width: '100%', height: '65vh', borderRadius: 12, border: '1px solid #e2e8f0' }} title="PDF Preview" />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ width: 72, height: 72, background: '#eef2ff', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><DocumentTextIcon style={{ width: 32, height: 32, color: '#6366f1' }} /></div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Preview not available</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>This file type cannot be previewed in the browser</p>
                  <button onClick={() => handleDownload(previewDocument.id, previewDocument.original_filename || previewDocument.filename)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><ArrowDownTrayIcon style={{ width: 16, height: 16 }} /> Download File</button>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
              <button onClick={closePreviewModal} style={{ width: '100%', padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDocuments;