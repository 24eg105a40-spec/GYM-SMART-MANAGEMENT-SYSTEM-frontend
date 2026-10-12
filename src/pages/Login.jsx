import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'TRAINER') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || (!err.response ? 'Unable to connect to backend server. Please ensure the backend is running.' : 'Invalid email or password. Please verify credentials.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper py-5 px-3">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header text-center mb-4">
          <div className="auth-logo mx-auto mb-3" style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-lock-fill fs-4 text-primary"></i>
          </div>
          <h2 className="auth-title text-dark fw-bold mb-1 fs-4">Welcome Back</h2>
          <p className="auth-subtitle text-secondary small mb-0">Sign in to your SmartGym management portal</p>
        </div>

        {location.search.includes('expired=true') && (
          <div className="alert alert-warning small py-2 mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-clock-history"></i>
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control gym-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small text-secondary fw-semibold mb-0">Password</label>
            </div>
            <div className="password-input-group position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control gym-input pe-5"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none pe-3"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                style={{ zIndex: 5 }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gym-primary w-100 py-2 fs-6 fw-semibold"
            disabled={submitting}
          >
            {submitting ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Authenticating...
              </span>
            ) : (
              <span>Sign In to Dashboard <i className="bi bi-arrow-right ms-1"></i></span>
            )}
          </button>
        </form>

        {/* Demo Quick Fill for Evaluators / Faculty */}
        <div className="mt-4 pt-3 border-top">
          <div className="text-secondary small fw-semibold mb-2 text-center" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            DEMO QUICK-FILL ACCOUNTS (CLICK TO AUTOFILL):
          </div>
          <div className="d-flex flex-wrap gap-1 justify-content-center">
            <button
              type="button"
              className="btn btn-sm btn-light border text-secondary py-1 px-2"
              style={{ fontSize: '0.75rem' }}
              onClick={() => handleDemoFill('admin@gym.com', 'Admin@123')}
            >
              👑 Admin (Admin@123)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light border text-secondary py-1 px-2"
              style={{ fontSize: '0.75rem' }}
              onClick={() => handleDemoFill('marcus.trainer@gym.com', 'Trainer@123')}
            >
              ⚡ Trainer (Trainer@123)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light border text-secondary py-1 px-2"
              style={{ fontSize: '0.75rem' }}
              onClick={() => handleDemoFill('abhi@gmail.com', 'abhi123')}
            >
              🏋️ Member (abhi123)
            </button>
          </div>
        </div>

        <div className="auth-footer text-center mt-4 text-secondary small">
          Don't have an account? <Link to="/register" className="text-decoration-none fw-semibold text-primary">Register as Member</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
