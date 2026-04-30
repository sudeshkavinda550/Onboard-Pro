import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000';

const INPUT_STYLE = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 13.5, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' };
const LABEL_STYLE = { display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' };
const ERROR_STYLE = { fontSize: 11.5, color: '#dc2626', marginTop: 4 };

const focusIn  = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

const SectionHeader = ({ color, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ width: 4, height: 22, borderRadius: 4, background: color }} />
    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h3>
  </div>
);

const Field = ({ label, error, children }) => (
  <div>
    <label style={LABEL_STYLE}>{label}</label>
    {children}
    {error && <p style={ERROR_STYLE}>{error}</p>}
  </div>
);

const ProfileForm = ({ user, onSubmit, onCancel, onProfilePictureUpload, isLoading }) => {
  const [selectedFile, setSelectedFile]       = useState(null);
  const [previewUrl, setPreviewUrl]           = useState(user?.profilePicture ? `${API_BASE}${user.profilePicture}` : '');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadError, setUploadError]         = useState('');

  const formik = useFormik({
    initialValues: {
      name:                     user?.name || '',
      phone:                    user?.phone || '',
      dateOfBirth:              user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      address:                  user?.address || '',
      position:                 user?.position || '',
      startDate:                user?.startDate ? new Date(user.startDate).toISOString().split('T')[0] : '',
      emergencyContactName:     user?.emergencyContactName || '',
      emergencyContactPhone:    user?.emergencyContactPhone || '',
      emergencyContactRelation: user?.emergencyContactRelation || '',
    },
    validationSchema: Yup.object({
      name:                  Yup.string().required('Name is required'),
      phone:                 Yup.string().matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
      dateOfBirth:           Yup.date().max(new Date(), 'Date of birth cannot be in the future'),
      position:              Yup.string(),
      startDate:             Yup.date(),
      emergencyContactName:  Yup.string(),
      emergencyContactPhone: Yup.string().matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
      emergencyContactRelation: Yup.string(),
    }),
    onSubmit: async (values) => {
      setUploadError('');
      if (selectedFile && onProfilePictureUpload) {
        try {
          setUploadingPicture(true);
          await onProfilePictureUpload(selectedFile);
        } catch (error) {
          let msg = 'Failed to upload profile picture. ';
          if (error.response) {
            const s = error.response.status;
            const srv = error.response.data?.message || error.response.data?.error;
            if (s === 400) msg += srv || 'Invalid file format or size.';
            else if (s === 401) msg += 'Session expired. Please log in again.';
            else if (s === 413) msg += 'File too large. Please select a smaller image.';
            else if (s === 415) msg += 'Unsupported file type. Use JPEG, PNG, GIF, or WebP.';
            else msg += srv || 'An unexpected error occurred.';
          } else if (error.request) { msg += 'Network error. Check your connection.'; }
          else msg += error.message || 'An unexpected error occurred.';
          setUploadError(msg);
          return;
        } finally { setUploadingPicture(false); }
      }
      onSubmit(values);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    if (!file) return;
    const valid = ['image/jpeg','image/jpg','image/png','image/gif','image/webp'];
    if (!valid.includes(file.type)) { setUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)'); e.target.value = ''; return; }
    if (file.size > 2 * 1024 * 1024) { setUploadError('File size must be less than 2MB.'); e.target.value = ''; return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.onerror = () => setUploadError('Failed to read the file. Please try again.');
    reader.readAsDataURL(file);
  };

  const busy = isLoading || uploadingPicture;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)' }} />
      <div style={{ padding: '18px 28px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Edit Profile</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '3px 0 0' }}>Update your personal information and profile picture</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} disabled={busy}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: busy ? 'not-allowed' : 'pointer' }}>
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      <div style={{ padding: 28 }}>
        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ width: 96, height: 96, borderRadius: 18, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid #e0e7ff', flexShrink: 0 }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <PhotoIcon style={{ width: 40, height: 40, color: '#fff' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Profile Photo</p>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 12px' }}>JPG, PNG, GIF or WebP · Max 2MB</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ cursor: busy ? 'not-allowed' : 'pointer' }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleFileChange} disabled={busy} />
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: '#6366f1', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', opacity: busy ? 0.6 : 1 }}>
                    <CloudArrowUpIcon style={{ width: 15, height: 15 }} />
                    {selectedFile ? 'Change Photo' : 'Upload Photo'}
                  </div>
                </label>
                {previewUrl && (
                  <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(user?.profilePicture ? `${API_BASE}${user.profilePicture}` : ''); setUploadError(''); }} disabled={busy}
                    style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    Remove
                  </button>
                )}
                {uploadingPicture && <span style={{ fontSize: 12.5, color: '#6366f1', fontWeight: 700 }}>Uploading...</span>}
              </div>
              {uploadError && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                  <svg style={{ width: 15, height: 15, color: '#dc2626', flexShrink: 0, marginTop: 1 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: 12.5, color: '#dc2626' }}>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionHeader color="linear-gradient(#3b82f6, #22d3ee)" title="Basic Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Full Name *" error={formik.touched.name && formik.errors.name}>
                <input type="text" id="name" name="name" style={INPUT_STYLE} value={formik.values.name}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
              <Field label="Phone Number" error={formik.touched.phone && formik.errors.phone}>
                <input type="tel" id="phone" name="phone" style={INPUT_STYLE} value={formik.values.phone}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
              <Field label="Date of Birth" error={formik.touched.dateOfBirth && formik.errors.dateOfBirth}>
                <input type="date" id="dateOfBirth" name="dateOfBirth" style={INPUT_STYLE} value={formik.values.dateOfBirth}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
            </div>
          </div>

          <div>
            <SectionHeader color="linear-gradient(#a855f7, #ec4899)" title="Employment Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Position" error={formik.touched.position && formik.errors.position}>
                <input type="text" id="position" name="position" style={INPUT_STYLE} value={formik.values.position}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
              <Field label="Start Date" error={formik.touched.startDate && formik.errors.startDate}>
                <input type="date" id="startDate" name="startDate" style={INPUT_STYLE} value={formik.values.startDate}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
            </div>
          </div>

          <div>
            <SectionHeader color="linear-gradient(#22c55e, #22d3ee)" title="Address" />
            <Field label="Full Address">
              <textarea id="address" name="address" rows={3} style={{ ...INPUT_STYLE, resize: 'vertical' }} value={formik.values.address}
                onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
            </Field>
          </div>

          <div>
            <SectionHeader color="linear-gradient(#ef4444, #f97316)" title="Emergency Contact" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Contact Name">
                <input type="text" id="emergencyContactName" name="emergencyContactName" style={INPUT_STYLE} value={formik.values.emergencyContactName}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
              <Field label="Contact Phone" error={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}>
                <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" style={INPUT_STYLE} value={formik.values.emergencyContactPhone}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
              <Field label="Relationship">
                <input type="text" id="emergencyContactRelation" name="emergencyContactRelation" style={INPUT_STYLE} value={formik.values.emergencyContactRelation}
                  onChange={formik.handleChange} onBlur={e => { formik.handleBlur(e); focusOut(e); }} onFocus={focusIn} disabled={busy} />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} disabled={busy}
                style={{ padding: '10px 24px', fontSize: 13.5, fontWeight: 700, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={busy}
              style={{ padding: '10px 28px', fontSize: 13.5, fontWeight: 700, background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.75 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(99,102,241,0.35)', transition: 'opacity 0.15s' }}>
              {busy ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</>
              ) : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileForm;