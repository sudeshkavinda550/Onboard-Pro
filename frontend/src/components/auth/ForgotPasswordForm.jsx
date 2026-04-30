import React, { useState } from 'react';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError('Invalid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log('Forgot password email:', email);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }, 1500);
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="h-screen w-full fixed inset-0 overflow-hidden" style={{
      backgroundImage: 'url(/images/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>

      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-lg"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>

      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => window.location.href = '/'}
          className="text-white hover:text-blue-200 transition-colors flex items-center gap-2 font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      </div>

      <div className="relative h-full w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md transform scale-100 sm:scale-105">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-2xl">Forgot Password?</h2>
            <p className="text-lg text-white/90 drop-shadow-lg">Enter your email to reset your password</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-900/40 p-8 border-2 border-white/60">
            {!success ? (
              <div className="space-y-6">

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 border ${
                      error ? 'border-red-400' : 'border-gray-300'
                    } rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm`}
                    placeholder="you@example.com"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleBackToLogin}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>←</span>
                    <span>Back to Log In</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Sent!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Redirecting to login page...
                </p>
              </div>
            )}
          </div>

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-white/90">
                Remember your password?{' '}
                <button
                  onClick={handleBackToLogin}
                  className="font-medium text-white hover:text-blue-200 transition-colors"
                >
                  Log in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        /* Remove scrollbar */
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;