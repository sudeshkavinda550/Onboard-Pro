import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                focus:outline-none ${enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow
                  transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const ToggleRow = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <Toggle enabled={enabled} onChange={onChange} />
  </div>
);

const SectionCard = ({ title, Icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-50">
      <Icon className="h-5 w-5 text-purple-500" />
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm ' +
  'focus:outline-none focus:border-purple-500 transition-colors bg-white';

const TIMEZONES  = ['UTC', 'UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+1 (CET)', 'UTC+5:30 (IST)', 'UTC+8 (SGT)', 'UTC+9 (JST)'];
const SIZES      = ['1–10', '11–50', '51–200', '201–500', '500+'];

const AdminSettings = () => {
  const [company, setCompany]   = useState({ companyName: '', industry: '', headquarters: '', timezone: 'UTC', companySize: '11–50' });
  const [defaults, setDefaults] = useState({ onboardingDays: 10, gracePeriod: 2, approvalTimeout: 3, maxFileSizeMB: 25 });
  const [toggles, setToggles]   = useState({
    sendReminders: true, overdueAlerts: true, completionCongrats: true,
    autoCredentials: true, inactivityReminder: false, weeklyDigest: true,
    require2FA: false, sessionTimeout: true, logDocumentAccess: true,
  });
  const [integrations, setIntegrations] = useState({ sendgrid: false, slack: false, s3: false, googleSSO: false });
  const [loading, setLoading]           = useState(true);
  const [saveMsg, setSaveMsg]           = useState('');
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    adminApi.getSettings()
      .then((res) => {
        const data = res.data || res;
        
        if (data.company) {
          const parsedCompany = {};
          Object.entries(data.company).forEach(([key, value]) => {
            parsedCompany[key] = typeof value === 'string' ? JSON.parse(value) : value;
          });
          setCompany((c) => ({ ...c, ...parsedCompany }));
        }
        
        if (data.defaults) {
          const parsedDefaults = {};
          Object.entries(data.defaults).forEach(([key, value]) => {
            parsedDefaults[key] = typeof value === 'string' ? JSON.parse(value) : value;
          });
          setDefaults((d) => ({ ...d, ...parsedDefaults }));
        }
        
        if (data.toggles) {
          const parsedToggles = {};
          Object.entries(data.toggles).forEach(([key, value]) => {
            parsedToggles[key] = typeof value === 'string' ? JSON.parse(value) : value;
          });
          setToggles((t) => ({ ...t, ...parsedToggles }));
        }
        
        if (data.integrations) {
          const parsedIntegrations = {};
          Object.entries(data.integrations).forEach(([key, value]) => {
            parsedIntegrations[key] = typeof value === 'string' ? JSON.parse(value) : value;
          });
          setIntegrations((i) => ({ ...i, ...parsedIntegrations }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.saveSettings({ company, defaults, toggles });
      setSaveMsg('Settings saved!');
    } catch {
      setSaveMsg('Save failed.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleDanger = async (action) => {
    const msgs = {
      export:         'Download all system data as a ZIP. Continue?',
      resetTemplates: 'PERMANENTLY DELETE all HR-created templates. Are you sure?',
      purgeInactive:  'DELETE accounts inactive for 90+ days. Are you sure?',
    };
    if (!window.confirm(msgs[action])) return;
    try {
      if (action === 'export') {
        const res = await adminApi.exportData({ responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a'); a.href = url; a.download = 'onboardpro-export.zip'; a.click();
        window.URL.revokeObjectURL(url);
      } else {
        await adminApi.dangerAction(action);
        alert('Action completed.');
      }
    } catch { alert('Action failed.'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Configure platform behaviour, defaults, and integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${
              saveMsg.includes('fail') ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {saveMsg.includes('fail') ? '' : <CheckIcon className="h-4 w-4 inline mr-1" />}
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm
                       px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-6">

          <SectionCard title="Company Profile" Icon={BuildingOfficeIcon}>
            <div className="space-y-4">
              {[
                { label: 'Company Name',  key: 'companyName',   placeholder: 'Acme Technologies' },
                { label: 'Industry',      key: 'industry',      placeholder: 'Software / SaaS' },
                { label: 'Headquarters',  key: 'headquarters',  placeholder: 'San Francisco, CA' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <input
                    value={company[key]}
                    onChange={(e) => setCompany({ ...company, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Timezone</label>
                  <select value={company.timezone} onChange={(e) => setCompany({ ...company, timezone: e.target.value })} className={inputCls}>
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Size</label>
                  <select value={company.companySize} onChange={(e) => setCompany({ ...company, companySize: e.target.value })} className={inputCls}>
                    {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Onboarding Defaults" Icon={BuildingOfficeIcon}>
            <div className="space-y-4">
              {[
                { label: 'Default duration (days)',              key: 'onboardingDays',  hint: 'Days allowed to complete onboarding' },
                { label: 'Task grace period (days)',             key: 'gracePeriod',     hint: 'Days before task marked overdue' },
                { label: 'Document approval timeout (days)',     key: 'approvalTimeout', hint: 'Auto-reminder if HR hasn\'t reviewed' },
                { label: 'Max file upload size (MB)',            key: 'maxFileSizeMB',   hint: 'Per-document upload limit' },
              ].map(({ label, key, hint }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <input
                    type="number"
                    value={defaults[key]}
                    onChange={(e) => setDefaults({ ...defaults, [key]: Number(e.target.value) })}
                    className={inputCls}
                  />
                  {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">

          <SectionCard title="Notifications" Icon={BellIcon}>
            <ToggleRow label="Send reminder emails"        description="Auto-remind employees with pending tasks"        enabled={toggles.sendReminders}      onChange={() => setToggles((t) => ({ ...t, sendReminders: !t.sendReminders }))} />
            <ToggleRow label="Overdue task alerts to HR"   description="Notify HR when tasks are overdue"                enabled={toggles.overdueAlerts}      onChange={() => setToggles((t) => ({ ...t, overdueAlerts: !t.overdueAlerts }))} />
            <ToggleRow label="Completion congratulations"  description="Email employee when onboarding finishes"         enabled={toggles.completionCongrats} onChange={() => setToggles((t) => ({ ...t, completionCongrats: !t.completionCongrats }))} />
            <ToggleRow label="Auto-send login credentials" description="Email credentials when employee is created"      enabled={toggles.autoCredentials}    onChange={() => setToggles((t) => ({ ...t, autoCredentials: !t.autoCredentials }))} />
            <ToggleRow label="Inactivity reminder (3d)"   description="Ping employees after 3 days without login"       enabled={toggles.inactivityReminder} onChange={() => setToggles((t) => ({ ...t, inactivityReminder: !t.inactivityReminder }))} />
            <ToggleRow label="Weekly HR digest"            description="Send HR a weekly summary every Monday"           enabled={toggles.weeklyDigest}       onChange={() => setToggles((t) => ({ ...t, weeklyDigest: !t.weeklyDigest }))} />
          </SectionCard>

          <SectionCard title="Security" Icon={ShieldCheckIcon}>
            <ToggleRow label="Require 2FA (Admin & HR)"    description="Two-factor authentication on login"              enabled={toggles.require2FA}         onChange={() => setToggles((t) => ({ ...t, require2FA: !t.require2FA }))} />
            <ToggleRow label="Session timeout (4 hours)"   description="Auto-logout after 4 hours inactivity"            enabled={toggles.sessionTimeout}     onChange={() => setToggles((t) => ({ ...t, sessionTimeout: !t.sessionTimeout }))} />
            <ToggleRow label="Log document access"         description="Record every document download in audit log"     enabled={toggles.logDocumentAccess}  onChange={() => setToggles((t) => ({ ...t, logDocumentAccess: !t.logDocumentAccess }))} />
          </SectionCard>

          <SectionCard title="Integrations" Icon={PuzzlePieceIcon}>
            {[
              { key: 'sendgrid', name: 'SendGrid',  desc: 'Email notifications',           icon: '📧' },
              { key: 'slack',    name: 'Slack',     desc: 'Task reminders & alerts',        icon: '💬' },
              { key: 's3',       name: 'AWS S3',    desc: 'Document file storage',          icon: '☁️' },
              { key: 'googleSSO',name: 'Google SSO',desc: 'Single sign-on via Google',      icon: '🔑' },
            ].map((int) => (
              <div key={int.key} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100
                                  flex items-center justify-center text-lg">
                    {int.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{int.name}</p>
                    <p className="text-xs text-gray-400">{int.desc}</p>
                  </div>
                </div>
                <button
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors ${
                    integrations[int.key]
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {integrations[int.key] ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-red-100 shadow-sm p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-red-50">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <h3 className="text-base font-bold text-red-600">Danger Zone</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { action: 'export',         label: 'Export All Data',         desc: 'Download full backup as ZIP',                   btnCls: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
            { action: 'resetTemplates', label: 'Reset All Templates',     desc: 'Permanently delete all HR templates',            btnCls: 'bg-red-100 text-red-600 hover:bg-red-200' },
            { action: 'purgeInactive',  label: 'Purge Inactive Accounts', desc: 'Remove accounts inactive for 90+ days',          btnCls: 'bg-red-100 text-red-600 hover:bg-red-200' },
          ].map((a) => (
            <div key={a.action} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-1">{a.label}</p>
              <p className="text-xs text-gray-400 mb-4">{a.desc}</p>
              <button
                onClick={() => handleDanger(a.action)}
                className={`w-full text-xs font-bold py-2 rounded-xl transition-colors ${a.btnCls}`}
              >
                {a.label.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;