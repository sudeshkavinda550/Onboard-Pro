import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateForm = () => {
    if (!email) { setError('Email is required'); return false; }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) { setError('Invalid email address'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const response = await forgotPassword(email);
      setSuccess(true);
      setMessage(response.message || 'Password reset OTP sent to your email!');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReset = () => {
    if (email) navigate('/reset-password', { state: { email } });
    else setError('Please enter your email first');
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%', position: 'fixed', inset: 0,
      backgroundImage: 'url(/images/background.png)', backgroundSize: 'cover',
      backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .fp-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%); }
        .fp-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #fff; font-size: 14px; color: #0f172a; outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit; box-sizing: border-box;
        }
        .fp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
        .fp-input.err { border-color: #ef4444; }
        .fp-input.err:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
        .fp-btn {
          width: 100%; padding: 12px; border: none; border-radius: 10px; background: #2563eb;
          color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s ease, transform 0.1s ease; font-family: inherit;
        }
        .fp-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-back-link {
          position: absolute; top: 20px; left: 20px; z-index: 20;
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.85); font-size: 13.5px; font-weight: 500;
          text-decoration: none; padding: 7px 14px; border-radius: 10px;
          background: rgba(0,0,0,0.25); transition: background 0.15s ease;
        }
        .fp-back-link:hover { background: rgba(0,0,0,0.4); color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
      `}</style>

      <div className="fp-overlay"></div>
      <Link to="/" className="fp-back-link">← Back to Home</Link>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, margin: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>O</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Forgot Password?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>Enter your email to receive OTP</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
          {!success ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>⚠</span>
                  <p style={{ fontSize: 13.5, color: '#dc2626', margin: 0 }}>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={handleChange} className={`fp-input${error ? ' err' : ''}`} placeholder="you@example.com" />
              </div>

              <div style={{ padding: '10px 13px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: '#1d4ed8', margin: 0 }}>We'll send a 6-digit OTP to your email. This OTP will expire in 10 minutes.</p>
              </div>

              <button type="submit" disabled={loading} className="fp-btn">
                {loading ? (
                  <><div className="spinner"></div> Sending OTP...</>
                ) : (
                  <>Send OTP <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                )}
              </button>

              <button type="button" onClick={handleGoToReset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: '#64748b', fontFamily: 'inherit', padding: 0, textAlign: 'center' }}>
                Already have OTP? Reset Password
              </button>

              <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: '#64748b', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                ← Back to Log In
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 52, height: 52, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid #bbf7d0' }}>
                <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>OTP Sent Successfully!</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 4 }}>{message}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Redirecting to reset password page...</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => navigate('/reset-password', { state: { email } })} className="fp-btn">Go to Reset Password</button>
                <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '11px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Back to Login</button>
              </div>
            </div>
          )}
        </div>

        {!success && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgba(255,255,255,0.8)', marginTop: 16 }}>
            Remember your password?{' '}
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: '#fff', fontFamily: 'inherit', padding: 0 }}>Log in</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;