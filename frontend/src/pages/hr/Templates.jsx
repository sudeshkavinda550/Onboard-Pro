import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  ListBulletIcon,
  BuildingOffice2Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import TemplateForm from '../../components/hr/TemplateForm';
import TemplateList from '../../components/hr/TemplateList';
import TemplatePreview from '../../components/hr/TemplatePreview';
import AssignEmployeeModal from '../../components/hr/AssignEmployeeModal';
import { templateAPI } from '../../services/api';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true); setError(null);
      const response = await templateAPI.getAll();
      setTemplates(response.data?.data || response.data || []);
    } catch (err) {
      let msg = 'Failed to load templates';
      if (!err.response) msg = 'Cannot connect to server. Please ensure your backend is running.';
      else if (err.response.status === 404) msg = 'API endpoint not found. Check backend configuration.';
      else if (err.response.status === 401) msg = 'Authentication required. Please log in again.';
      else if (err.response.data?.message) msg = err.response.data.message;
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await templateAPI.getEmployeesForAssignment();
      setEmployees(response.data?.data || response.data || []);
    } catch (err) { console.error(err); toast.error('Failed to load employees'); setEmployees([]); }
    finally { setLoadingEmployees(false); }
  };

  const handleEdit = async (template) => {
    try { const response = await templateAPI.getById(template.id); setEditingTemplate(response.data?.data || response.data); setShowForm(true); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to load template details'); }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try { await templateAPI.delete(templateId); setTemplates(templates.filter(t => t.id !== templateId)); toast.success('Template deleted successfully'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete template'); }
  };

  const handleDuplicate = async (template) => {
    try { const response = await templateAPI.duplicate(template.id); const newTemplate = response.data?.data || response.data; setTemplates([newTemplate, ...templates]); toast.success('Template duplicated successfully'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to duplicate template'); }
  };

  const handleFormClose = () => { setShowForm(false); setEditingTemplate(null); };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTemplate) {
        const response = await templateAPI.update(editingTemplate.id, formData);
        const updated = response.data?.data || response.data;
        setTemplates(templates.map(t => t.id === editingTemplate.id ? updated : t));
        toast.success('Template updated successfully');
      } else {
        const response = await templateAPI.create(formData);
        const newTemplate = response.data?.data || response.data;
        setTemplates([newTemplate, ...templates]);
        toast.success('Template created successfully');
      }
      handleFormClose(); fetchTemplates();
    } catch (err) {
      let msg = 'Failed to save template';
      if (!err.response) msg = 'Cannot connect to server.';
      else if (err.response.status === 400) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors)) { data.errors.forEach(e => toast.error(`${e.path || e.param}: ${e.msg}`, { duration: 5000 })); return; }
        msg = data.message || 'Invalid template data.';
      } else if (err.response.data?.message) msg = err.response.data.message;
      toast.error(msg, { duration: 6000 });
    }
  };

  const handlePreview = async (template) => {
    try { const response = await templateAPI.getById(template.id); setSelectedTemplate(response.data?.data || response.data); setShowPreview(true); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to load template details'); }
  };

  const handleAssign = async (template) => { setSelectedTemplate(template); setShowAssignModal(true); await fetchEmployees(); };
  const handleAssignFromPreview = async () => { if (selectedTemplate) { setShowPreview(false); setShowAssignModal(true); await fetchEmployees(); } };
  const handleAssignToEmployee = async (employeeId) => {
    try { await templateAPI.assignToEmployee(selectedTemplate.id, employeeId); toast.success('Template assigned successfully'); }
    catch (err) { toast.error('Failed to assign template'); throw err; }
  };
  const handleCloseAssignModal = () => { setShowAssignModal(false); setSelectedTemplate(null); };

  const totalTasks  = templates.reduce((sum, t) => sum + (Number(t.tasks_count || t.tasksCount || 0)), 0);
  const departments = [...new Set(templates.filter(t => t.department_name).map(t => t.department_name))].length;

  const STAT_CARDS = [
    { label: 'TOTAL TEMPLATES', value: templates.length, color: '#3b82f6', WatermarkIcon: DocumentDuplicateIcon },
    { label: 'TOTAL TASKS',     value: totalTasks,        color: '#f97316', WatermarkIcon: ListBulletIcon        },
    { label: 'DEPARTMENTS',     value: departments,       color: '#22d3ee', WatermarkIcon: BuildingOffice2Icon   },
    { label: 'ACTIVE FORM',     value: showForm ? 1 : 0,  color: '#22c55e', WatermarkIcon: PencilSquareIcon      },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f1f5f9' }}>
        <div style={{ position: 'relative', width: 52, height: 52 }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Connection Error</h2>
          <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>{error}</p>
          <button onClick={fetchTemplates} style={{ width: '100%', padding: '11px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: default; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {error && templates.length > 0 && (
          <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" fill="none" stroke="#d97706" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p style={{ fontSize: 13, color: '#92400e', flex: 1, margin: 0 }}>{error}</p>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', padding: 2 }}>✕</button>
          </div>
        )}

        <div style={{ animation: 'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>Onboarding Templates</h1>
          <p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>Manage and assign onboarding templates to new employees</p>
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

        {/* Dark banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 20, padding: '32px 36px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 240ms both' }}>
          <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', opacity: 0.08 }}>
            <svg width="120" height="120" fill="#fff" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Template Management</h2>
              <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>Build structured onboarding flows, assign tasks to employees, and track completion across departments.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.15s', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'} onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
              <PlusIcon style={{ width: 16, height: 16 }} />Create Template
            </button>
          </div>
        </div>

        {showForm && (
          <div style={{ animation: 'slideUp 0.4s ease-out both' }}>
            <TemplateForm template={editingTemplate} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
          </div>
        )}

        {showPreview && selectedTemplate && (
          <TemplatePreview template={selectedTemplate} onClose={() => { setShowPreview(false); setSelectedTemplate(null); }} onAssign={handleAssignFromPreview} />
        )}

        {showAssignModal && selectedTemplate && (
          <AssignEmployeeModal template={selectedTemplate} employees={employees} loading={loadingEmployees} onAssign={handleAssignToEmployee} onClose={handleCloseAssignModal} />
        )}

        <div style={{ animation: 'slideUp 0.5s ease-out 300ms both' }}>
          <TemplateList templates={templates} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onPreview={handlePreview} onAssign={handleAssign} isLoading={loading} />
        </div>

      </div>
    </div>
  );
};

export default Templates;