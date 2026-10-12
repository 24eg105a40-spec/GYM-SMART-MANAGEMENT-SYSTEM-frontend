import React, { useState, useEffect } from 'react';
import { memberApi } from '../../api/memberApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { isValidPhone } from '../../utils/validation';

const MemberProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const data = await memberApi.getMyProfile();
        setProfile(data);
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
        });
      } catch (err) {
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError('Please provide a valid phone number.');
      return;
    }

    setSaving(true);
    try {
      const updated = await memberApi.updateMyProfile(formData);
      setProfile(updated);
      updateUserProfile({ fullName: updated.fullName, phone: updated.phone });
      setSuccess('Profile information updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading account profile..." />;
  }

  return (
    <div className="container" style={{ maxWidth: '680px' }}>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Member Profile</h1>
        <p className="dashboard-subtitle">
          Manage your personal contact details.
        </p>
      </div>

      <ErrorMessage message={error} />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-3 mb-4">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="gym-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Email Address (Registered ID)</label>
            <input
              type="email"
              className="form-control gym-input"
              value={profile?.email || ''}
              disabled
              readOnly
            />
            <small className="text-muted d-block mt-1">
              Account email cannot be altered as it serves as your primary security identity.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Account Role</label>
            <input
              type="text"
              className="form-control gym-input"
              value={profile?.role || 'MEMBER'}
              disabled
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Full Name *</label>
            <input
              type="text"
              name="fullName"
              className="form-control gym-input"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary fw-semibold">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className="form-control gym-input"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-gym-primary w-100" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberProfile;
