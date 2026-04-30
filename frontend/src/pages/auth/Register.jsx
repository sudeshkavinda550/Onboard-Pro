import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

/*
  Register page — Admin-only role logic:
  - The register form only creates ADMIN accounts (the first/only self-registerable role).
  - Admins add HR Managers via the Admin panel.
  - HR Managers add Employees via the HR panel.
  - The role selector is removed entirely — every registration creates an admin.
  - This matches the hierarchy: Admin → HR Manager → Employee.
*/

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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
      // Always register as admin — HR and employees are added internally
      await register({ name: formData.name, email: formData.email, password: formData.password, role: 'admin' });
      setSuccess(true);
      setTimeout(() => {
        setRedirecting(true);
        setTimeout(() => navigate('/login', { state: { message: 'Registration successful! You can now login.', email: formData.email } }), 1500);
      }, 2200);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeOn  = () => <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
  const EyeOff = () => <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>;

  return (
    <div style={{ minHeight:'100vh', width:'100%', display:'flex', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .rp-left {
          width: 50%; flex-shrink: 0; background: #f1f5f9;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px; overflow-y: auto; min-height: 100vh;
        }
        .rp-right {
          width: 50%; flex-shrink: 0; position: relative;
          background-image: url(/images/background.png);
          background-size: cover; background-position: center;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px; min-height: 100vh;
        }
        .rp-right::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.75) 100%);
        }
        .rp-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #fff; font-size: 14px; color: #0f172a;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit; box-sizing: border-box;
        }
        .rp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rp-input.err { border-color: #ef4444; }
        .rp-input.err:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }
        .rp-btn {
          width: 100%; padding: 12px; border: none; border-radius: 10px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          font-family: inherit; box-shadow: 0 4px 18px rgba(99,102,241,0.38);
        }
        .rp-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(99,102,241,0.45); }
        .rp-btn:disabled { opacity: 0.60; cursor: not-allowed; box-shadow: none; }
        .rp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          display: flex; align-items: center; padding: 2px; transition: color 0.15s;
        }
        .rp-eye:hover { color: #6366f1; }
        .rp-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.82); font-size: 13px; font-weight: 600;
          text-decoration: none; padding: 7px 16px; border-radius: 10px;
          background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.20);
          backdrop-filter: blur(8px); transition: background 0.15s, color 0.15s; font-family: inherit;
        }
        .rp-back:hover { background: rgba(255,255,255,0.18); color: #fff; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .rp-card { animation: slideUp 0.45s ease-out both; }
        .fade-up { animation: fadeUp 0.22s ease-out; }
        @media (max-width: 768px) {
          .rp-right { display: none; }
          .rp-left { width: 100%; padding: 40px 24px; }
        }
      `}</style>

      {/* ── Left panel — form ── */}
      <div className="rp-left">
        <div className="rp-card" style={{ width:'100%', maxWidth:400 }}>

          {/* Header */}
          <div style={{ marginBottom:26 }}>
            <div style={{ width:42, height:42, background:'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 4px 14px rgba(99,102,241,0.35)' }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:18 }}>O</span>
            </div>
            <h2 style={{ fontSize:25, fontWeight:800, color:'#0f172a', margin:'0 0 5px' }}>Create your account</h2>
            <p style={{ fontSize:13.5, color:'#64748b', margin:0 }}>Set up OnboardPro for your organisation</p>
          </div>

          {success ? (
            /* ── Success state ── */
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:64, height:64, background:'linear-gradient(135deg,#dcfce7,#bbf7d0)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'3px solid #86efac', boxShadow:'0 4px 18px rgba(34,197,94,0.22)' }}>
                <svg width="28" height="28" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:'0 0 6px' }}>Account Created!</h3>
              <p style={{ fontSize:13.5, color:'#475569', margin:'0 0 4px' }}>Welcome to OnboardPro, <strong>{formData.name}</strong>!</p>
              <p style={{ fontSize:12.5, color:'#94a3b8', margin:'0 0 24px' }}>Your admin account is ready. You'll be redirected to login shortly.</p>
              {redirecting ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <div style={{ display:'flex', gap:6 }}>
                    {[0,0.18,0.36].map((d,i) => (
                      <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#a855f7)', animation:`spin 1.2s ease-in-out ${d}s infinite` }} />
                    ))}
                  </div>
                  <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Redirecting to login…</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button onClick={() => navigate('/login')} className="rp-btn">Go to Login</button>
                  <button onClick={() => navigate('/')} style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:10, background:'#fff', color:'#64748b', fontSize:13.5, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Back to Home</button>
                </div>
              )}
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {apiError && (
                <div className="fade-up" style={{ padding:'11px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>!</span>
                  </div>
                  <p style={{ fontSize:13.5, color:'#dc2626', margin:0 }}>{apiError}</p>
                </div>
              )}

              {/* Full name */}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Full Name <span style={{ color:'#ef4444' }}>*</span></label>
                <input name="name" type="text" autoComplete="name"
                  value={formData.name} onChange={handleChange}
                  className={`rp-input${errors.name ? ' err' : ''}`} placeholder="John Doe" />
                {errors.name && <p className="fade-up" style={{ fontSize:12.5, color:'#ef4444', margin:'5px 0 0' }}>⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Email Address <span style={{ color:'#ef4444' }}>*</span></label>
                <input name="email" type="email" autoComplete="email"
                  value={formData.email} onChange={handleChange}
                  className={`rp-input${errors.email ? ' err' : ''}`} placeholder="you@company.com" />
                {errors.email && <p className="fade-up" style={{ fontSize:12.5, color:'#ef4444', margin:'5px 0 0' }}>⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Password <span style={{ color:'#ef4444' }}>*</span></label>
                <div style={{ position:'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    value={formData.password} onChange={handleChange}
                    className={`rp-input${errors.password ? ' err' : ''}`}
                    placeholder="Min. 6 characters" style={{ paddingRight:42 }} />
                  <button type="button" className="rp-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOn /> : <EyeOff />}
                  </button>
                </div>
                {errors.password && <p className="fade-up" style={{ fontSize:12.5, color:'#ef4444', margin:'5px 0 0' }}>⚠ {errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Confirm Password <span style={{ color:'#ef4444' }}>*</span></label>
                <div style={{ position:'relative' }}>
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                    value={formData.confirmPassword} onChange={handleChange}
                    className={`rp-input${errors.confirmPassword ? ' err' : ''}`}
                    placeholder="••••••••" style={{ paddingRight:42 }} />
                  <button type="button" className="rp-eye" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOn /> : <EyeOff />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="fade-up" style={{ fontSize:12.5, color:'#ef4444', margin:'5px 0 0' }}>⚠ {errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                <input id="terms" type="checkbox" required
                  style={{ width:15, height:15, marginTop:2, accentColor:'#6366f1', cursor:'pointer', flexShrink:0 }} />
                <label htmlFor="terms" style={{ fontSize:12.5, color:'#64748b', cursor:'pointer', lineHeight:1.55 }}>
                  I agree to the{' '}
                  <a href="/terms" style={{ color:'#6366f1', textDecoration:'none', fontWeight:600 }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" style={{ color:'#6366f1', textDecoration:'none', fontWeight:600 }}>Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="rp-btn" style={{ marginTop:4 }}>
                {loading
                  ? <><div style={{ width:15, height:15, border:'2.5px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Creating account…</>
                  : <>Create Admin Account <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
                }
              </button>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
                <span style={{ fontSize:12.5, color:'#94a3b8', fontWeight:500 }}>or</span>
                <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
              </div>

              <p style={{ textAlign:'center', fontSize:13.5, color:'#64748b', margin:0 }}>
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:700, color:'#6366f1', fontFamily:'inherit', padding:0 }}>
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── Right panel — image ── */}
      <div className="rp-right">
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:420 }}>
          <Link to="/" className="rp-back" style={{ marginBottom:52, display:'inline-flex' }}>← Back to Home</Link>

          <div style={{ width:56, height:56, background:'linear-gradient(135deg,rgba(99,102,241,0.9),rgba(168,85,247,0.9))', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.22)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px', boxShadow:'0 8px 28px rgba(99,102,241,0.45)' }}>
            <span style={{ color:'#fff', fontWeight:800, fontSize:24 }}>O</span>
          </div>

          <h1 style={{ fontSize:38, fontWeight:800, color:'#fff', margin:'0 0 14px', lineHeight:1.15, textShadow:'0 2px 20px rgba(0,0,0,0.30)' }}>
            Start your journey<br />with OnboardPro
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.75)', margin:'0 0 36px', lineHeight:1.7 }}>
            Join companies already using OnboardPro to build better employee experiences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;