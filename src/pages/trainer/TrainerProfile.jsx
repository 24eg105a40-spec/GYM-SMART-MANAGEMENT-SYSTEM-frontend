import React, { useState, useEffect } from 'react';
import { trainerApi } from '../../api/trainerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const TrainerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    specialization: '',
    qualification: '',
    experienceYears: 0,
    bio: '',
    hourlyRate: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const data = await trainerApi.getMyTrainerProfile();
        setForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          qualification: data.qualification || '',
          experienceYears: data.experienceYears || 0,
          bio: data.bio || '',
          hourlyRate: data.hourlyRate || 0,
        });
      } catch (err) {
        setError('Failed to load trainer professional profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await trainerApi.updateMyTrainerProfile({
        fullName: form.fullName,
        phone: form.phone,
        specialization: form.specialization,
        qualification: form.qualification,
        experienceYears: parseInt(form.experienceYears, 10),
        bio: form.bio,
        hourlyRate: parseFloat(form.hourlyRate),
      });
      setSuccess('Professional profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your professional credentials..." />;
  }

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Trainer Professional Profile</h1>
        <p className="dashboard-subtitle">
          Update your public fitness credentials, rates, and training specialties.
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
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small text-secondary fw-semibold">Display Name *</label>
              <input
                type="text"
                name="fullName"
                className="form-control gym-input"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small text-secondary fw-semibold">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control gym-input"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Specialization Area *</label>
            <input
              type="text"
              name="specialization"
              className="form-control gym-input"
              placeholder="e.g. Strength Training, Body Recomposition, Functional Movement"
              value={form.specialization}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary fw-semibold">Certification & Qualifications *</label>
            <input
              type="text"
              name="qualification"
              className="form-control gym-input"
              placeholder="e.g. CSCS, ACE-CPT, CrossFit Level 2"
              value={form.qualification}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label small text-secondary fw-semibold">Experience (Years) *</label>
              <input
                type="number"
                min="0"
                name="experienceYears"
                className="form-control gym-input"
                value={form.experienceYears}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small text-secondary fw-semibold">Hourly / Session Rate (INR) *</label>
              <input
                type="number"
                min="0"
                step="50"
                name="hourlyRate"
                className="form-control gym-input"
                value={form.hourlyRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary fw-semibold">Professional Biography</label>
            <textarea
              name="bio"
              className="form-control gym-input"
              rows="3"
              placeholder="Summary of coaching philosophy and training methodology..."
              value={form.bio}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-gym-primary w-100" disabled={saving}>
            {saving ? 'Updating Credentials...' : 'Save Profile Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainerProfile;
