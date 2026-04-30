import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { taskApi } from '../../api/taskApi';
import {
  EnvelopeIcon, PhoneIcon, CalendarIcon, BuildingOfficeIcon,
  IdentificationIcon, MapPinIcon, UserCircleIcon, CheckCircleIcon,
  PencilSquareIcon, XMarkIcon, ArrowLeftIcon, BriefcaseIcon,
  ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ProfileForm from '../../components/profile/ProfileForm';

const API_BASE = 'http://localhost:5000';

const formatDate = (d) => {
  if (!d) return 'Not provided';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return 'Invalid date'; }
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ width: 30, height: 30, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ width: 14, height: 14, color: '#6366f1' }} />
    </div>
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', margin: 0 }}>{value || 'Not provided'}</p>
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, iconBg, title, delay = 0, children }) => (
  <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, animation: `slideUp 0.5s ease-out ${delay}ms both` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 17, height: 17, color: '#fff' }} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h3>
    </div>
    {children}
  </div>
);

const TaskDeadlineCalendar = ({ tasks = [] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const deadlineMap = {};
  tasks.forEach(t => {
    if (!t.due_date) return;
    const d = new Date(t.due_date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!deadlineMap[key]) deadlineMap[key] = [];
    deadlineMap[key].push(t);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const getKey = (d) => `${year}-${month}-${d}`;
  const getStatus = (d) => {
    const ts = deadlineMap[getKey(d)];
    if (!ts || ts.length === 0) return null;
    if (ts.some(t => t.status !== 'completed' && new Date(t.due_date) < today)) return 'overdue';
    if (ts.every(t => t.status === 'completed')) return 'completed';
    return 'upcoming';
  };
  const STATUS_COLOR = { overdue: '#ef4444', upcoming: '#f97316', completed: '#22c55e' };

  const upcoming = tasks
    .filter(t => { if (!t.due_date || t.status === 'completed') return false; const d = new Date(t.due_date); return d >= today && d <= new Date(today.getTime() + 30 * 86400000); })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 6);
  const overdue = tasks.filter(t => t.due_date && t.status !== 'completed' && new Date(t.due_date) < today);

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out 300ms both' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon style={{ width: 17, height: 17, color: '#a5b4fc' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>Task Deadlines</h3>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Calendar view of your due dates</p>
          </div>
        </div>
        {overdue.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.20)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.30)' }}>
            <ExclamationTriangleIcon style={{ width: 12, height: 12 }} /> {overdue.length} Overdue
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px' }}>
        <div style={{ padding: 24, borderRight: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <ChevronLeftIcon style={{ width: 14, height: 14 }} />
            </button>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{MONTH_NAMES[month]} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <ChevronRightIcon style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {DAY_NAMES.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const status = getStatus(day);
              const dotColor = status ? STATUS_COLOR[status] : null;
              const todayCell = isToday(day);
              return (
                <div key={day} style={{ position: 'relative', height: 38, borderRadius: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: todayCell ? 800 : 500, background: todayCell ? '#6366f1' : status ? `${dotColor}14` : 'transparent', color: todayCell ? '#fff' : status ? dotColor : '#374151', border: todayCell ? 'none' : status ? `1.5px solid ${dotColor}40` : '1.5px solid transparent' }}>
                  {day}
                  {status && <div style={{ width: 5, height: 5, borderRadius: '50%', background: todayCell ? '#fff' : dotColor, position: 'absolute', bottom: 4 }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            {[{ color: '#6366f1', label: 'Today' }, { color: '#f97316', label: 'Upcoming' }, { color: '#22c55e', label: 'Completed' }, { color: '#ef4444', label: 'Overdue' }].map(item => (
              <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />{item.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 12px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Next 30 Days</p>
          {upcoming.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
              <CheckCircleIcon style={{ width: 32, height: 32, color: '#22c55e', marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', textAlign: 'center' }}>All clear!</p>
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0 }}>No upcoming deadlines</p>
            </div>
          ) : upcoming.map(task => {
            const daysLeft = Math.ceil((new Date(task.due_date) - today) / 86400000);
            const urgent = daysLeft <= 2;
            return (
              <div key={task.id} style={{ padding: '10px 12px', borderRadius: 12, marginBottom: 7, background: urgent ? '#fff7ed' : '#f8fafc', border: `1px solid ${urgent ? '#fed7aa' : '#f1f5f9'}` }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CalendarIcon style={{ width: 10, height: 10 }} />{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: urgent ? '#ea580c' : '#3b82f6', background: urgent ? '#ffedd5' : '#dbeafe', padding: '1px 7px', borderRadius: 6 }}>
                    {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                  </span>
                </div>
              </div>
            );
          })}
          {overdue.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ExclamationTriangleIcon style={{ width: 11, height: 11 }} /> Overdue
              </p>
              {overdue.slice(0, 3).map(task => (
                <div key={task.id} style={{ padding: '8px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                  <p style={{ fontSize: 11, color: '#dc2626', margin: 0 }}>Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const taskId    = location.state?.taskId;
  const taskTitle = location.state?.taskTitle;
  const returnTo  = location.state?.returnTo || '/employee/tasks';

  const [user, setUser]         = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imgErr, setImgErr]     = useState(false);

  useEffect(() => { fetchProfile(); fetchAllTasks(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getProfile();
      setUser({ ...res.data, dateOfBirth: res.data.date_of_birth, employeeId: res.data.employee_id, profilePicture: res.data.profile_picture, startDate: res.data.start_date, emergencyContactName: res.data.emergency_contact_name, emergencyContactPhone: res.data.emergency_contact_phone, emergencyContactRelation: res.data.emergency_contact_relation, department: res.data.department_name || res.data.department_id, manager: res.data.manager_name ? { name: res.data.manager_name, email: res.data.manager_email } : null, onboardingProgress: res.data.onboardingProgress || { total: 0, completed: 0, percentage: 0 } });
      setImgErr(false);
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const fetchAllTasks = async () => {
    try {
      const res = await taskApi.getMyTasks();
      setAllTasks(Array.isArray(res.data) ? res.data : (res.data?.tasks || res.data?.data || []));
    } catch {}
  };

  const handleUpdateProfile = async (data) => {
    try {
      setUpdating(true);
      const payload = {};
      if (data.name?.trim()) payload.name = data.name.trim();
      if (data.phone?.trim()) payload.phone = data.phone.trim();
      if (data.dateOfBirth) payload.date_of_birth = data.dateOfBirth;
      if (data.address?.trim()) payload.address = data.address.trim();
      if (data.position?.trim()) payload.position = data.position.trim();
      if (data.startDate) payload.start_date = data.startDate;
      if (data.emergencyContactName?.trim()) payload.emergency_contact_name = data.emergencyContactName.trim();
      if (data.emergencyContactPhone?.trim()) payload.emergency_contact_phone = data.emergencyContactPhone.trim();
      if (data.emergencyContactRelation?.trim()) payload.emergency_contact_relation = data.emergencyContactRelation.trim();
      if (!Object.keys(payload).length) { toast.warning('Please update at least one field'); setUpdating(false); return; }
      await authApi.updateProfile(payload);
      await fetchProfile();
      setEditing(false);
      toast.success('Profile updated successfully');
      if (taskId) {
        if (window.confirm('Profile updated!\n\nMark this task as complete?')) {
          try { await taskApi.updateTaskStatus(taskId, { status: 'completed' }); setTimeout(() => navigate(returnTo, { state: { successMessage: 'Profile updated and task completed!' } }), 500); }
          catch { toast.warning('Profile saved but could not mark task complete.'); }
        }
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setUpdating(false); }
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const res = await authApi.uploadProfilePicture(file);
      if (res?.data?.profile_picture) { setUser(prev => ({ ...prev, profilePicture: res.data.profile_picture })); setImgErr(false); toast.success('Profile picture uploaded'); await fetchProfile(); }
      return res?.data?.profile_picture;
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to upload profile picture'); throw err; }
  };

  const handleMarkTaskComplete = async () => {
    if (!taskId) return;
    if (window.confirm('Mark this task as complete?')) {
      try { await taskApi.updateTaskStatus(taskId, { status: 'completed' }); navigate(returnTo, { state: { successMessage: 'Task marked as complete!' } }); }
      catch { toast.error('Failed to mark task as complete.'); }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e2e8f0', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  );

  const profilePicUrl = user?.profilePicture ? `${API_BASE}${user.profilePicture}` : null;
  const op = user?.onboardingProgress;

  const TaskBanner = () => taskId ? (
    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideUp 0.5s ease-out both' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', margin: '0 0 3px', letterSpacing: '0.05em' }}>ACTIVE TASK</p>
        <p style={{ fontSize: 14.5, fontWeight: 800, color: '#1e3a8a', margin: 0 }}>{taskTitle}</p>
      </div>
      <button onClick={() => navigate(returnTo)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1.5px solid #bfdbfe', color: '#1d4ed8', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Back to Tasks
      </button>
    </div>
  ) : null;

  if (editing) return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TaskBanner />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div><h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>Edit Profile</h1><p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>Update your personal information</p></div>
          <div style={{ display: 'flex', gap: 10 }}>
            {taskId && <button onClick={handleMarkTaskComplete} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#22c55e', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><CheckCircleIcon style={{ width: 16, height: 16 }} /> Mark Complete</button>}
            <button onClick={() => setEditing(false)} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><XMarkIcon style={{ width: 16, height: 16 }} /> Cancel</button>
          </div>
        </div>
        <ProfileForm user={user} onSubmit={handleUpdateProfile} onCancel={() => setEditing(false)} onProfilePictureUpload={handleProfilePictureUpload} isLoading={updating} />
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#f1f5f9', padding: '28px 28px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-mini { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-mini:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
      `}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <TaskBanner />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, animation: 'slideUp 0.5s ease-out both' }}>
          <div><h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>My Profile</h1><p style={{ fontSize: 14.5, color: '#64748b', margin: '4px 0 0' }}>View and manage your personal information</p></div>
          <div style={{ display: 'flex', gap: 10 }}>
            {taskId && <button onClick={handleMarkTaskComplete} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#22c55e', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><CheckCircleIcon style={{ width: 16, height: 16 }} /> Mark Complete</button>}
            <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}><PencilSquareIcon style={{ width: 16, height: 16 }} /> Edit Profile</button>
          </div>
        </div>

        {/* Dark hero banner with big circle avatar */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 22, overflow: 'hidden', position: 'relative', animation: 'slideUp 0.5s ease-out both' }}>
          <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', opacity: 0.04, pointerEvents: 'none' }}>
            <svg width="160" height="160" fill="#fff" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 28, padding: '28px 32px', flexWrap: 'wrap' }}>
            {/* Large circle avatar */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '4px solid rgba(255,255,255,0.20)', boxShadow: '0 8px 32px rgba(99,102,241,0.40)' }}>
              {profilePicUrl && !imgErr
                ? <img src={profilePicUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
                : <span style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
              }
            </div>
            {/* Name / role / badges */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 5px', lineHeight: 1.1 }}>{user?.name || 'No Name'}</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 14px' }}>{user?.position || 'No Position'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.20)', color: '#86efac', border: '1px solid rgba(34,197,94,0.30)' }}><CheckCircleIcon style={{ width: 12, height: 12 }} /> Active</span>
                {user?.email_verified && <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(59,130,246,0.20)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.30)' }}>Verified</span>}
                {user?.employeeId && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>ID: <strong style={{ color: '#fff' }}>{user.employeeId}</strong></span>}
                {user?.department && <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(168,85,247,0.20)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.30)' }}>{user.department}</span>}
              </div>
            </div>
            <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            {/* Quick contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
              {[{ Icon: EnvelopeIcon, val: user?.email }, { Icon: PhoneIcon, val: user?.phone || 'Not provided' }, { Icon: CalendarIcon, val: `Joined ${formatDate(user?.startDate)}` }].map(({ Icon, val }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.65)' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal + Employment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InfoCard icon={IdentificationIcon} iconBg="linear-gradient(135deg, #3b82f6, #22d3ee)" title="Personal Information" delay={60}>
            <InfoRow icon={IdentificationIcon} label="Full Name"     value={user?.name} />
            <InfoRow icon={EnvelopeIcon}        label="Email"         value={user?.email} />
            <InfoRow icon={PhoneIcon}           label="Phone"         value={user?.phone} />
            <InfoRow icon={CalendarIcon}        label="Date of Birth" value={formatDate(user?.dateOfBirth)} />
            <InfoRow icon={MapPinIcon}          label="Address"       value={user?.address} />
          </InfoCard>
          <InfoCard icon={BriefcaseIcon} iconBg="linear-gradient(135deg, #a855f7, #ec4899)" title="Employment Details" delay={120}>
            <InfoRow icon={BuildingOfficeIcon}  label="Department"  value={user?.department} />
            <InfoRow icon={UserCircleIcon}      label="Position"    value={user?.position} />
            <InfoRow icon={IdentificationIcon}  label="Employee ID" value={user?.employeeId} />
            <InfoRow icon={CalendarIcon}        label="Start Date"  value={formatDate(user?.startDate)} />
            {user?.manager && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCircleIcon style={{ width: 14, height: 14, color: '#6366f1' }} />
                </div>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Manager</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{user.manager.name}</p>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>{user.manager.email}</p>
                </div>
              </div>
            )}
          </InfoCard>
        </div>

        {/* Emergency Contact */}
        {(user?.emergencyContactName || user?.emergencyContactPhone || user?.emergencyContactRelation) && (
          <InfoCard icon={PhoneIcon} iconBg="linear-gradient(135deg, #ef4444, #f97316)" title="Emergency Contact" delay={180}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <InfoRow icon={UserCircleIcon}     label="Contact Name"  value={user?.emergencyContactName} />
              <InfoRow icon={PhoneIcon}          label="Contact Phone" value={user?.emergencyContactPhone} />
              <InfoRow icon={IdentificationIcon} label="Relationship"  value={user?.emergencyContactRelation} />
            </div>
          </InfoCard>
        )}

        {/* Onboarding Progress */}
        {op && op.total > 0 && (
          <InfoCard icon={CheckCircleIcon} iconBg="linear-gradient(135deg, #22c55e, #22d3ee)" title="Onboarding Progress" delay={240}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>Overall Progress</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0 }}>{op.percentage}%</p>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>{op.completed} of {op.total} tasks completed</p>
            </div>
            <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ height: '100%', width: `${op.percentage}%`, background: op.percentage >= 100 ? '#22c55e' : '#6366f1', borderRadius: 99, transition: 'width 0.8s ease-out' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Pending',     value: op.total - op.completed,   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                { label: 'Completed',   value: op.completed,              bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
                { label: 'In Progress', value: op.in_progress_tasks || 0, bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
                { label: 'Overdue',     value: op.overdue_tasks || 0,     bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
              ].map(s => (
                <div key={s.label} className="stat-mini" style={{ padding: 16, borderRadius: 16, background: s.bg, border: `1px solid ${s.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: s.color, margin: '0 0 6px' }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </InfoCard>
        )}

        {/* Task Deadline Calendar */}
        <TaskDeadlineCalendar tasks={allTasks} />

      </div>
    </div>
  );
};

export default Profile;