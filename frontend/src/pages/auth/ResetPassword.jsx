import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) setFormData(prev => ({ ...prev, email: location.state.email }));
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'otp') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 6) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.otp) newErrors.otp = 'OTP is required';
    else if (formData.otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    try {
      await resetPassword(formData.email, formData.otp, formData.password);
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } }), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reset password. Please check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh', width: '100%', position: 'fixed', inset: 0,
      backgroundImage: 'url(/images/background.png)', backgroundSize: 'cover',
      backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .rp-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%); }
        .rp-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #fff; font-size: 14px; color: #0f172a; outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit; box-sizing: border-box;
        }
        .rp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
        .rp-input.err { border-color: #ef4444; }
        .rp-input.err:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
        .rp-btn {
          width: 100%; padding: 12px; border: none; border-radius: 10px; background: #2563eb;
          color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s ease, transform 0.1s ease; font-family: inherit;
        }
        .rp-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .rp-back-link {
          position: absolute; top: 20px; left: 20px; z-index: 20;
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.85); font-size: 13.5px; font-weight: 500;
          text-decoration: none; padding: 7px 14px; border-radius: 10px;
          background: rgba(0,0,0,0.25); transition: background 0.15s ease;
        }
        .rp-back-link:hover { background: rgba(0,0,0,0.4); color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; padding: 2px; }
        .eye-btn:hover { color: #64748b; }
        .err-msg { font-size: 12px; color: #ef4444; margin-top: 4px; display: flex; align-items: center; gap: 3px; }
      `}</style>

      <div className="rp-overlay"></div>
      <Link to="/" className="rp-back-link">← Back to Home</Link>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, margin: '60px 16px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>O</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Reset Password</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>Enter OTP and new password</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
          {!success ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {apiError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>⚠</span>
                  <p style={{ fontSize: 13.5, color: '#dc2626', margin: 0 }}>{apiError}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`rp-input${errors.email ? ' err' : ''}`} placeholder="you@example.com" />
                {errors.email && <p className="err-msg">⚠ {errors.email}</p>}
              </div>

              <div>
                <label htmlFor="otp" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>6-Digit OTP</label>
                <input
                  id="otp" name="otp" type="text" inputMode="numeric" maxLength="6"
                  value={formData.otp} onChange={handleChange}
                  className={`rp-input${errors.otp ? ' err' : ''}`}
                  placeholder="123456"
                  style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.2em', fontFamily: 'monospace' }}
                />
                {errors.otp && <p className="err-msg">⚠ {errors.otp}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Enter the 6-digit OTP sent to your email</span>
                  <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2563eb', fontFamily: 'inherit', padding: 0 }}>Resend OTP</button>
                </div>
              </div>

              {[
                { id: 'password', label: 'New Password', show: showPassword, toggle: () => setShowPassword(!showPassword), hint: 'Must be at least 8 characters' },
                { id: 'confirmPassword', label: 'Confirm New Password', show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword), hint: null },
              ].map(({ id, label, show, toggle, hint }) => (
                <div key={id}>
                  <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input id={id} name={id} type={show ? 'text' : 'password'} autoComplete="new-password" value={formData[id]} onChange={handleChange} className={`rp-input${errors[id] ? ' err' : ''}`} placeholder="••••••••" style={{ paddingRight: 42 }} />
                    <button type="button" onClick={toggle} className="eye-btn">{show ? <EyeIcon /> : <EyeOffIcon />}</button>
                  </div>
                  {errors[id] && <p className="err-msg">⚠ {errors[id]}</p>}
                  {hint && !errors[id] && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{hint}</p>}
                </div>
              ))}

              <button type="submit" disabled={loading} className="rp-btn" style={{ marginTop: 4 }}>
                {loading ? (
                  <><div className="spinner"></div> Resetting Password...</>
                ) : (
                  <>Reset Password <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                )}
              </button>

              <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: '#64748b', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                ← Back to Login
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 52, height: 52, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid #bbf7d0' }}>
                <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Password Reset Successful!</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 4 }}>Your password has been successfully reset.</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Redirecting to login page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;