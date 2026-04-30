import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, UserGroupIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { employeeAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CARD_COLORS = ['#3b82f6', '#f97316', '#22d3ee', '#22c55e', '#a855f7', '#ef4444'];
const API_BASE = 'http://localhost:5000';

const getProfilePicUrl = (employee) => {
  const raw = employee?.profile_picture || employee?.avatar;
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const AvatarCircle = ({ employee, size = 48, fontSize = 18 }) => {
  const color = CARD_COLORS[(employee?.name?.charCodeAt(0) || 0) % CARD_COLORS.length];
  const [imgError, setImgError] = useState(false);
  const picUrl = getProfilePicUrl(employee);
  if (picUrl && !imgError) {
    return <img src={picUrl} alt={employee?.name || 'Employee'} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${color}44` }} onError={() => setImgError(true)} />;
  }
  return <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize, fontWeight: 800, color: '#fff', boxShadow: `0 4px 12px ${color}55` }}>{employee?.name?.charAt(0)?.toUpperCase() || '?'}</div>;
};

const StatusBadge = ({ status }) => {
  const MAP = { not_started: { label: 'Not Started', bg: '#f1f5f9', color: '#475569' }, in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8' }, completed: { label: 'Completed', bg: '#dcfce7', color: '#15803d' } };
  const s = MAP[status] || MAP.not_started;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.color }}>{s.label}</span>;
};

const INPUT_STYLE = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 13.5, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' };
const focusIn  = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

const getReminderMessage = (employee) => {
  const name = employee?.name || 'there';
  const status = employee?.onboarding_status || 'not_started';
  if (status === 'not_started') return `Hi ${name},\n\nWe noticed that you haven't started your onboarding process yet.\n\nYour onboarding portal is ready and waiting for you. Please take a moment to log in and begin your tasks — it only takes a few minutes to get started!\n\nIf you need any assistance or have any questions, our HR team is here to help.\n\nWe're excited to have you on board!\n\nBest regards,\nHR Team`;
  const remaining = (employee.total_tasks || 0) - (employee.completed_tasks || 0);
  return `Hi ${name},\n\nThis is a friendly reminder that you have pending onboarding tasks to complete.\n\nYou've made great progress so far (${employee.progress_percentage || 0}% complete), with ${remaining} task(s) still remaining.\n\nPlease log in to the onboarding portal at your earliest convenience to complete your tasks.\n\nThank you!`;
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEmployee, setReminderEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => { if (!isFetching) fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    if (isFetching) return;
    try {
      setIsFetching(true); setLoading(true);
      const response = await employeeAPI.getAll();
      let employeesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) employeesData = response.data;
        else if (response.data.data && Array.isArray(response.data.data)) employeesData = response.data.data;
        else if (response.data.employees && Array.isArray(response.data.employees)) employeesData = response.data.employees;
      }
      const employeesWithProgress = await Promise.all(employeesData.map(async (employee) => {
        try {
          if (!employee?.id) return { ...employee, progress_percentage: 0, onboarding_status: 'not_started', total_tasks: 0, completed_tasks: 0 };
          let progressData = {};
          try { const pr = await employeeAPI.getProgress(employee.id); progressData = pr.data?.data || pr.data; }
          catch { progressData = { total: employee.total_tasks || 0, completed: employee.completed_tasks || 0, percentage: employee.progress_percentage || 0 }; }
          const totalTasks = progressData.total || progressData.total_tasks || 0;
          const completedTasks = progressData.completed || progressData.completed_tasks || 0;
          const progressPercentage = progressData.percentage || progressData.progress_percentage || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
          const onboarding_status = (progressPercentage >= 100 && totalTasks > 0) ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'not_started';
          return { ...employee, progress_percentage: progressPercentage, onboarding_status, total_tasks: totalTasks, completed_tasks: completedTasks };
        } catch { return { ...employee, progress_percentage: employee.progress_percentage || 0, total_tasks: 0, completed_tasks: 0 }; }
      }));
      setEmployees(employeesWithProgress);
    } catch { toast.error('Failed to load employees'); setEmployees([]); }
    finally { setLoading(false); setIsFetching(false); }
  };

  const handleSelectEmployee = async (employee) => {
    try {
      const response = await employeeAPI.getById(employee.id);
      let employeeData = response.data?.data || response.data?.employee || response.data;
      try {
        let progressData = {};
        try { const pr = await employeeAPI.getProgress(employee.id); progressData = pr.data?.data || pr.data; }
        catch { progressData = { total: employee.total_tasks || 0, completed: employee.completed_tasks || 0, percentage: employee.progress_percentage || 0 }; }
        employeeData.total_tasks = progressData.total || progressData.total_tasks || 0;
        employeeData.completed_tasks = progressData.completed || progressData.completed_tasks || 0;
        employeeData.progress_percentage = progressData.percentage || progressData.progress_percentage || (employeeData.total_tasks > 0 ? Math.round((employeeData.completed_tasks / employeeData.total_tasks) * 100) : 0);
      } catch { employeeData.total_tasks = employee.total_tasks || 0; employeeData.completed_tasks = employee.completed_tasks || 0; employeeData.progress_percentage = employee.progress_percentage || 0; }
      setSelectedEmployee(employeeData); setShowDetails(true);
    } catch { toast.error('Failed to load employee details'); }
  };

  const handleOpenReminder    = (employee) => { setReminderEmployee(employee); setShowReminderModal(true); };
  const handleSendReminderSubmit = async (message) => {
    try { await employeeAPI.sendReminder(reminderEmployee.id, { message }); toast.success(`Reminder sent to ${reminderEmployee.name}!`, { duration: 4000 }); setShowReminderModal(false); setReminderEmployee(null); }
    catch { toast.error('Failed to send reminder.'); }
  };

  const handleSubmitEmployee = async (employeeData) => {
    try {
      await employeeAPI.create(employeeData);
      toast.success(`Employee "${employeeData.name}" created successfully!`, { duration: 5000 });
      setShowCreateModal(false); fetchEmployees();
    } catch (error) {
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message;
        if (msg === 'Email already exists') toast.error('This email is already registered.');
        else if (msg === 'Employee ID already exists') toast.error('This Employee ID is already in use.');
        else toast.error(msg || 'Invalid data.');
      } else toast.error(error.response?.data?.message || 'Failed to create employee.');
      throw error;
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try { await employeeAPI.update(selectedEmployee.id, employeeData); toast.success('Employee updated successfully!', { duration: 4000 }); setShowEditModal(false); setSelectedEmployee(null); fetchEmployees(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to update employee'); }
  };

  const handleConfirmDelete = async () => {
    try {
      await employeeAPI.delete(employeeToDelete.id);
      toast.success(`Employee "${employeeToDelete.name}" deleted successfully!`, { duration: 4000 });
      setShowDeleteModal(false); setEmployeeToDelete(null); fetchEmployees();
      if (selectedEmployee?.id === employeeToDelete.id) { setShowDetails(false); setSelectedEmployee(null); }
    } catch (error) {
      const { status, data } = error.response || {};
      let msg = 'Failed to delete employee';
      if (status === 401) { msg = 'Unauthorized: Please login again'; localStorage.removeItem('token'); window.location.href = '/login'; }
      else if (status === 403) msg = 'You do not have permission to delete employees';
      else if (status === 404) msg = 'Employee not found';
      else if (data?.message) msg = data.message;
      toast.error(msg, { duration: 5000 });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Invalid Date'; return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return 'Invalid Date'; }
  };

  const filteredEmployees = Array.isArray(employees) ? employees.filter(emp => {
    if (!emp) return false;
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) || emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.onboarding_status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || emp.department_name === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  }) : [];

  const uniqueDepartments = [...new Set(employees.map(e => e?.department_name).filter(Boolean))];
  const totalCompleted  = employees.filter(e => e.onboarding_status === 'completed').length;
  const totalInProgress = employees.filter(e => e.onboarding_status === 'in_progress').length;
  const totalNotStarted = employees.filter(e => e.onboarding_status === 'not_started').length;

  const STAT_CARDS = [
    { label: 'TOTAL EMPLOYEES', value: employees.length,  color: '#3b82f6', WatermarkIcon: UserGroupIcon      },
    { label: 'COMPLETED',       value: totalCompleted,    color: '#22c55e', WatermarkIcon: CheckCircleIcon     },
    { label: 'IN PROGRESS',     value: totalInProgress,   color: '#f97316', WatermarkIcon: ClockIcon           },
    { label: 'NOT STARTED',     value: totalNotStarted,   color: '#22d3ee', WatermarkIcon: ClockIcon             },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .emp-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .emp-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.10) !important; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: default; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .action-btn { transition: background 0.15s, color 0.15s; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ animation: 'slideUp 0.5s ease-out both' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>Employees</h1>
          <p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>Monitor and manage employee onboarding progress</p>
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
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 240ms both' }}>
          <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', opacity: 0.07 }}>
            <svg width="120" height="120" fill="#fff" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Employee Management</h2>
              <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>Track onboarding progress, manage employee records, and send reminders to keep your team on track.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={fetchEmployees} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.10)', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>Refresh</button>
              <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }} onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'} onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}><PlusIcon style={{ width: 16, height: 16 }} />Add Employee</button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px 20px', animation: 'slideUp 0.5s ease-out 300ms both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input type="text" placeholder="Search by name, email, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...INPUT_STYLE, paddingLeft: 40 }} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...INPUT_STYLE, width: 160 }} onFocus={focusIn} onBlur={focusOut}>
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} style={{ ...INPUT_STYLE, width: 180 }} onFocus={focusIn} onBlur={focusOut}>
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ position: 'relative', width: 48, height: 48 }}><div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} /><div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><UserGroupIcon style={{ width: 24, height: 24, color: '#6366f1' }} /></div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>No employees found</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredEmployees.map((employee, index) => {
              const accentColor = CARD_COLORS[(employee?.name?.charCodeAt(0) || 0) % CARD_COLORS.length];
              const isCompleted = employee.onboarding_status === 'completed';
              const barColor = isCompleted ? '#22c55e' : accentColor;
              return (
                <div key={employee.id} className="emp-card" style={{ background: '#fff', borderRadius: 20, border: `1px solid ${isCompleted ? '#bbf7d0' : '#e2e8f0'}`, overflow: 'hidden', animation: `slideUp 0.5s ease-out ${index * 40}ms both` }}>
                  <div style={{ height: 5, background: barColor }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                      <AvatarCircle employee={employee} size={48} fontSize={18} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.name || 'Unnamed Employee'}</h3>
                        <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.position || 'No Position'}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.email || 'No Email'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <StatusBadge status={employee.onboarding_status} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{employee.completed_tasks || 0}/{employee.total_tasks || 0} tasks</span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Progress</span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: isCompleted ? '#15803d' : '#0f172a' }}>{employee.progress_percentage || 0}%</span>
                      </div>
                      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${employee.progress_percentage || 0}%`, background: barColor, borderRadius: 99, transition: 'width 0.8s ease-out' }} />
                      </div>
                      {isCompleted && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}><svg width="13" height="13" fill="none" stroke="#15803d" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg><span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>All tasks completed!</span></div>}
                    </div>
                    {employee.department_name && <div style={{ marginBottom: 12 }}><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#f1f5f9', color: '#475569' }}>{employee.department_name}</span></div>}
                    {!isCompleted && (
                      <div style={{ paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={() => handleOpenReminder(employee)} className="action-btn" style={{ width: '100%', padding: '8px', fontSize: 12.5, fontWeight: 700, border: 'none', borderRadius: 8, background: '#eef2ff', color: '#6366f1', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'} onMouseLeave={e => e.currentTarget.style.background = '#eef2ff'}>Send Reminder</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetails && selectedEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AvatarCircle employee={selectedEmployee} size={42} fontSize={16} />
                <div><h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{selectedEmployee.name}</h2><p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>{selectedEmployee.position || 'No Position'}</p></div>
              </div>
              <button onClick={() => setShowDetails(false)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}><XMarkIcon style={{ width: 16, height: 16 }} /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
              <div style={{ background: 'linear-gradient(135deg, #eef2ff, #faf5ff)', borderRadius: 16, padding: 24, border: '1px solid #e0e7ff', marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', letterSpacing: '0.03em' }}>ONBOARDING PROGRESS</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                    <svg style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
                      <circle cx="55" cy="55" r="48" stroke="#e0e7ff" strokeWidth="9" fill="transparent" />
                      <circle cx="55" cy="55" r="48" stroke="url(#grad)" strokeWidth="9" fill="transparent" strokeDasharray={`${2 * Math.PI * 48}`} strokeDashoffset={`${2 * Math.PI * 48 * (1 - (selectedEmployee.progress_percentage || 0) / 100)}`} strokeLinecap="round" />
                      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{selectedEmployee.progress_percentage || 0}%</span></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                      {[{ label: 'Total', value: selectedEmployee.total_tasks || 0, color: '#0f172a' }, { label: 'Completed', value: selectedEmployee.completed_tasks || 0, color: '#16a34a' }, { label: 'Remaining', value: (selectedEmployee.total_tasks || 0) - (selectedEmployee.completed_tasks || 0), color: '#d97706' }].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', background: '#fff', borderRadius: 12, padding: '10px 8px', border: '1px solid #e2e8f0' }}><p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px', fontWeight: 600 }}>{s.label}</p><p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p></div>
                      ))}
                    </div>
                    <div style={{ height: 8, background: '#e0e7ff', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${selectedEmployee.progress_percentage || 0}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 99, transition: 'width 1s ease-out' }} /></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[{ label: 'Employee ID', value: selectedEmployee.employee_id || 'N/A' }, { label: 'Email', value: selectedEmployee.email || 'N/A' }, { label: 'Position', value: selectedEmployee.position || 'N/A' }, { label: 'Department', value: selectedEmployee.department_name || 'N/A' }, { label: 'Start Date', value: formatDate(selectedEmployee.start_date) }, { label: 'Status', value: null, badge: selectedEmployee.onboarding_status }].map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 4px', letterSpacing: '0.03em' }}>{item.label.toUpperCase()}</p>
                    {item.badge ? <StatusBadge status={item.badge} /> : <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.value}</p>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[...(selectedEmployee.onboarding_status !== 'completed' ? [{ label: 'Send Reminder', fn: () => { setShowDetails(false); handleOpenReminder(selectedEmployee); }, bg: '#6366f1', hBg: '#4f46e5' }] : []), { label: 'Edit Employee', fn: () => { setShowDetails(false); setShowEditModal(true); }, bg: '#3b82f6', hBg: '#2563eb' }, { label: 'Delete Employee', fn: () => { setShowDetails(false); setEmployeeToDelete(selectedEmployee); setShowDeleteModal(true); }, bg: '#ef4444', hBg: '#dc2626' }, { label: 'Close', fn: () => setShowDetails(false), bg: '#e2e8f0', hBg: '#cbd5e1', color: '#475569' }].map(btn => (
                  <button key={btn.label} onClick={btn.fn} style={{ flex: 1, padding: '10px', fontSize: 12.5, fontWeight: 700, border: 'none', borderRadius: 10, background: btn.bg, color: btn.color || '#fff', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = btn.hBg} onMouseLeave={e => e.currentTarget.style.background = btn.bg}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && <CreateEmployeeModal onClose={() => setShowCreateModal(false)} onSubmit={handleSubmitEmployee} />}
      {showEditModal && selectedEmployee && <EditEmployeeModal employee={selectedEmployee} onClose={() => { setShowEditModal(false); setSelectedEmployee(null); }} onSubmit={handleUpdateEmployee} />}
      {showDeleteModal && employeeToDelete && <DeleteConfirmationModal employee={employeeToDelete} onClose={() => { setShowDeleteModal(false); setEmployeeToDelete(null); }} onConfirm={handleConfirmDelete} />}
      {showReminderModal && reminderEmployee && <ReminderModal employee={reminderEmployee} onClose={() => { setShowReminderModal(false); setReminderEmployee(null); }} onSend={handleSendReminderSubmit} />}
    </div>
  );
};

const ModalWrapper = ({ children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{children}</div>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <>
    <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />
    <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div><h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>{subtitle && <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '2px 0 0' }}>{subtitle}</p>}</div>
      <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}><XMarkIcon style={{ width: 16, height: 16 }} /></button>
    </div>
  </>
);

const ReminderModal = ({ employee, onClose, onSend }) => {
  const [message, setMessage] = useState(getReminderMessage(employee));
  const [isSending, setIsSending] = useState(false);
  const isNotStarted = employee?.onboarding_status === 'not_started';
  const handleSubmit = async (e) => { e.preventDefault(); if (!message.trim()) { toast.error('Please enter a message'); return; } setIsSending(true); try { await onSend(message); } catch { setIsSending(false); } };
  return (
    <ModalWrapper>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 600, overflow: 'hidden' }}>
        <ModalHeader title="Send Reminder" subtitle={`To: ${employee.name} · ${employee.email}`} onClose={onClose} />
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ background: isNotStarted ? '#fff7ed' : '#eff6ff', border: `1px solid ${isNotStarted ? '#fed7aa' : '#bfdbfe'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: isNotStarted ? '#c2410c' : '#1e40af', margin: '0 0 2px' }}>{isNotStarted ? '⚠ Onboarding Not Started' : 'Employee Progress'}</p>
            <p style={{ fontSize: 12.5, color: isNotStarted ? '#ea580c' : '#3b82f6', margin: 0 }}>{isNotStarted ? 'This employee has not yet begun their onboarding process.' : `${employee.completed_tasks || 0}/${employee.total_tasks || 0} tasks completed (${employee.progress_percentage || 0}%)`}</p>
          </div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, letterSpacing: '0.04em' }}>REMINDER MESSAGE</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={9} disabled={isSending} style={{ ...INPUT_STYLE, resize: 'vertical', marginBottom: 6 }} onFocus={focusIn} onBlur={focusOut} />
          <p style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 20 }}>This message will be sent via email notification</p>
          <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
            <button type="button" onClick={onClose} disabled={isSending} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={isSending} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isSending ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Sending...</> : 'Send Reminder'}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

const EmployeeForm = ({ title, subtitle, formData, onChange, onSubmit, onClose, isSubmitting, departments, loadingDepartments, showPasswordField, errors = {}, passwordStrength }) => (
  <ModalWrapper>
    <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 740, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
      <form onSubmit={onSubmit} style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errors.general && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px' }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{errors.general}</p></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>FULL NAME *</label><input type="text" name="name" value={formData.name} onChange={onChange} required disabled={isSubmitting} placeholder="John Doe" style={{ ...INPUT_STYLE, borderColor: errors.name ? '#ef4444' : '#e2e8f0' }} onFocus={focusIn} onBlur={focusOut} />{errors.name && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>⚠ {errors.name}</p>}</div>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>EMAIL ADDRESS *</label><input type="email" name="email" value={formData.email} onChange={onChange} required disabled={isSubmitting} placeholder="john@company.com" style={{ ...INPUT_STYLE, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} onFocus={focusIn} onBlur={focusOut} />{errors.email && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>⚠ {errors.email}</p>}</div>
        </div>
        {showPasswordField && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>PASSWORD *</label>
              <input type="password" name="password" value={formData.password} onChange={onChange} required disabled={isSubmitting} placeholder="Min. 8 characters" style={{ ...INPUT_STYLE, borderColor: errors.password ? '#ef4444' : '#e2e8f0' }} onFocus={focusIn} onBlur={focusOut} />
              {formData.password && passwordStrength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 11.5, color: '#94a3b8' }}>Strength</span><span style={{ fontSize: 11.5, fontWeight: 700, color: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score === 3 ? '#f59e0b' : '#22c55e' }}>{passwordStrength.label}</span></div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: passwordStrength.width, background: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score === 3 ? '#f59e0b' : '#22c55e', borderRadius: 99, transition: 'width 0.4s ease' }} /></div>
                </div>
              )}
            </div>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>EMPLOYEE ID <span style={{ fontWeight: 500, color: '#94a3b8' }}>Optional</span></label><input type="text" name="employee_id" value={formData.employee_id} onChange={onChange} disabled={isSubmitting} placeholder="Auto-generated if empty" style={{ ...INPUT_STYLE, borderColor: errors.employee_id ? '#ef4444' : '#e2e8f0' }} onFocus={focusIn} onBlur={focusOut} />{errors.employee_id && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>⚠ {errors.employee_id}</p>}</div>
          </div>
        )}
        {!showPasswordField && <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>EMPLOYEE ID</label><input type="text" name="employee_id" value={formData.employee_id} onChange={onChange} placeholder="EMP001" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} /></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>POSITION / JOB TITLE</label><input type="text" name="position" value={formData.position} onChange={onChange} disabled={isSubmitting} placeholder="Software Engineer" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} /></div>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>DEPARTMENT</label>{loadingDepartments ? <div style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><div style={{ width: 14, height: 14, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Loading...</div> : <select name="department_id" value={formData.department_id} onChange={onChange} disabled={isSubmitting} style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut}><option value="">No Department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>START DATE</label><input type="date" name="start_date" value={formData.start_date} onChange={onChange} disabled={isSubmitting} style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} /></div>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>PHONE NUMBER</label><input type="tel" name="phone" value={formData.phone} onChange={onChange} disabled={isSubmitting} placeholder="+1 (555) 123-4567" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} /></div>
        </div>
        <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>ADDRESS</label><textarea name="address" value={formData.address} onChange={onChange} rows={2} disabled={isSubmitting} placeholder="123 Main Street, City, State, ZIP" style={{ ...INPUT_STYLE, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} /></div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px' }}><p style={{ fontSize: 12.5, color: '#3b82f6', margin: 0 }}>{showPasswordField ? 'A welcome email with login credentials will be sent to the employee.' : 'Changes will be saved immediately.'}</p></div>
        <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', fontSize: 13.5, fontWeight: 700, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isSubmitting ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Saving...</> : (showPasswordField ? 'Create Employee' : 'Update Employee')}
          </button>
        </div>
      </form>
    </div>
  </ModalWrapper>
);

const CreateEmployeeModal = ({ onClose, onSubmit }) => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', width: '0%' });
  const [formData, setFormData] = useState({ name: '', email: '', password: '', employee_id: '', position: '', department_id: '', start_date: new Date().toISOString().split('T')[0], phone: '', address: '' });

  useEffect(() => { (async () => { try { setLoadingDepartments(true); const token = localStorage.getItem('token'); const res = await fetch('http://localhost:5000/api/v1/departments', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }); const data = await res.json(); setDepartments(Array.isArray(data) ? data : data?.data || []); } catch { setDepartments([]); } finally { setLoadingDepartments(false); } })(); }, []);

  const calcStrength = (pw) => { if (!pw) return { score: 0, label: '', width: '0%' }; let s = 0; if (pw.length >= 8) s++; if (pw.length >= 12) s++; if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^a-zA-Z0-9]/.test(pw)) s++; return [{ score: 0, label: '', width: '0%' }, { score: 1, label: 'Weak', width: '20%' }, { score: 2, label: 'Fair', width: '40%' }, { score: 3, label: 'Good', width: '60%' }, { score: 4, label: 'Strong', width: '80%' }, { score: 5, label: 'Very Strong', width: '100%' }][s]; };

  const handleChange = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: '' })); if (name === 'password') setPasswordStrength(calcStrength(value)); };

  const handleSubmit = async (e) => { e.preventDefault(); setErrors({}); setIsSubmitting(true); try { const cleaned = Object.fromEntries(Object.entries(formData).filter(([, v]) => v !== '')); await onSubmit(cleaned); } catch (error) { const msg = error.response?.data?.message; if (msg === 'Email already exists') setErrors({ email: 'This email is already registered.' }); else if (msg === 'Employee ID already exists') setErrors({ employee_id: 'This Employee ID is already in use.' }); else setErrors({ general: msg || 'An error occurred. Please try again.' }); } finally { setIsSubmitting(false); } };

  return <EmployeeForm title="Add New Employee" formData={formData} onChange={handleChange} onSubmit={handleSubmit} onClose={onClose} isSubmitting={isSubmitting} departments={departments} loadingDepartments={loadingDepartments} showPasswordField errors={errors} passwordStrength={passwordStrength} />;
};

const EditEmployeeModal = ({ employee, onClose, onSubmit }) => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState({ name: employee.name || '', email: employee.email || '', employee_id: employee.employee_id || '', position: employee.position || '', department_id: employee.department_id || '', start_date: employee.start_date ? new Date(employee.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], phone: employee.phone || '', address: employee.address || '' });

  useEffect(() => { (async () => { try { setLoadingDepartments(true); const token = localStorage.getItem('token'); const res = await fetch('http://localhost:5000/api/v1/departments', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }); const data = await res.json(); setDepartments(Array.isArray(data) ? data : data?.data || []); } catch { setDepartments([]); } finally { setLoadingDepartments(false); } })(); }, []);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(Object.fromEntries(Object.entries(formData).filter(([, v]) => v !== ''))); };

  return <EmployeeForm title="Edit Employee" subtitle={`Editing: ${employee.name}`} formData={formData} onChange={handleChange} onSubmit={handleSubmit} onClose={onClose} isSubmitting={false} departments={departments} loadingDepartments={loadingDepartments} showPasswordField={false} />;
};

const DeleteConfirmationModal = ({ employee, onClose, onConfirm }) => (
  <ModalWrapper>
    <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 440, overflow: 'hidden' }}>
      <div style={{ height: 5, background: 'linear-gradient(90deg, #ef4444, #ec4899)' }} />
      <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>Confirm Delete</h2>
        <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}><XMarkIcon style={{ width: 16, height: 16 }} /></button>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><svg width="28" height="28" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
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

export default Employees;