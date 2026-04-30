import React from 'react';
import {
  EnvelopeIcon, PhoneIcon, CalendarIcon, BuildingOfficeIcon,
  IdentificationIcon, MapPinIcon, UserCircleIcon, CheckCircleIcon,
  PencilSquareIcon, BriefcaseIcon, ClockIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000';
const CARD_COLORS = ['#3b82f6', '#f97316', '#22d3ee', '#22c55e', '#a855f7', '#ef4444'];

const getAvatarColor = (name) => CARD_COLORS[(name?.charCodeAt(0) || 0) % CARD_COLORS.length];

const formatDate = (d) => {
  if (!d) return 'Not provided';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return 'Invalid date'; }
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
    <Icon style={{ width: 15, height: 15, color: '#6366f1', flexShrink: 0, marginTop: 3 }} />
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 3px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
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

const ProfileView = ({ user, onEdit, loading = false }) => {
  const [imgErr, setImgErr] = React.useState(false);

  if (loading) return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ height: 18, width: '30%', background: '#f1f5f9', borderRadius: 8 }} />
            <div style={{ height: 13, background: '#f8fafc', borderRadius: 6 }} />
            <div style={{ height: 13, width: '80%', background: '#f8fafc', borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (!user) return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <UserCircleIcon style={{ width: 28, height: 28, color: '#6366f1' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>No Profile Data</p>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>User profile data could not be loaded.</p>
    </div>
  );

  const picUrl = user?.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${API_BASE}${user.profile_picture}`) : null;
  const accentColor = getAvatarColor(user?.name);
  const op = user?.onboardingProgress;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .stat-mini { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-mini:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
      `}</style>

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideUp 0.5s ease-out both' }}>
        <div style={{ height: 110, background: `linear-gradient(135deg, ${accentColor} 0%, #a855f7 100%)`, position: 'relative' }}>
          <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', opacity: 0.12 }}>
            <svg width="100" height="100" fill="#fff" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        </div>
        <div style={{ padding: '0 28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginTop: -52 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              <div style={{ width: 96, height: 96, borderRadius: 20, background: `linear-gradient(135deg, ${accentColor}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid #fff', boxShadow: `0 6px 24px ${accentColor}44`, flexShrink: 0 }}>
                {picUrl && !imgErr ? (
                  <img src={picUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
                ) : (
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div style={{ paddingBottom: 6 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{user?.name || 'No Name'}</h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 10px' }}>{user?.position || 'No Position'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: user?.is_active ? '#dcfce7' : '#fee2e2', color: user?.is_active ? '#15803d' : '#dc2626' }}>
                    <CheckCircleIcon style={{ width: 12, height: 12 }} />
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {user?.email_verified && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#dbeafe', color: '#1d4ed8' }}>Verified</span>
                  )}
                  {user?.employee_id && (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>ID: <strong style={{ color: '#0f172a' }}>{user.employee_id}</strong></span>
                  )}
                  {user?.department_name && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#fdf4ff', color: '#7e22ce' }}>{user.department_name}</span>
                  )}
                </div>
              </div>
            </div>
            {onEdit && (
              <button onClick={onEdit}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.35)', marginBottom: 6, flexShrink: 0, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
                <PencilSquareIcon style={{ width: 15, height: 15 }} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <InfoCard icon={IdentificationIcon} iconBg="linear-gradient(135deg, #3b82f6, #22d3ee)" title="Personal Information" delay={60}>
          <InfoRow icon={IdentificationIcon} label="Full Name"     value={user?.name} />
          <InfoRow icon={EnvelopeIcon}       label="Email"         value={user?.email} />
          <InfoRow icon={PhoneIcon}          label="Phone"         value={user?.phone} />
          <InfoRow icon={CalendarIcon}       label="Date of Birth" value={formatDate(user?.date_of_birth)} />
          <InfoRow icon={MapPinIcon}         label="Address"       value={user?.address} />
        </InfoCard>

        <InfoCard icon={BriefcaseIcon} iconBg="linear-gradient(135deg, #a855f7, #ec4899)" title="Employment Details" delay={120}>
          <InfoRow icon={BuildingOfficeIcon} label="Department"        value={user?.department_name} />
          <InfoRow icon={UserCircleIcon}     label="Position"          value={user?.position} />
          <InfoRow icon={IdentificationIcon} label="Employee ID"       value={user?.employee_id} />
          <InfoRow icon={CalendarIcon}       label="Start Date"        value={formatDate(user?.start_date)} />
          <InfoRow icon={ClockIcon}          label="Onboarding Status" value={user?.onboarding_status?.replace(/_/g, ' ').toUpperCase()} />
          {user?.manager_name && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
              <UserCircleIcon style={{ width: 15, height: 15, color: '#6366f1', flexShrink: 0, marginTop: 3 }} />
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', margin: '0 0 3px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Manager</p>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{user.manager_name}</p>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>{user.manager_email}</p>
              </div>
            </div>
          )}
        </InfoCard>
      </div>

      {(user?.emergency_contact_name || user?.emergency_contact_phone || user?.emergency_contact_relation) && (
        <InfoCard icon={PhoneIcon} iconBg="linear-gradient(135deg, #ef4444, #f97316)" title="Emergency Contact" delay={180}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <InfoRow icon={UserCircleIcon}     label="Contact Name" value={user?.emergency_contact_name} />
            <InfoRow icon={PhoneIcon}          label="Contact Phone" value={user?.emergency_contact_phone} />
            <InfoRow icon={IdentificationIcon} label="Relationship" value={user?.emergency_contact_relation} />
          </div>
        </InfoCard>
      )}

      {op && (
        <InfoCard icon={DocumentTextIcon} iconBg="linear-gradient(135deg, #22c55e, #22d3ee)" title="Onboarding Progress" delay={240}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>Overall Progress</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0 }}>{op.percentage}%</p>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>{op.completed_tasks} of {op.total_tasks} tasks completed</p>
          </div>
          <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: '100%', width: `${op.percentage}%`, background: op.percentage >= 100 ? '#22c55e' : '#6366f1', borderRadius: 99, transition: 'width 0.8s ease-out' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Pending',     value: op.pending_tasks || 0,     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
              { label: 'Completed',   value: op.completed_tasks || 0,   bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
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

      <InfoCard icon={ClockIcon} iconBg="linear-gradient(135deg, #64748b, #94a3b8)" title="Additional Information" delay={300}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <InfoRow icon={CalendarIcon}    label="Account Created"       value={formatDate(user?.created_at)} />
          <InfoRow icon={CalendarIcon}    label="Last Login"            value={formatDate(user?.last_login)} />
          <InfoRow icon={ClockIcon}       label="Last Updated"          value={formatDate(user?.updated_at)} />
          <InfoRow icon={CheckCircleIcon} label="Onboarding Completed"  value={formatDate(user?.onboarding_completed_date)} />
        </div>
      </InfoCard>
    </div>
  );
};

export default ProfileView;