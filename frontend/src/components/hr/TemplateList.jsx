import React from 'react';
import { PencilIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/24/outline';

const CARD_COLORS = [
  { bar: '#3b82f6', badge: { background: '#dbeafe', color: '#1d4ed8' }, assign: '#3b82f6' },
  { bar: '#f97316', badge: { background: '#ffedd5', color: '#c2410c' }, assign: '#f97316' },
  { bar: '#22d3ee', badge: { background: '#cffafe', color: '#0e7490' }, assign: '#22d3ee' },
  { bar: '#22c55e', badge: { background: '#dcfce7', color: '#15803d' }, assign: '#22c55e' },
  { bar: '#a855f7', badge: { background: '#f3e8ff', color: '#7e22ce' }, assign: '#a855f7' },
  { bar: '#ef4444', badge: { background: '#fee2e2', color: '#b91c1c' }, assign: '#ef4444' },
];

const TemplateList = ({ templates = [], onEdit, onDelete, onDuplicate, onPreview, onAssign, isLoading }) => {

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ height: 6, background: '#e2e8f0' }} />
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, marginBottom: 8, width: '70%' }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '90%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {[60, 90, 80].map((w, j) => <div key={j} style={{ height: 24, background: '#f1f5f9', borderRadius: 8, width: w }} />)}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, height: 36, background: '#f1f5f9', borderRadius: 10 }} />
                <div style={{ flex: 1, height: 36, background: '#f1f5f9', borderRadius: 10 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <DocumentDuplicateIcon style={{ width: 30, height: 30, color: '#6366f1' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>No templates yet</h3>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
          Get started by creating your first onboarding template to streamline the new-hire process.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {templates.map((template, index) => {
        const theme = CARD_COLORS[index % CARD_COLORS.length];
        return (
          <div
            key={template.id}
            style={{
              background: '#fff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: `slideUp 0.5s ease-out ${index * 50}ms both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ height: 6, background: theme.bar }} />

            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.badge.background, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DocumentDuplicateIcon style={{ width: 20, height: 20, color: theme.badge.color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {template.name}
                    </h3>
                    <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {template.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  {[
                    { fn: () => onEdit(template), icon: <PencilIcon style={{ width: 14, height: 14 }} />, hoverBg: '#eef2ff', hoverColor: '#6366f1' },
                    { fn: () => onDuplicate(template), icon: <DocumentDuplicateIcon style={{ width: 14, height: 14 }} />, hoverBg: '#f0fdf4', hoverColor: '#16a34a' },
                    { fn: () => onDelete(template.id), icon: <TrashIcon style={{ width: 14, height: 14 }} />, hoverBg: '#fef2f2', hoverColor: '#ef4444' },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.fn}
                      style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = btn.hoverBg; e.currentTarget.style.color = btn.hoverColor; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, border: `1px solid ${theme.bar}33`, background: theme.badge.background, color: theme.badge.color }}>
                  {template.tasks_count || template.tasksCount || 0} Tasks
                </span>
                {template.department_name && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#f1f5f9', color: '#475569' }}>
                    {template.department_name}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                  {new Date(template.created_at || template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  onClick={() => onPreview(template)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', fontSize: 12.5, fontWeight: 700, borderRadius: 10, border: `1.5px solid ${theme.bar}44`, background: theme.badge.background, color: theme.badge.color, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <EyeIcon style={{ width: 14, height: 14 }} />
                  Preview
                </button>
                <button
                  onClick={() => onAssign(template)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px', fontSize: 12.5, fontWeight: 700, borderRadius: 10, border: 'none', background: theme.bar, color: '#fff', cursor: 'pointer', boxShadow: `0 4px 12px ${theme.bar}44`, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TemplateList;