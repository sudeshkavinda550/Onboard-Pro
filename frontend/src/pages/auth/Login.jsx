import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    try {
      const user = await login(formData);
      switch (user.role) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'hr': navigate('/hr/dashboard'); break;
        default: navigate('/employee/dashboard'); break;
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', width:'100%', display:'flex', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .lp-left {
          width: 50%; flex-shrink: 0; position: relative;
          background-image: url(/images/background.png);
          background-size: cover; background-position: center;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px; min-height: 100vh;
        }
        .lp-left::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.75) 100%);
        }
        .lp-right {
          width: 50%; flex-shrink: 0; background: #f1f5f9;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px; overflow-y: auto; min-height: 100vh;
        }
        .lp-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #fff; font-size: 14px; color: #0f172a;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit; box-sizing: border-box;
        }
        .lp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .lp-input.err { border-color: #ef4444; }
        .lp-input.err:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }
        .lp-btn {
          width: 100%; padding: 12px; border: none; border-radius: 10px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          font-family: inherit; box-shadow: 0 4px 18px rgba(99,102,241,0.38);
        }
        .lp-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(99,102,241,0.45); }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.60; cursor: not-allowed; box-shadow: none; }
        .lp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          display: flex; align-items: center; padding: 2px; transition: color 0.15s;
        }
        .lp-eye:hover { color: #6366f1; }
        .lp-remember {
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .lp-remember input[type="checkbox"] {
          width: 16px; height: 16px; cursor: pointer;
          accent-color: #6366f1; border-radius: 4px; flex-shrink: 0;
        }
        .lp-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.82); font-size: 13px; font-weight:600;
          text-decoration: none; padding: 7px 16px; border-radius: 10px;
          background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.20);
          backdrop-filter: blur(8px); transition: background 0.15s, color 0.15s;
          font-family: inherit;
        }
        .lp-back:hover { background: rgba(255,255,255,0.18); color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .lp-card { animation: slideUp 0.45s ease-out both; }
        @media (max-width: 768px) {
          .lp-left { display: none; }
          .lp-right { width: 100%; padding: 40px 24px; }
        }
      `}</style>

      {/* ── Left panel — image ── */}
      <div className="lp-left">
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:420 }}>
          <Link to="/" className="lp-back" style={{ marginBottom:52, display:'inline-flex' }}>← Back to Home</Link>

          {/* Logo mark */}
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,rgba(99,102,241,0.9),rgba(168,85,247,0.9))', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.22)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px', boxShadow:'0 8px 28px rgba(99,102,241,0.45)' }}>
            <span style={{ color:'#fff', fontWeight:800, fontSize:24 }}>O</span>
          </div>

          <h1 style={{ fontSize:40, fontWeight:800, color:'#fff', margin:'0 0 14px', lineHeight:1.15, textShadow:'0 2px 20px rgba(0,0,0,0.30)' }}>
            Streamline your<br />onboarding process
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.75)', margin:'0 0 36px', lineHeight:1.7 }}>
            Manage employees, track progress, and simplify HR workflows — all in one place.
          </p>

        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="lp-right">
        <div className="lp-card" style={{ width:'100%', maxWidth:380 }}>

          {/* Header */}
          <div style={{ marginBottom:30 }}>
            <div style={{ width:42, height:42, background:'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 4px 14px rgba(99,102,241,0.35)' }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:18 }}>O</span>
            </div>
            <h2 style={{ fontSize:26, fontWeight:800, color:'#0f172a', margin:'0 0 5px' }}>Welcome back</h2>
            <p style={{ fontSize:14, color:'#64748b', margin:0 }}>Log in to your OnboardPro account</p>
          </div>

          {/* API error */}
          {apiError && (
            <div style={{ marginBottom:18, padding:'11px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>!</span>
              </div>
              <p style={{ fontSize:13.5, color:'#dc2626', margin:0 }}>{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Email Address</label>
              <input
                name="email" type="email" autoComplete="email"
                value={formData.email} onChange={handleChange}
                className={`lp-input${errors.email ? ' err' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <p style={{ fontSize:12.5, color:'#ef4444', margin:'5px 0 0', display:'flex', alignItems:'center', gap:4 }}>⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={formData.password} onChange={handleChange}
                  className={`lp-input${errors.password ? ' err' : ''}`}
                  placeholder="••••••••" style={{ paddingRight:42 }}
                />
                <button type="button" className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    : <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  }
                </button>
              </div>
              {errors.password && <p style={{ fontSize:12.5, color:'#ef4444', margin:'5px 0 0', display:'flex', alignItems:'center', gap:4 }}>⚠ {errors.password}</p>}
            </div>

            {/* Remember me + Forgot password */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label className="lp-remember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span style={{ fontSize:13, color:'#475569', fontWeight:500, userSelect:'none' }}>Remember me</span>
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, color:'#6366f1', fontFamily:'inherit', padding:0 }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="lp-btn" style={{ marginTop:4 }}>
              {loading
                ? <><div style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Signing in…</>
                : <>Log In <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'22px 0 18px' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ fontSize:12.5, color:'#94a3b8', fontWeight:500 }}>or</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          <p style={{ textAlign:'center', fontSize:13.5, color:'#64748b', margin:0 }}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:700, color:'#6366f1', fontFamily:'inherit', padding:0 }}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;