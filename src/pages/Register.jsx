import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone } from '../utils/validation';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      setError('Please provide a valid full name (at least 2 characters).');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError('Please provide a valid phone number (at least 7 digits).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData.fullName, formData.email, formData.phone, formData.password);
      setSuccess('Registration successful! Redirecting to your fitness portal...');

      // Automatically sign in the new member
      setTimeout(async () => {
        try {
          await login(formData.email, formData.password);
          navigate('/member/dashboard');
        } catch (loginErr) {
          navigate('/login');
        }
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Email may already be in use.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper py-5 px-3">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header text-center mb-4">
          <div className="auth-logo mx-auto mb-3" style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            <i className="bi bi-person-plus-fill fs-4 text-primary"></i>
          </div>
          <h2 className="auth-title text-dark fw-bold mb-1 fs-4">Create Member Account</h2>
          <p className="auth-subtitle text-secondary small mb-0">Join SmartGym to start your fitness journey</p>
        </div>

        <ErrorMessage message={error} />

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
            <i className="bi bi-check-circle-fill"></i>
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                name="fullName"
                className="form-control gym-input"
                placeholder="Alex Johnson"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                className="form-control gym-input"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="tel"
                name="phone"
                className="form-control gym-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small text-secondary fw-semibold">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control gym-input"
                placeholder="Min 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small text-secondary fw-semibold">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-control gym-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="showPassCheck"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label small text-secondary" htmlFor="showPassCheck">
              Show passwords
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-gym-primary w-100 py-2 fs-6 fw-semibold"
            disabled={submitting}
          >
            {submitting ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </span>
            ) : (
              <span>Complete Registration <i className="bi bi-arrow-right ms-1"></i></span>
            )}
          </button>
        </form>

        <div className="auth-footer text-center mt-4 text-secondary small">
          Already have an account? <Link to="/login" className="text-decoration-none fw-semibold text-primary">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
