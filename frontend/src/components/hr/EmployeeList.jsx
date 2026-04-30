import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const CARD_COLORS = ['#3b82f6', '#f97316', '#22d3ee', '#22c55e', '#a855f7', '#ef4444'];
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const getProfilePicUrl = (employee) => {
  const raw = employee?.profile_picture || employee?.avatar;
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const baseURL = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  return `${baseURL}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const AvatarCircle = ({ employee, size = 38, fontSize = 15 }) => {
  const color = CARD_COLORS[(employee?.name?.charCodeAt(0) || 0) % CARD_COLORS.length];
  const [imgError, setImgError] = React.useState(false);
  const picUrl = getProfilePicUrl(employee);
  if (picUrl && !imgError) {
    return (
      <img src={picUrl} alt={employee?.name || 'Employee'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${color}55` }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize, fontWeight: 800, color: '#fff', boxShadow: `0 2px 8px ${color}44` }}>
      {employee?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

const getStatus     = (emp) => emp.onboarding_status || emp.onboardingStatus || 'not_started';
// ── PATCH 1: always return a clean integer, never a decimal ──
const getProgress   = (emp) => Math.round(emp.progress_percentage ?? emp.progressPercentage ?? 0);
const getDepartment = (emp) => emp.department_name || emp.department || null;

const StatusBadge = ({ status }) => {
  const MAP = {
    completed:   { label: 'Completed',   bg: '#dcfce7', color: '#15803d' },
    in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8' },
    not_started: { label: 'Not Started', bg: '#f1f5f9', color: '#475569' },
    overdue:     { label: 'Overdue',     bg: '#fee2e2', color: '#dc2626' },
  };
  const s = MAP[status] || MAP.not_started;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

const INPUT_STYLE = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
  background: '#fff', fontSize: 13.5, color: '#0f172a', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
};

const focusIn  = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

const ModalWrapper = ({ children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    {children}
  </div>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <>
    <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />
    <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
        <XMarkIcon style={{ width: 16, height: 16 }} />
      </button>
    </div>
  </>
);

const EmployeeDetailModal = ({ employee, onClose }) => {
  const status   = getStatus(employee);
  const progress = getProgress(employee);
  const dept     = getDepartment(employee);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { const dt = new Date(d); return isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return 'N/A'; }
  };

  return (
    <ModalWrapper>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ModalHeader title={employee.name} subtitle={employee.position || 'No Position'} onClose={onClose} />
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
          <div style={{ background: 'linear-gradient(135deg, #eef2ff, #faf5ff)', borderRadius: 16, padding: 24, border: '1px solid #e0e7ff', marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', letterSpacing: '0.03em' }}>ONBOARDING PROGRESS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <svg style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
                  <circle cx="55" cy="55" r="48" stroke="#e0e7ff" strokeWidth="9" fill="transparent" />
                  <circle cx="55" cy="55" r="48" stroke="url(#gradDet)" strokeWidth="9" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradDet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{progress}%</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                  {[
                    { label: 'Total',     value: employee.total_tasks || 0,     color: '#0f172a' },
                    { label: 'Completed', value: employee.completed_tasks || 0, color: '#16a34a' },
                    { label: 'Remaining', value: (employee.total_tasks || 0) - (employee.completed_tasks || 0), color: '#d97706' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', background: '#fff', borderRadius: 12, padding: '10px 8px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px', fontWeight: 600 }}>{s.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ height: 8, background: '#e0e7ff', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 99, transition: 'width 1s ease-out' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Employee ID', value: employee.employee_id || 'N/A' },
              { label: 'Email',       value: employee.email || 'N/A' },
              { label: 'Position',    value: employee.position || 'N/A' },
              { label: 'Department',  value: dept || 'N/A' },
              { label: 'Start Date',  value: formatDate(employee.start_date || employee.startDate) },
              { label: 'Phone',       value: employee.phone || 'N/A' },
              { label: 'Status',      value: null, badge: status },
            ].map(item => (
              <div key={item.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 4px', letterSpacing: '0.03em' }}>{item.label.toUpperCase()}</p>
                {item.badge ? <StatusBadge status={item.badge} /> : <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.value}</p>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose}
              style={{ padding: '10px 28px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 10, background: '#e2e8f0', color: '#475569', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#cbd5e1'}
              onMouseLeave={e => e.currentTarget.style.background = '#e2e8f0'}
            >Close</button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

const EmployeeForm = ({ title, subtitle, formData, onChange, onSubmit, onClose, isSubmitting, departments, loadingDepartments, showPasswordField, errors = {}, passwordStrength }) => (
  <ModalWrapper>
    <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 740, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
      <form onSubmit={onSubmit} style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errors.general && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{errors.general}</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>FULL NAME *</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} required disabled={isSubmitting} placeholder="John Doe"
              style={{ ...INPUT_STYLE, borderColor: errors.name ? '#ef4444' : '#e2e8f0' }} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>EMAIL ADDRESS *</label>
            <input type="email" name="email" value={formData.email} onChange={onChange} required disabled={isSubmitting} placeholder="john@company.com"
              style={{ ...INPUT_STYLE, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>
        {showPasswordField && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>PASSWORD *</label>
              <input type="password" name="password" value={formData.password} onChange={onChange} required disabled={isSubmitting} placeholder="Min. 8 characters" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
              {formData.password && passwordStrength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Strength</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score === 3 ? '#f59e0b' : '#22c55e' }}>{passwordStrength.label}</span>
                  </div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: passwordStrength.width, background: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score === 3 ? '#f59e0b' : '#22c55e', borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>EMPLOYEE ID <span style={{ fontWeight: 500, color: '#94a3b8' }}>Optional</span></label>
              <input type="text" name="employee_id" value={formData.employee_id} onChange={onChange} disabled={isSubmitting} placeholder="Auto-generated if empty" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
        )}
        {!showPasswordField && (
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>EMPLOYEE ID</label>
            <input type="text" name="employee_id" value={formData.employee_id} onChange={onChange} placeholder="EMP001" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>POSITION / JOB TITLE</label>
            <input type="text" name="position" value={formData.position} onChange={onChange} disabled={isSubmitting} placeholder="Software Engineer" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>DEPARTMENT</label>
            {loadingDepartments ? (
              <div style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                <div style={{ width: 14, height: 14, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Loading...
              </div>
            ) : (
              <select name="department_id" value={formData.department_id} onChange={onChange} disabled={isSubmitting} style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut}>
                <option value="">No Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>START DATE</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={onChange} disabled={isSubmitting} style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>PHONE NUMBER</label>
            <input type="tel" name="phone" value={formData.phone} onChange={onChange} disabled={isSubmitting} placeholder="+1 (555) 123-4567" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>ADDRESS</label>
          <textarea name="address" value={formData.address} onChange={onChange} rows={2} disabled={isSubmitting} placeholder="123 Main Street, City, State, ZIP"
            style={{ ...INPUT_STYLE, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ fontSize: 12.5, color: '#3b82f6', margin: 0 }}>
            {showPasswordField ? 'A welcome email with login credentials will be sent to the employee.' : 'Changes will be saved immediately.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isSubmitting ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Saving...</> : (showPasswordField ? 'Create Employee' : 'Update Employee')}
          </button>
        </div>
      </form>
    </div>
  </ModalWrapper>
);

const EditEmployeeModal = ({ employee, onClose, onSubmit }) => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: employee.name || '', email: employee.email || '', employee_id: employee.employee_id || '',
    position: employee.position || '', department_id: employee.department_id || '',
    start_date: (employee.start_date || employee.startDate) ? new Date(employee.start_date || employee.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    phone: employee.phone || '', address: employee.address || '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoadingDepartments(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/departments`, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : data?.data || []);
      } catch { setDepartments([]); } finally { setLoadingDepartments(false); }
    })();
  }, []);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(Object.fromEntries(Object.entries(formData).filter(([, v]) => v !== '')));
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'An error occurred.' });
    } finally { setIsSubmitting(false); }
  };

  return <EmployeeForm title="Edit Employee" subtitle={`Editing: ${employee.name}`} formData={formData} onChange={handleChange} onSubmit={handleSubmit} onClose={onClose} isSubmitting={isSubmitting} departments={departments} loadingDepartments={loadingDepartments} showPasswordField={false} errors={errors} />;
};

const DeleteConfirmationModal = ({ employee, onClose, onConfirm }) => (
  <ModalWrapper>
    <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 440, overflow: 'hidden' }}>
      <div style={{ height: 5, background: 'linear-gradient(90deg, #ef4444, #ec4899)' }} />
      <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>Confirm Delete</h2>
        <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
          <XMarkIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="28" height="28" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Delete {employee.name}?</h3>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>This action cannot be undone and will permanently remove all employee data.</p>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 12.5, color: '#b91c1c', margin: '0 0 4px', fontWeight: 600 }}>Employee ID: {employee.employee_id || 'N/A'}</p>
          <p style={{ fontSize: 12.5, color: '#b91c1c', margin: 0 }}>Email: {employee.email || 'N/A'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#ef4444', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Delete Employee</button>
        </div>
      </div>
    </div>
  </ModalWrapper>
);

const EmployeeList = ({ employees: propEmployees = [], isLoading: propLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/employees');
      let rawList = [];
      if (response.data?.status === 'success') rawList = response.data.data || [];
      else if (Array.isArray(response.data)) rawList = response.data;
      else if (Array.isArray(response.data?.data)) rawList = response.data.data;
      else {
        setError(response.data?.message || 'Failed to fetch employees');
        toast.error(response.data?.message || 'Failed to fetch employees');
        return;
      }

      const enriched = await Promise.all(rawList.map(async (emp) => {
        try {
          if (!emp?.id) return { ...emp, progress_percentage: 0, onboarding_status: 'not_started', total_tasks: 0, completed_tasks: 0 };

          let progressData = {};
          try {
            const pr = await api.get(`/employees/${emp.id}/progress`);
            progressData = pr.data?.data || pr.data || {};
          } catch {
            progressData = {
              total:      emp.total_tasks       || 0,
              completed:  emp.completed_tasks   || 0,
              percentage: emp.progress_percentage ?? emp.progressPercentage ?? 0,
            };
          }

          const totalTasks     = progressData.total     || progressData.total_tasks     || 0;
          const completedTasks = progressData.completed || progressData.completed_tasks || 0;
          const percentage     = progressData.percentage ?? progressData.progress_percentage
            ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

          const onboarding_status =
            (percentage >= 100 && totalTasks > 0) ? 'completed'
            : percentage > 0                      ? 'in_progress'
            : (emp.onboarding_status || emp.onboardingStatus || 'not_started');

          return { ...emp, progress_percentage: percentage, onboarding_status, total_tasks: totalTasks, completed_tasks: completedTasks };
        } catch {
          return { ...emp, progress_percentage: emp.progress_percentage ?? emp.progressPercentage ?? 0, total_tasks: 0, completed_tasks: 0 };
        }
      }));

      setEmployees(enriched);
    } catch (err) {
      let msg = 'Failed to connect to server';
      if (err.code === 'ERR_NETWORK') msg = 'Network error - Cannot connect to server.';
      else if (err.response) msg = err.response.data?.message || `Server error: ${err.response.status}`;
      else if (err.request) msg = 'No response from server.';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try {
      await api.put(`/employees/${editEmployee.id}`, employeeData);
      toast.success('Employee updated successfully!');
      setEditEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/employees/${deleteEmployee.id}`);
      toast.success(`Employee "${deleteEmployee.name}" deleted successfully!`);
      setDeleteEmployee(null);
      fetchEmployees();
    } catch (error) {
      const { status, data } = error.response || {};
      let msg = 'Failed to delete employee';
      if (status === 401) { msg = 'Unauthorized'; localStorage.removeItem('token'); window.location.href = '/login'; }
      else if (status === 403) msg = 'Permission denied';
      else if (status === 404) msg = 'Employee not found';
      else if (data?.message) msg = data.message;
      toast.error(msg);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const displayEmployees = propEmployees.length > 0 ? propEmployees : employees;

  const filteredEmployees = displayEmployees.filter(emp => {
    const status = getStatus(emp);
    const dept   = getDepartment(emp);
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus     = filterStatus === 'all' || status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || dept === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const uniqueDepts = [...new Set(displayEmployees.map(e => getDepartment(e)).filter(Boolean))];

  if (propLoading || loading) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '40px', textAlign: 'center', maxWidth: 400 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Error Loading Employees</h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>{error}</p>
          <button onClick={fetchEmployees} style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .row-item { transition: background 0.15s; }
        .row-item:hover { background: #f8fafc !important; }
        .action-btn { transition: background 0.15s; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ animation: 'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>Employee List</h1>
          <p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>View and manage all employees and their onboarding progress</p>
        </div>

        {/* Dark banner with search/filters */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 20, padding: '26px 32px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 120ms both' }}>
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.07 }}>
            <svg width="110" height="110" fill="#fff" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Onboarding Overview</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px' }}>Filter and search across all employee onboarding records.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px auto auto', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} />
                <input type="text" placeholder="Search by name, email, or position..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ ...INPUT_STYLE, paddingLeft: 38, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ ...INPUT_STYLE, width: '100%', background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}>
                <option value="all" style={{ color: '#0f172a' }}>All Status</option>
                <option value="not_started" style={{ color: '#0f172a' }}>Not Started</option>
                <option value="in_progress" style={{ color: '#0f172a' }}>In Progress</option>
                <option value="completed" style={{ color: '#0f172a' }}>Completed</option>
                <option value="overdue" style={{ color: '#0f172a' }}>Overdue</option>
              </select>
              <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}
                style={{ ...INPUT_STYLE, width: '100%', background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}>
                <option value="all" style={{ color: '#0f172a' }}>All Departments</option>
                {uniqueDepts.map(d => <option key={d} value={d} style={{ color: '#0f172a' }}>{d}</option>)}
              </select>
              <button onClick={fetchEmployees}
                style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>Refresh</button>
              <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterDepartment('all'); }}
                style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>Clear</button>
            </div>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>No employees found</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 200ms both' }}>
            {/* Table header — Progress column narrowed since no bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px 160px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Employee', 'Contact', 'Department', 'Status', 'Progress', 'Actions'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>

            {filteredEmployees.map((employee, index) => {
              const status    = getStatus(employee);
              const progress  = getProgress(employee);  
              const dept      = getDepartment(employee);
              const accent    = CARD_COLORS[(employee?.name?.charCodeAt(0) || 0) % CARD_COLORS.length];
              const isCompleted = status === 'completed';
              const isOverdue   = status === 'overdue';
              const progressColor = isCompleted ? '#22c55e' : isOverdue ? '#ef4444' : accent;

              return (
                <div key={employee.id} className="row-item"
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px 160px', padding: '14px 20px', borderBottom: index < filteredEmployees.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center', background: '#fff', animation: `slideUp 0.4s ease-out ${index * 30}ms both` }}>

                  {/* Employee */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AvatarCircle employee={employee} size={38} fontSize={15} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.name || 'Unnamed'}</p>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.position || 'No Position'}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.email || '—'}</p>
                    {employee.phone && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.phone}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    {dept
                      ? <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: '#f1f5f9', color: '#475569' }}>{dept}</span>
                      : <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>}
                  </div>

                  {/* Status */}
                  <div><StatusBadge status={status} /></div>

                  {/* ── PATCH 2: percentage only, no bar ── */}
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: progressColor }}>{progress}%</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[
                      { label: 'View', fn: () => setViewEmployee(employee),   bg: '#eef2ff', color: '#6366f1', hBg: '#e0e7ff' },
                      { label: 'Edit', fn: () => setEditEmployee(employee),   bg: '#eff6ff', color: '#3b82f6', hBg: '#dbeafe' },
                      { label: 'Del',  fn: () => setDeleteEmployee(employee), bg: '#fef2f2', color: '#ef4444', hBg: '#fee2e2' },
                    ].map(btn => (
                      <button key={btn.label}
                        onClick={e => { e.stopPropagation(); btn.fn(); }}
                        className="action-btn"
                        style={{ flex: 1, padding: '6px 4px', fontSize: 11.5, fontWeight: 700, border: 'none', borderRadius: 7, background: btn.bg, color: btn.color, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = btn.hBg}
                        onMouseLeave={e => e.currentTarget.style.background = btn.bg}
                      >{btn.label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewEmployee   && <EmployeeDetailModal employee={viewEmployee}   onClose={() => setViewEmployee(null)} />}
      {editEmployee   && <EditEmployeeModal   employee={editEmployee}   onClose={() => setEditEmployee(null)}   onSubmit={handleUpdateEmployee} />}
      {deleteEmployee && <DeleteConfirmationModal employee={deleteEmployee} onClose={() => setDeleteEmployee(null)} onConfirm={handleConfirmDelete} />}
    </div>
  );
};

export default EmployeeList;