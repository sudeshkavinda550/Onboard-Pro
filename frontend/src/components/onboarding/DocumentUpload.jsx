import React, { useState } from 'react';
import { taskApi } from '../../api/taskApi';
import { XMarkIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';

const DocumentUpload = ({ taskId, onUploadComplete, onCancel }) => {
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
    setFile(f);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return; }
    const fd = new FormData();
    fd.append('document', file);
    try {
      setUploading(true);
      await taskApi.uploadTaskDocument(taskId, fd);
      onUploadComplete();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", border: '1.5px solid #c7d2fe', borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Upload Document</h4>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = '#6366f1'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
          <XMarkIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, border: '2px dashed #a5b4fc', borderRadius: 14, cursor: 'pointer', background: '#fff', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          <CloudArrowUpIcon style={{ width: 36, height: 36, color: '#6366f1', marginBottom: 8 }} />
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
            <span style={{ color: '#6366f1' }}>Click to upload</span> or drag and drop
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>PDF, DOC, JPG, PNG (Max 10MB)</p>
          <input type="file" style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
        </label>

        {file && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#fff', border: '1.5px solid #c7d2fe', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: '#eef2ff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DocumentIcon style={{ width: 16, height: 16, color: '#6366f1' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{file.name}</p>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button onClick={onCancel} disabled={uploading}
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={handleUpload} disabled={!file || uploading}
            style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, cursor: !file || uploading ? 'not-allowed' : 'pointer', opacity: !file ? 0.6 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            {uploading ? (
              <>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Uploading...
              </>
            ) : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;